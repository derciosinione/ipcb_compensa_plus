# Docker Swarm

This project includes a Swarm stack file at `docker-stack.yml`.

The frontend runs as a static build served by Nginx. In Swarm, the frontend image is built with `VITE_API_URL=/api`, and Nginx proxies `/api/*` to the internal `api-gateway:8080` service.

## Local single-node Swarm

```bash
./scripts/stack-up.sh
```

The local script applies all `compensa.*=true` placement labels to the single Swarm node. This keeps the same `docker-stack.yml` usable locally and in Azure production, where Ansible applies only the role-specific label to each VM.

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

## Azure five-node Swarm

The production topology follows the Azure diagram with five VMs:

- `compensa-swarm-manager`: public entry point, Nginx/API Gateway, Swarm manager
- `compensa-backend`: Core API, Identity API, Notifications API, Compensa AI API
- `compensa-db`: PostgreSQL with a 64 GB managed disk
- `compensa-cache`: Redis and RabbitMQ
- `compensa-ops`: Portainer, Grafana, Prometheus, Loki, Tempo, OpenTelemetry Collector, Aspire

Terraform provisions the VNet `10.0.0.0/16`, the `10.0.1.0/24`, `10.0.2.0/24`, and `10.0.3.0/24` subnets, the `compensa-rg` resource group, Key Vault, ACR, and the five VMs. Ansible joins the four private VMs to the manager over the private network and applies the role labels used by `docker-stack.yml`.
