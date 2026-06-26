# Compensa Runbook

## Local Compose

Create a local `.env` before starting Docker:

```bash
cp .env.example .env
```

Set at least `POSTGRES_PASSWORD` and `JWT_SIGNING_KEY`. The compose files intentionally fail when these are missing, instead of using secret defaults.

Start the full local stack:

```bash
docker compose up --build
```

Core endpoints:

- Frontend: `http://localhost:5173`
- Gateway: `http://localhost:5005`
- Identity API: `http://localhost:5002`
- Core API: `http://localhost:5001`
- Notifications API: `http://localhost:8001`
- CompensaAI: `http://localhost:8000`

In Docker, the frontend is built as static assets and served by Nginx. The production container also proxies `/api/*` to `api-gateway:8080`, so the default Docker build uses `VITE_API_URL=/api`.

Observability endpoints:

- Grafana: `http://localhost:3000`
- Prometheus: `http://localhost:9090`
- Aspire Dashboard: `http://localhost:18888`
- Loki: `http://localhost:3100`
- Tempo: `http://localhost:3200`
- OpenTelemetry Collector metrics: `http://localhost:8889/metrics`

## Docker Swarm

Build local images and deploy the full stack:

```bash
./scripts/stack-up.sh
```

Options:

```bash
STACK_NAME=compensa STACK_FILE=docker-stack.yml ./scripts/stack-up.sh
SKIP_BUILD=true ./scripts/stack-up.sh
```

Check service state:

```bash
docker stack services compensa
docker stack ps compensa
```

Remove the stack:

```bash
./scripts/stack-destroy.sh
```

By default, destroy keeps data volumes and leaves Swarm active. For a full local cleanup:

```bash
REMOVE_VOLUMES=true LEAVE_SWARM=false ./scripts/stack-destroy.sh
```

For multi-node deployments, push the `compensa-*:local` images to a registry and update the image names in `docker-stack.yml`.

## Azure Production Deploy

The Azure deployment assets are in:

```text
infra/terraform/azure
infra/ansible
.github/workflows/azure-infra.yml
.github/workflows/azure-deploy.yml
```

See `docs/deploy-azure.md` for the VM topology, required GitHub Secrets and the deploy sequence.

## Smoke Test

Run the infrastructure smoke test after the stack is up:

```bash
./scripts/smoke-infra.sh
```

The script checks:

- frontend and gateway health;
- backend service health endpoints;
- Prometheus readiness and query API;
- OpenTelemetry Collector metrics endpoint;
- Grafana health, Prometheus datasource, and provisioned dashboard;
- Aspire dashboard availability.

Override endpoints when needed:

```bash
GRAFANA_URL=http://server:3000 PROMETHEUS_URL=http://server:9090 ./scripts/smoke-infra.sh
```

## Generate Useful Traffic

Metrics appear after the matching flow runs at least once.

Recommended smoke flow:

1. Open the frontend.
2. Request a magic link login.
3. Verify the magic link.
4. Create a compensation request.
5. Change request status as coordinator/admin.
6. Upload a document to a request.
7. Open notifications and mark one as read.
8. Send a message through CompensaAI.

For E2E frontend tests with mocked backend:

```bash
pnpm --dir Frontend test:e2e
```

For a future full-stack E2E profile, point Playwright at `http://localhost:5005` and avoid route mocks.

## Metrics

Grafana dashboard:

- folder: `Compensa`
- dashboard: `Compensa Service Metrics`

Important Prometheus metrics:

- `compensa_identity_magic_links_requested_total`
- `compensa_identity_magic_links_verified_total`
- `compensa_identity_auth_sessions_issued_total`
- `compensa_core_compensation_requests_created_total`
- `compensa_core_compensation_request_status_changes_total`
- `compensa_core_compensation_request_decision_latency_hours`
- `compensa_notifications_created_total`
- `compensa_notifications_events_consumed_total`
- `compensa_notifications_event_failures_total`
- `compensa_ai_chat_requests_total`
- `compensa_ai_chat_failures_total`
- `compensa_ai_chat_latency_seconds`

Technical HTTP/runtime metrics are exported by OpenTelemetry instrumentation.

## Alerts

Prometheus alert rules are in:

```text
docker/prometheus/alert_rules.yml
```

Grafana alerting provisioning is in:

```text
docker/grafana/provisioning/alerting/rules.yaml
```

Current alert coverage:

- service down;
- high span error rate;
- high HTTP 5xx rate;
- missing HTTP telemetry;
- invalid magic link spike;
- notification event failures;
- high AI chat failure rate;
- high AI chat latency;
- high compensation request decision latency.

## Troubleshooting

Check running containers:

```bash
docker compose ps
```

Check service logs:

```bash
docker compose logs -f api-gateway
docker compose logs -f identity-api
docker compose logs -f core-api
docker compose logs -f notifications-api
docker compose logs -f compensa-ai
docker compose logs -f otel-collector
```

Check Swarm logs:

```bash
docker service logs compensa_api-gateway
docker service logs compensa_core-api
docker service logs compensa_notifications-api
docker service logs compensa_otel-collector
```

If metrics are missing:

1. Confirm services have `OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4317`.
2. Open `http://localhost:8889/metrics` and search for `target_info`.
3. In Prometheus, query `up`.
4. Generate real traffic for custom business metrics.
5. Restart Grafana if a newly added dashboard or alert rule is not loaded.

If Grafana dashboard is missing:

1. Check `docker/grafana/provisioning/dashboards/dashboards.yaml`.
2. Check `docker/grafana/provisioning/dashboards/compensa-service-metrics.json`.
3. Restart Grafana.

If Aspire is empty:

1. Confirm `otel-collector` is running.
2. Confirm Aspire is reachable at `http://localhost:18888`.
3. Confirm `docker/otel-collector/config.yaml` exports metrics/logs/traces to `otlp/aspire`.

## Security Notes

Do not commit real secrets. Keep local secrets in an ignored `.env` file or use Docker secrets in Swarm.
