from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import time
import uuid
import nest_asyncio
import os
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
import logging
from pythonjsonlogger import jsonlogger
from datetime import datetime

nest_asyncio.apply()

resource = Resource(attributes={
    SERVICE_NAME: "Compensa.AI"
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
        log_record['service'] = 'compensa-ai'
        log_record['environment'] = os.getenv("COMPENSA_AI_ENVIRONMENT", "development")
        log_record['event'] = log_record.get('event', 'ai.log')
        
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

app = FastAPI(title="CompensaAI", version="0.1.0")

from app.api.routes import chat

@app.middleware("http")
async def structured_logging_middleware(request: Request, call_next):
    start_time = time.time()
    correlation_id = request.headers.get("X-Correlation-ID", str(uuid.uuid4()))
    trace_id = format(trace.get_current_span().get_span_context().trace_id, '032x') if trace.get_current_span().get_span_context().is_valid else None
    
    response = await call_next(request)
    
    duration_ms = int((time.time() - start_time) * 1000)
    
    log_data = {
        "event": "ai.request.processed",
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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api/chat", tags=["chat"])

FastAPIInstrumentor.instrument_app(app)

@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "Healthy", "service": "compensa-ai"}
