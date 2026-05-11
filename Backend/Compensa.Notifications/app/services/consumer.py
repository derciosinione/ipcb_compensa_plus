import json
import logging
from aio_pika import IncomingMessage
from ..core.rabbitmq import rabbitmq_client

logger = logging.getLogger(__name__)

from sqlalchemy.future import select
from .email import send_email_async
from ..models import Notification, NotificationPreference
from ..core.database import AsyncSessionLocal

async def process_message(message: IncomingMessage):
    async with message.process():
        body = message.body.decode()
        try:
            payload = json.loads(body)
            actual_message = payload.get("message", payload)
            message_type_arr = payload.get("messageType", [])
            message_type = message_type_arr[0] if message_type_arr else "Unknown"
            
            logger.info(f"Processing event: {message_type}")
            
            async with AsyncSessionLocal() as db:
                if "UserRegisteredEvent" in message_type:
                    await handle_user_registered(actual_message, db)
                elif "RequestCreatedEvent" in message_type:
                    await handle_request_created(actual_message, db)
                elif "RequestStatusUpdatedEvent" in message_type:
                    await handle_request_status_updated(actual_message, db)
                    
        except Exception as e:
            logger.error(f"Error processing message: {e}")

async def handle_user_registered(data: dict, db):
    user_id = data.get("userId")
    email = data.get("email")
    if not user_id: return
    
    # Check if preference already exists
    pref = await db.execute(select(NotificationPreference).filter_by(user_id=user_id))
    if not pref.scalar_one_or_none():
        new_pref = NotificationPreference(user_id=user_id, email=email, email_enabled=True)
        db.add(new_pref)
        await db.commit()
        logger.info(f"Created default notification preferences for user {user_id}")

async def handle_request_created(data: dict, db):
    coordinator_id = data.get("coordinatorUserId")
    teacher_name = data.get("teacherName")
    
    if not coordinator_id: return
    
    title = "New Compensation Request"
    msg = f"Teacher {teacher_name} has requested a compensation class for course {data.get('courseId')}."
    
    notification = Notification(
        user_id=coordinator_id,
        title=title,
        message=msg,
        type="RequestCreated"
    )
    db.add(notification)
    await db.commit()
    
    await notify_user(coordinator_id, title, msg, db)

async def handle_request_status_updated(data: dict, db):
    teacher_id = data.get("teacherUserId")
    coordinator_id = data.get("coordinatorUserId")
    updated_by = data.get("updatedByUserId")
    status = data.get("status")
    comment = data.get("decisionComment") or "No comments provided."
    
    # Determine the target user (the one who DID NOT make the update)
    target_user_id = teacher_id if updated_by == coordinator_id else coordinator_id
    
    if not target_user_id: return
    
    if target_user_id == teacher_id:
        title = f"Request Status Updated: {status}"
        msg = f"Your request status is now '{status}'. Coordinator notes: {comment}"
    else:
        title = f"Compensation Request Updated to {status}"
        msg = f"A teacher has updated a compensation request to '{status}'. Notes: {comment}"
    
    notification = Notification(
        user_id=target_user_id,
        title=title,
        message=msg,
        type="RequestStatusUpdated"
    )
    db.add(notification)
    await db.commit()
    
    await notify_user(target_user_id, title, msg, db)

async def notify_user(user_id: str, subject: str, message: str, db):
    result = await db.execute(select(NotificationPreference).filter_by(user_id=user_id))
    pref = result.scalar_one_or_none()
    
    if pref and pref.email_enabled and pref.email:
        await send_email_async(pref.email, subject, message)


async def start_consumers():
    if not rabbitmq_client.channel:
        logger.error("RabbitMQ channel is not initialized.")
        return

    # Declare a queue for notifications
    queue = await rabbitmq_client.channel.declare_queue(
        "notifications-service-queue",
        durable=True
    )
    
    # MassTransit creates exchanges based on the message type namespace and name
    exchanges_to_bind = [
        "CompensaIdentityApi.IntegrationEvents:UserRegisteredEvent",
        "CompensaCoreApi.IntegrationEvents:RequestCreatedEvent",
        "CompensaCoreApi.IntegrationEvents:RequestStatusUpdatedEvent"
    ]
    
    for exchange_name in exchanges_to_bind:
        # Declare the exchange (MassTransit uses fanout)
        exchange = await rabbitmq_client.channel.declare_exchange(
            exchange_name,
            type="fanout",
            durable=True
        )
        # Bind the queue to the exchange
        await queue.bind(exchange)

    
    # Start consuming
    await queue.consume(process_message)
    logger.info("Started consuming from notifications-service-queue.")
