from opentelemetry import metrics

meter = metrics.get_meter("Compensa.Notifications.Business")

notifications_created = meter.create_counter(
    "compensa_notifications_created_total",
    unit="{notification}",
    description="Number of notifications created by type.",
)

notifications_read = meter.create_counter(
    "compensa_notifications_read_total",
    unit="{notification}",
    description="Number of notifications marked as read.",
)

notification_events_consumed = meter.create_counter(
    "compensa_notifications_events_consumed_total",
    unit="{event}",
    description="Number of RabbitMQ integration events consumed.",
)

notification_event_failures = meter.create_counter(
    "compensa_notifications_event_failures_total",
    unit="{event}",
    description="Number of RabbitMQ integration events that failed processing.",
)

email_deliveries = meter.create_counter(
    "compensa_notifications_email_deliveries_total",
    unit="{email}",
    description="Number of notification email delivery attempts.",
)

preferences_updated = meter.create_counter(
    "compensa_notifications_preferences_updated_total",
    unit="{preference}",
    description="Number of notification preference updates.",
)


def record_notification_created(notification_type: str) -> None:
    notifications_created.add(1, {"type": notification_type})


def record_notification_read() -> None:
    notifications_read.add(1)


def record_event_consumed(event_type: str) -> None:
    notification_events_consumed.add(1, {"event_type": event_type})


def record_event_failure(event_type: str) -> None:
    notification_event_failures.add(1, {"event_type": event_type})


def record_email_delivery(outcome: str) -> None:
    email_deliveries.add(1, {"outcome": outcome})


def record_preferences_updated(email_enabled: bool) -> None:
    preferences_updated.add(1, {"email_enabled": str(email_enabled).lower()})
