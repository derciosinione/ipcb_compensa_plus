import asyncio
import logging
from aio_pika import connect_robust, Connection, Channel
from .config import settings

logger = logging.getLogger(__name__)

class RabbitMQClient:
    def __init__(self):
        self.url = settings.RABBITMQ_URL
        self.connection: Connection | None = None
        self.channel: Channel | None = None

    async def connect(self):
        logger.info(f"Connecting to RabbitMQ at {self.url}...")
        self.connection = await connect_robust(self.url)
        self.channel = await self.connection.channel()
        logger.info("Connected to RabbitMQ.")

    async def close(self):
        if self.connection:
            await self.connection.close()
            logger.info("Closed RabbitMQ connection.")

rabbitmq_client = RabbitMQClient()
