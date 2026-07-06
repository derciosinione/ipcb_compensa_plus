#!/usr/bin/env bash
set -u

BASE_GATEWAY_URL="${BASE_GATEWAY_URL:-http://localhost:5005}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:5173}"
IDENTITY_URL="${IDENTITY_URL:-http://localhost:5002}"
CORE_URL="${CORE_URL:-http://localhost:5001}"
AI_URL="${AI_URL:-http://localhost:8000}"
NOTIFICATIONS_URL="${NOTIFICATIONS_URL:-http://localhost:8001}"
PROMETHEUS_URL="${PROMETHEUS_URL:-http://localhost:9090}"
GRAFANA_URL="${GRAFANA_URL:-http://localhost:3000}"
ASPIRE_URL="${ASPIRE_URL:-http://localhost:18888}"
OTEL_COLLECTOR_METRICS_URL="${OTEL_COLLECTOR_METRICS_URL:-http://localhost:8889/metrics}"

FAILED=0

check_http() {
  local name="$1"
  local url="$2"
  local expected="${3:-200}"
  local status

  status="$(curl -fsS -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || true)"

  if [ "$status" = "$expected" ]; then
    printf "ok   %-32s %s\n" "$name" "$url"
  else
    printf "fail %-32s %s returned %s, expected %s\n" "$name" "$url" "${status:-000}" "$expected"
    FAILED=1
  fi
}

check_http_any() {
  local name="$1"
  local url="$2"
  local expected_statuses="$3"
  local status

  status="$(curl -fsS -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || true)"

  if [[ " $expected_statuses " == *" $status "* ]]; then
    printf "ok   %-32s %s\n" "$name" "$url"
  else
    printf "fail %-32s %s returned %s, expected one of %s\n" "$name" "$url" "${status:-000}" "$expected_statuses"
    FAILED=1
  fi
}

check_contains() {
  local name="$1"
  local url="$2"
  local expected="$3"
  local body

  body="$(curl -fsS "$url" 2>/dev/null || true)"

  if printf "%s" "$body" | grep -q "$expected"; then
    printf "ok   %-32s %s contains %s\n" "$name" "$url" "$expected"
  else
    printf "fail %-32s %s did not contain %s\n" "$name" "$url" "$expected"
    FAILED=1
  fi
}

check_matches() {
  local name="$1"
  local url="$2"
  local expected_regex="$3"
  local body

  body="$(curl -fsS "$url" 2>/dev/null || true)"

  if printf "%s" "$body" | grep -Eq "$expected_regex"; then
    printf "ok   %-32s %s matches %s\n" "$name" "$url" "$expected_regex"
  else
    printf "fail %-32s %s did not match %s\n" "$name" "$url" "$expected_regex"
    FAILED=1
  fi
}

check_http "gateway health" "$BASE_GATEWAY_URL/health"
check_http "frontend health" "$FRONTEND_URL/health"
check_http "identity health" "$IDENTITY_URL/health"
check_http "core health" "$CORE_URL/health"
check_http "ai health" "$AI_URL/health"
check_http "notifications health" "$NOTIFICATIONS_URL/health"

check_http "prometheus ready" "$PROMETHEUS_URL/-/ready"
check_contains "prometheus query api" "$PROMETHEUS_URL/api/v1/query?query=up" '"status":"success"'
check_contains "otel collector metrics" "$OTEL_COLLECTOR_METRICS_URL" "target_info"

check_matches "grafana health" "$GRAFANA_URL/api/health" '"database"[[:space:]]*:[[:space:]]*"ok"'
check_contains "grafana prometheus datasource" "$GRAFANA_URL/api/datasources/uid/prom-ds" '"name":"Prometheus"'
check_contains "grafana dashboard" "$GRAFANA_URL/api/search?query=Compensa%20Service%20Metrics" "Compensa Service Metrics"

check_http_any "aspire dashboard" "$ASPIRE_URL" "200 302"

if [ "$FAILED" -eq 0 ]; then
  echo "Smoke test passed."
else
  echo "Smoke test failed."
fi

exit "$FAILED"
