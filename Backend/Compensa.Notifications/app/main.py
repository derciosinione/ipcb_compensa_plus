import logging
from pythonjsonlogger import jsonlogger
from datetime import datetime
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import time
import uuid
from sqlalchemy import text
from opentelemetry import trace, metrics, _logs
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk._logs import LoggerProvider, LoggingHandler
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.sdk._logs.export import BatchLogRecordProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import OTLPMetricExporter
from opentelemetry.exporter.otlp.proto.grpc._log_exporter import OTLPLogExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.sdk.resources import SERVICE_NAME, Resource

from .core.config import settings
from .core.rabbitmq import rabbitmq_client
from .core.database import engine, Base
from .services.consumer import start_consumers
from .api import router as api_router
import app.models # Import models to register them with Base

resource = Resource(attributes={
    SERVICE_NAME: "Compensa.Notifications"
})

# Tracing
provider = TracerProvider(resource=resource)
processor = BatchSpanProcessor(OTLPSpanExporter(endpoint=os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://otel-collector:4317"), insecure=True))
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)

# Metrics
meter_provider = MeterProvider(resource=resource, metric_readers=[PeriodicExportingMetricReader(OTLPMetricExporter(endpoint=os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://otel-collector:4317"), insecure=True))])
metrics.set_meter_provider(meter_provider)

# Logs
logger_provider = LoggerProvider(resource=resource)
logger_provider.add_log_record_processor(BatchLogRecordProcessor(OTLPLogExporter(endpoint=os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://otel-collector:4317"), insecure=True)))
_logs.set_logger_provider(logger_provider)

# JSON Logging for Console (Loki)
class CustomJsonFormatter(jsonlogger.JsonFormatter):
    def add_fields(self, log_record, record, message_dict):
        super(CustomJsonFormatter, self).add_fields(log_record, record, message_dict)
        log_record['timestamp'] = datetime.utcnow().isoformat() + 'Z'
        log_record['level'] = record.levelname
        log_record['service'] = 'compensa-notifications'
        log_record['environment'] = os.getenv("ASPNETCORE_ENVIRONMENT", "Development")
        log_record['event'] = log_record.get('event', 'notifications.log')
        
        # OpenTelemetry integration
        current_span = trace.get_current_span()
        if current_span.get_span_context().is_valid:
            log_record['traceId'] = format(current_span.get_span_context().trace_id, '032x')
            log_record['spanId'] = format(current_span.get_span_context().span_id, '016x')

logHandler = logging.StreamHandler()
formatter = CustomJsonFormatter('%(timestamp)s %(level)s %(name)s %(message)s')
logHandler.setFormatter(formatter)

# Override default loggers
for logger_name in ("uvicorn", "uvicorn.access", "uvicorn.error", "fastapi"):
    l = logging.getLogger(logger_name)
    l.handlers = [logHandler]
    l.propagate = False

logging.getLogger().addHandler(logHandler)
logging.getLogger().setLevel(logging.INFO)
logger = logging.getLogger(__name__)

async def ensure_schema_compatibility(conn):
    result = await conn.execute(text(
        """
        select data_type
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'notifications'
          and column_name = 'id'
        """
    ))
    id_type = result.scalar_one_or_none()

    if id_type and id_type not in ("character varying", "text"):
        logger.warning("Dropping legacy notifications table with non-UUID id column.")
        await conn.execute(text("drop table if exists notifications"))

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    logger.info("Starting up Notification Microservice...")
    
    # Initialize DB
    async with engine.begin() as conn:
        await ensure_schema_compatibility(conn)
        await conn.run_sync(Base.metadata.create_all)
        logger.info("Database initialized.")

    await rabbitmq_client.connect()
    await start_consumers()
    yield
    # Shutdown logic
    logger.info("Shutting down Notification Microservice...")
    await rabbitmq_client.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

@app.middleware("http")
async def structured_logging_middleware(request: Request, call_next):
    start_time = time.time()
    correlation_id = request.headers.get("X-Correlation-ID", str(uuid.uuid4()))
    trace_id = format(trace.get_current_span().get_span_context().trace_id, '032x') if trace.get_current_span().get_span_context().is_valid else None
    
    response = await call_next(request)
    
    duration_ms = int((time.time() - start_time) * 1000)
    
    log_data = {
        "event": "notifications.request.processed",
        "correlationId": correlation_id,
        "request": {
            "method": request.method,
            "path": request.url.path
        },
        "response": {
            "statusCode": response.status_code,
            "durationMs": duration_ms
        }
    }
    
    logging.info("Request processed", extra=log_data)
    
    response.headers["X-Correlation-ID"] = correlation_id
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

FastAPIInstrumentor.instrument_app(app)

@app.get("/health")
async def health() -> dict[str, str]:
    return {
        "status": "Healthy", 
        "service": "compensa-notifications",
        "rabbitmq": "connected" if rabbitmq_client.connection and not rabbitmq_client.connection.is_closed else "disconnected"
    }
