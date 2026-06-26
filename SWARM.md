# Docker Swarm

This project includes a Swarm stack file at `docker-stack.yml`.

The frontend runs as a static build served by Nginx. In Swarm, the frontend image is built with `VITE_API_URL=/api`, and Nginx proxies `/api/*` to the internal `api-gateway:8080` service.

## Local single-node Swarm

```bash
./scripts/stack-up.sh
```

To remove the stack:

```bash
./scripts/stack-destroy.sh
```

By default, destroy keeps volumes and leaves Swarm active. For a full local cleanup:

```bash
REMOVE_VOLUMES=true LEAVE_SWARM=false ./scripts/stack-destroy.sh
```

Portainer is available at:

- `http://localhost:9000`
- `https://localhost:9443`

Observability is available at:

- Grafana: `http://localhost:3000`
- Prometheus: `http://localhost:9090`
- Aspire Dashboard: `http://localhost:18888`
- Loki: `http://localhost:3100`
- Tempo: `http://localhost:3200`

The Swarm stack runs:

- `core-api` with 2 replicas
- `notifications-api` with 2 replicas
- OpenTelemetry Collector exporting metrics to Prometheus and Aspire
- Loki and Tempo for logs and traces
- Grafana with the `Compensa Service Metrics` provisioned dashboard
- Portainer CE on a manager node
- Portainer Agent globally on Linux nodes

## Useful Commands

```bash
docker stack services compensa
docker stack ps compensa
docker service logs compensa_core-api
docker service logs compensa_notifications-api
./scripts/stack-destroy.sh
```

For multi-node Swarm deployments, build and push the `compensa-*:local` images to a registry, then update the image names in `docker-stack.yml` before deploying.
