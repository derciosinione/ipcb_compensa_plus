from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    PROJECT_NAME: str = "Compensa AI API"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api"
    
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    CORE_API_URL: str = "http://core-api:8080"
    NOTIFICATIONS_API_URL: str = "http://notifications-api:8000"
    DATABASE_URL: str = ""
    JWT_SIGNING_KEY: str = ""
    JWT_ISSUER: str = "Compensa.Identity"
    JWT_AUDIENCE: str = "Compensa.Api"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

@lru_cache
def get_settings() -> Settings:
    return Settings()
