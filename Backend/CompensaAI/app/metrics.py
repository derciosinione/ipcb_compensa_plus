from opentelemetry import metrics

meter = metrics.get_meter("Compensa.AI.Business")

chat_requests = meter.create_counter(
    "compensa_ai_chat_requests_total",
    unit="{request}",
    description="Number of AI chat requests.",
)

chat_failures = meter.create_counter(
    "compensa_ai_chat_failures_total",
    unit="{request}",
    description="Number of failed AI chat requests.",
)

chat_latency = meter.create_histogram(
    "compensa_ai_chat_latency_seconds",
    unit="s",
    description="AI chat request latency.",
)

file_uploads = meter.create_counter(
    "compensa_ai_file_uploads_total",
    unit="{file}",
    description="Number of files uploaded for AI context.",
)

threads_deleted = meter.create_counter(
    "compensa_ai_threads_deleted_total",
    unit="{thread}",
    description="Number of AI threads deleted.",
)


def record_chat_request(provider: str, response_type: str, duration_seconds: float) -> None:
    attributes = {"provider": provider, "response_type": response_type}
    chat_requests.add(1, attributes)
    chat_latency.record(duration_seconds, attributes)


def record_chat_failure(provider: str) -> None:
    chat_failures.add(1, {"provider": provider})


def record_file_upload(outcome: str) -> None:
    file_uploads.add(1, {"outcome": outcome})


def record_thread_deleted(outcome: str) -> None:
    threads_deleted.add(1, {"outcome": outcome})
