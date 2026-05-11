from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Compensa.Notifications"
    VERSION: str = "0.1.0"
    RABBITMQ_URL: str = "amqp://guest:guest@localhost:5672/"
    DATABASE_URL: str = "postgresql+asyncpg://compensa:compensa_dev_password@localhost:5432/CompensaNotificationsDB"
    
    JWT_SIGNING_KEY: str = "CHANGE_ME_DEVELOPMENT_SIGNING_KEY_32_CHARS_MINIMUM"
    JWT_ISSUER: str = "Compensa.Identity"
    JWT_AUDIENCE: str = "Compensa.Api"
    
    EMAIL_SMTP_HOST: str = "smtp.privateemail.com"
    EMAIL_SMTP_PORT: int = 587
    EMAIL_USERNAME: str = "info@kiaricode.com"
    EMAIL_PASSWORD: str = ""
    EMAIL_FROM_ADDRESS: str = "info@kiaricode.com"
    EMAIL_FROM_NAME: str = "Compensa+"


    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
