import logging
from email.message import EmailMessage
import aiosmtplib
from ..core.config import settings
from ..metrics import record_email_delivery

logger = logging.getLogger(__name__)

async def send_email_async(to_email: str, subject: str, content: str):
    if not settings.EMAIL_USERNAME or not settings.EMAIL_SMTP_HOST:
        logger.warning("Email configuration is missing. Cannot send email.")
        record_email_delivery("skipped_missing_config")
        return

    message = EmailMessage()
    message["From"] = f"{settings.EMAIL_FROM_NAME} <{settings.EMAIL_FROM_ADDRESS}>"
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(content)

    try:
        await aiosmtplib.send(
            message,
            hostname=settings.EMAIL_SMTP_HOST,
            port=settings.EMAIL_SMTP_PORT,
            username=settings.EMAIL_USERNAME,
            password=settings.EMAIL_PASSWORD,
            use_tls=False,
            start_tls=True,
        )
        logger.info(f"Email successfully sent to {to_email}")
        record_email_delivery("sent")
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        record_email_delivery("failed")
