# Compensa+

Compensa+ is an educational compensation management platform for teacher schedule compensation requests, course coordination, classroom planning, notifications, and AI-assisted workflows.

## Current Status

The project is now a full-stack distributed system, not a frontend-only prototype.

- React/Vite frontend served through Nginx in Docker
- API Gateway built with YARP
- Identity API with magic-link authentication, JWT access tokens, refresh tokens, roles, and user management
- Core API with courses, curricular units, class groups, schedules, classrooms, compensation requests, dashboard data, global search, audit logs, caching, and RabbitMQ events
- Notifications service with FastAPI, RabbitMQ consumers, PostgreSQL persistence, preferences, and email delivery support
- CompensaAI service with OpenAI/Gemini orchestration and authenticated access to Core API tools
- PostgreSQL, Redis, RabbitMQ, OpenTelemetry, Prometheus, Grafana, Loki, Tempo, Alertmanager, and Aspire dashboard in the root Docker Compose stack

## Architecture

```text
Frontend -> API Gateway -> Identity API
                       -> Core API
                       -> Notifications API
                       -> CompensaAI

Core API -> PostgreSQL
Core API -> Redis
Core API -> RabbitMQ -> Notifications API
CompensaAI -> Core API
Observability -> OpenTelemetry Collector -> Prometheus/Loki/Tempo/Grafana
```

## Main Features

- Magic-link login and refresh-token session handling
- Role-based routing for teachers, coordinators, and administrators
- Compensation request creation, listing, approval, rejection, and conflict checks
- Course, curricular unit, class group, schedule, classroom, and user management
- Dashboard and global search backed by API data
- Notifications and notification preferences
- AI chat with authenticated backend context and Core API tool access
- Dockerized local environment with health checks and observability

## Repository Layout

```text
Backend/
  Compensa.Core.Api/        # .NET Core domain API
  Compensa.Identity.Api/    # .NET Identity/auth API
  Compensa.Gateway/         # YARP API Gateway
  Compensa.Notifications/   # FastAPI notifications service
  CompensaAI/               # FastAPI AI orchestration service
Database/                   # PostgreSQL image and init scripts
Frontend/                   # React/Vite frontend
docker/                     # Observability configs
guidelines/                 # Product and technical documentation
```

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ and pnpm 8+
- .NET SDK compatible with the target framework used by the backend projects
- Python 3.11+ for local FastAPI service checks

## Environment

Start from the example file:

```bash
cp .env.example .env
```

Important variables:

```bash
POSTGRES_PASSWORD=change_me_to_a_strong_local_password
JWT_SIGNING_KEY=replace_with_a_secret_at_least_32_chars
FRONTEND_PUBLIC_URL=http://localhost:5173
VITE_API_URL=http://localhost:5005
OPENAI_API_KEY=
GEMINI_API_KEY=
EMAIL_PASSWORD=
```

Do not commit real API keys, SMTP passwords, database passwords, or production JWT secrets. The Docker Compose files require `POSTGRES_PASSWORD` and `JWT_SIGNING_KEY` to come from `.env`; they intentionally do not include secret defaults.

## Run Locally

Full stack:

```bash
docker compose up --build
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Gateway: `http://localhost:5005`
- Identity API: `http://localhost:5002`
- Core API: `http://localhost:5001`
- CompensaAI: `http://localhost:8000`
- Notifications API: `http://localhost:8001`
- RabbitMQ Management: `http://localhost:15672`
- Grafana: `http://localhost:3000`
- Prometheus: `http://localhost:9090`
- Aspire Dashboard: `http://localhost:18888`

Frontend only:

```bash
pnpm --dir Frontend install
pnpm --dir Frontend dev
```

## Verification

Frontend production build:

```bash
pnpm --dir Frontend build
```

Core API tests:

```bash
dotnet test Backend/Compensa.Core.Api/Compensa.Core.Api.sln
```

Identity API build:

```bash
dotnet build Backend/Compensa.Identity.Api/Compensa.Identity.Api.sln
```

Python syntax checks:

```bash
python3 -m py_compile Backend/CompensaAI/app/main.py Backend/Compensa.Notifications/app/main.py
```

## Security Notes

- AI chat endpoints require a valid JWT Bearer token.
- The AI service derives user identity from the JWT, not from client-provided request body data.
- Core request visibility is restricted for teachers to their own requests.
- Production deployments must override all development defaults for JWT, SMTP, database, Grafana, CORS, and AI provider keys.

## Known Gaps

- Test coverage is still narrow; Core has schedule conflict tests, but broader service/controller/frontend/AI tests are still needed.
- Coordinator request visibility should be tightened to only the courses they coordinate.
- Production CI/CD, backup strategy, and deployment hardening still need to be finalized.

## Useful Documentation

- [Architecture](./guidelines/ARCHITECTURE.md)
- [Development Guidelines](./guidelines/DEVELOPMENT_GUIDELINES.md)
- [Project Overview](./guidelines/PROJECT_OVERVIEW.md)
- [AI Backend Implementation](./guidelines/AI_BACKEND_IMPLEMENTATION.md)
