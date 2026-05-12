import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from .core.config import settings
from .core.rabbitmq import rabbitmq_client
from .core.database import engine, Base
from .services.consumer import start_consumers
from .api import router as api_router
import app.models # Import models to register them with Base

logging.basicConfig(level=logging.INFO)
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/health")
async def health() -> dict[str, str]:
    return {
        "status": "ok", 
        "service": "compensa-notifications",
        "rabbitmq": "connected" if rabbitmq_client.connection and not rabbitmq_client.connection.is_closed else "disconnected"
    }
