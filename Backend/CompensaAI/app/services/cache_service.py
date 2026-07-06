import redis.asyncio as redis
import json
import hashlib
import os
import logging
from typing import Any, Optional

logger = logging.getLogger(__name__)

class CacheService:
    def __init__(self):
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        self._redis = None

    async def _get_redis(self):
        if self._redis is None:
            self._redis = redis.from_url(self.redis_url, decode_responses=True)
        return self._redis

    def generate_key(self, content: str, context: Optional[dict] = None) -> str:
        # Create a unique key based on the prompt and user context
        payload = {
            "content": content,
            "context": context
        }
        hash_obj = hashlib.sha256(json.dumps(payload, sort_keys=True).encode())
        return f"ai_cache:{hash_obj.hexdigest()}"

    async def get(self, key: str) -> Optional[dict]:
        try:
            r = await self._get_redis()
            data = await r.get(key)
            if data:
                logger.info(f"Cache hit for key: {key}")
                return json.loads(data)
            return None
        except Exception as e:
            logger.error(f"Redis get error: {e}")
            return None

    async def set(self, key: str, value: Any, ttl: int = 3600):
        try:
            r = await self._get_redis()
            await r.set(key, json.dumps(value), ex=ttl)
            logger.info(f"Cache set for key: {key} with TTL {ttl}")
        except Exception as e:
            logger.error(f"Redis set error: {e}")

cache_service = CacheService()
