#!/usr/bin/env bash
set -euo pipefail

STACK_NAME="${STACK_NAME:-compensa}"
STACK_FILE="${STACK_FILE:-docker-stack.yml}"
SKIP_BUILD="${SKIP_BUILD:-false}"
FORCE_LOCAL_UPDATE="${FORCE_LOCAL_UPDATE:-true}"

cd "$(dirname "$0")/.."

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required but was not found in PATH." >&2
  exit 1
fi

if [ ! -f "$STACK_FILE" ]; then
  echo "Stack file not found: $STACK_FILE" >&2
  exit 1
fi

if [ ! -f ".env" ]; then
  echo ".env was not found. Create it with: cp .env.example .env" >&2
  exit 1
fi

env_or_default() {
  local key="$1"
  local default_value="$2"
  local value

  value="$(grep -E "^${key}=" .env | tail -n 1 | cut -d '=' -f 2- || true)"

  if [ -n "$value" ]; then
    printf "%s" "$value"
  else
    printf "%s" "$default_value"
  fi
}

for key in POSTGRES_PASSWORD JWT_SIGNING_KEY; do
  if ! grep -Eq "^${key}=.+" .env; then
    echo "Required variable '$key' is missing or empty in .env." >&2
    exit 1
  fi
done

if ! docker info --format '{{.Swarm.LocalNodeState}}' 2>/dev/null | grep -q '^active$'; then
  echo "Docker Swarm is not active. Initializing single-node Swarm..."
  docker swarm init
fi

if [ "$SKIP_BUILD" != "true" ]; then
  echo "Building stack images from $STACK_FILE..."
  docker compose -f "$STACK_FILE" build
else
  echo "Skipping image build because SKIP_BUILD=true."
fi

echo "Deploying stack '$STACK_NAME' from $STACK_FILE..."
RESOLVED_STACK_FILE="$(mktemp "${TMPDIR:-/tmp}/compensa-stack.XXXXXX.yml")"
trap 'rm -f "$RESOLVED_STACK_FILE"' EXIT
chmod 600 "$RESOLVED_STACK_FILE"
docker compose -f "$STACK_FILE" config > "$RESOLVED_STACK_FILE"
perl -0pi -e 's/^name: .*\n//' "$RESOLVED_STACK_FILE"
perl -0pi -e 's/(networks:\n(?:  [^\n]+:\n))    name: .*\n/$1/g' "$RESOLVED_STACK_FILE"
perl -0pi -e 's/(published: )"([0-9]+)"/$1$2/g' "$RESOLVED_STACK_FILE"
docker stack deploy -c "$RESOLVED_STACK_FILE" "$STACK_NAME"

if [ "$FORCE_LOCAL_UPDATE" = "true" ]; then
  echo "Forcing rolling update for locally tagged application services..."
  for service in frontend api-gateway identity-api core-api compensa-ai notifications-api; do
    full_service_name="${STACK_NAME}_${service}"
    if docker service inspect "$full_service_name" >/dev/null 2>&1; then
      docker service update --force "$full_service_name"
    fi
  done
fi

echo
echo "Stack deploy requested. Current services:"
docker stack services "$STACK_NAME"

FRONTEND_PORT_VALUE="$(env_or_default FRONTEND_PORT 5173)"
GATEWAY_PORT_VALUE="$(env_or_default GATEWAY_PORT 5005)"
IDENTITY_API_PORT_VALUE="$(env_or_default IDENTITY_API_PORT 5002)"
CORE_API_PORT_VALUE="$(env_or_default CORE_API_PORT 5001)"
COMPENSA_AI_PORT_VALUE="$(env_or_default COMPENSA_AI_PORT 8000)"
NOTIFICATIONS_PORT_VALUE="$(env_or_default NOTIFICATIONS_PORT 8001)"
POSTGRES_PORT_VALUE="$(env_or_default POSTGRES_PORT 5432)"
RABBITMQ_PORT_VALUE="$(env_or_default RABBITMQ_PORT 5672)"
RABBITMQ_MGMT_PORT_VALUE="$(env_or_default RABBITMQ_MGMT_PORT 15672)"
PORTAINER_PORT_VALUE="$(env_or_default PORTAINER_PORT 9000)"
PORTAINER_HTTPS_PORT_VALUE="$(env_or_default PORTAINER_HTTPS_PORT 9443)"

cat <<EOF

Service links:

Application:
- Frontend: http://localhost:${FRONTEND_PORT_VALUE}
- API Gateway: http://localhost:${GATEWAY_PORT_VALUE}
- API Gateway health: http://localhost:${GATEWAY_PORT_VALUE}/health
- Identity API: http://localhost:${IDENTITY_API_PORT_VALUE}
- Identity API health: http://localhost:${IDENTITY_API_PORT_VALUE}/health
- Core API: http://localhost:${CORE_API_PORT_VALUE}
- Core API health: http://localhost:${CORE_API_PORT_VALUE}/health
- Compensa AI: http://localhost:${COMPENSA_AI_PORT_VALUE}
- Compensa AI health: http://localhost:${COMPENSA_AI_PORT_VALUE}/health
- Notifications API: http://localhost:${NOTIFICATIONS_PORT_VALUE}
- Notifications API health: http://localhost:${NOTIFICATIONS_PORT_VALUE}/health

Observability:
- Grafana: http://localhost:3000
- Prometheus: http://localhost:9090
- Alertmanager: http://localhost:9093
- Aspire Dashboard: http://localhost:18888
- OpenTelemetry Collector metrics: http://localhost:8889/metrics
- Loki: http://localhost:3100
- Tempo: http://localhost:3200

Administration and infrastructure:
- Portainer: http://localhost:${PORTAINER_PORT_VALUE}
- Portainer HTTPS: https://localhost:${PORTAINER_HTTPS_PORT_VALUE}
- RabbitMQ Management: http://localhost:${RABBITMQ_MGMT_PORT_VALUE}
- RabbitMQ AMQP: amqp://localhost:${RABBITMQ_PORT_VALUE}
- PostgreSQL: localhost:${POSTGRES_PORT_VALUE}
- Redis: localhost:6379

Run './scripts/smoke-infra.sh' after services finish starting.
EOF
