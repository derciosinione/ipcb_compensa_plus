# Comandos para executar os testes

Este ficheiro resume os comandos necessários para correr os testes do projeto Compensa+.

## 1. Pré-requisitos

Executar a partir da raiz do projeto:

```bash
cd /Users/derciosinione/Developer/IPCB/ProjetoFinal/CompensaProject
```

Ferramentas necessárias:

- Docker e Docker Compose;
- .NET SDK compatível com `net10.0`;
- Python 3.11+;
- Node.js e pnpm;
- Playwright browsers instalados.

Instalar dependências do frontend:

```bash
pnpm --dir Frontend install
```

Instalar browsers do Playwright:

```bash
pnpm --dir Frontend exec playwright install
```

Preparar ambientes Python para os testes:

```bash
./scripts/tests/setup-python-test-envs.sh
```

## 1.1 Scripts rápidos

Scripts por projeto e tipo:

```bash
./scripts/tests/test-core-unit.sh
./scripts/tests/test-core-integration.sh

./scripts/tests/test-identity-unit.sh
./scripts/tests/test-identity-integration.sh

./scripts/tests/test-notifications-unit.sh
./scripts/tests/test-notifications-integration.sh

./scripts/tests/test-ai-unit.sh
./scripts/tests/test-ai-integration.sh

./scripts/tests/test-frontend-build.sh
./scripts/tests/test-frontend-e2e.sh
./scripts/tests/test-frontend-e2e-ui.sh
```

Scripts agregados:

```bash
./scripts/tests/test-all-unit.sh
./scripts/tests/test-all-integration.sh
./scripts/tests/test-all.sh
```

## 2. Testes .NET - Core API

Executa os testes unitários e de integração do Core API.

Scripts separados:

```bash
./scripts/tests/test-core-unit.sh
./scripts/tests/test-core-integration.sh
```

Comando direto:

```bash
dotnet test Backend/Compensa.Core.Api/Compensa.Core.Api.sln
```

Executar com logs mais detalhados:

```bash
dotnet test Backend/Compensa.Core.Api/Compensa.Core.Api.sln --logger "console;verbosity=detailed"
```

Executar apenas o projeto de testes:

```bash
dotnet test Backend/Compensa.Core.Api/CompensaCoreApi.Tests/CompensaCoreApi.Tests.csproj
```

Testes cobertos:

- contratos de API;
- regras de autorização em pedidos de compensação;
- regras de conflito de horários.

## 3. Testes .NET - Identity API

Executa os testes unitários do Identity API.

Scripts separados:

```bash
./scripts/tests/test-identity-unit.sh
./scripts/tests/test-identity-integration.sh
```

Comando direto:

```bash
dotnet test Backend/Compensa.Identity.Api/Compensa.Identity.Api.sln
```

Executar com logs mais detalhados:

```bash
dotnet test Backend/Compensa.Identity.Api/Compensa.Identity.Api.sln --logger "console;verbosity=detailed"
```

Executar apenas o projeto de testes:

```bash
dotnet test Backend/Compensa.Identity.Api/CompensaIdentityApi.Tests/CompensaIdentityApi.Tests.csproj
```

Testes cobertos:

- geração e validação de JWT;
- regras mínimas de segurança dos tokens;
- refresh tokens.

## 4. Testes Python - Notifications API

Scripts separados:

```bash
./scripts/tests/test-notifications-unit.sh
./scripts/tests/test-notifications-integration.sh
```

Entrar na pasta do serviço:

```bash
cd Backend/Compensa.Notifications
```

Criar ambiente virtual, se ainda não existir:

```bash
python3 -m venv .venv
```

Ativar ambiente virtual:

```bash
source .venv/bin/activate
```

Instalar dependências:

```bash
pip install -r requirements.txt pytest pytest-asyncio httpx
```

Executar testes:

```bash
pytest tests
```

Executar com detalhe:

```bash
pytest tests -v
```

Voltar para a raiz:

```bash
cd ../..
```

Testes cobertos:

- autenticação JWT;
- health check;
- endpoints de notificações;
- preferências.

## 5. Testes Python - CompensaAI

Scripts separados:

```bash
./scripts/tests/test-ai-unit.sh
./scripts/tests/test-ai-integration.sh
```

Entrar na pasta do serviço:

```bash
cd Backend/CompensaAI
```

Criar ambiente virtual, se ainda não existir:

```bash
python3 -m venv .venv
```

Ativar ambiente virtual:

```bash
source .venv/bin/activate
```

Instalar dependências:

```bash
pip install -r requirements.txt pytest pytest-asyncio httpx
```

Executar testes:

```bash
pytest tests
```

Executar com detalhe:

```bash
pytest tests -v
```

Voltar para a raiz:

```bash
cd ../..
```

Testes cobertos:

- autenticação;
- health check;
- proteção de endpoints críticos.

## 6. Testes e2e - Frontend com Playwright

Scripts:

```bash
./scripts/tests/test-frontend-build.sh
./scripts/tests/test-frontend-e2e.sh
./scripts/tests/test-frontend-e2e-ui.sh
```

Os testes e2e usam Playwright e sobem o frontend automaticamente em:

```text
http://127.0.0.1:5174
```

Durante os testes, o Playwright ativa:

```text
VITE_ENABLE_DEV_LOGIN=true
```

Isto é necessário porque a aplicação usa login por link mágico e não existe password.

Entrar na pasta do frontend:

```bash
cd Frontend
```

Instalar dependências:

```bash
pnpm install
```

Instalar browsers do Playwright:

```bash
pnpm exec playwright install
```

Executar testes e2e:

```bash
pnpm test:e2e
```

Executar com interface visual:

```bash
pnpm test:e2e:ui
```

Executar apenas um ficheiro:

```bash
pnpm exec playwright test tests/e2e/auth.spec.ts
```

Executar em modo debug:

```bash
pnpm exec playwright test --debug
```

Abrir relatório HTML depois dos testes:

```bash
pnpm exec playwright show-report
```

Voltar para a raiz:

```bash
cd ..
```

Testes cobertos:

- autenticação;
- autorização;
- dashboard;
- rotas protegidas.

## 7. Build do frontend

Além dos e2e, é útil validar se o frontend compila para produção.

```bash
pnpm --dir Frontend build
```

## 8. Smoke test da infraestrutura

Depois de subir a stack Docker Swarm:

```bash
./scripts/stack-up.sh
```

Executar smoke test:

```bash
./scripts/smoke-infra.sh
```

Este teste valida:

- Gateway;
- Frontend;
- Identity API;
- Core API;
- CompensaAI;
- Notifications API;
- Prometheus;
- OpenTelemetry Collector;
- Grafana;
- dashboard provisionado;
- Aspire Dashboard.

## 9. Executar todos os testes principais

Scripts agregados:

```bash
./scripts/tests/test-all-unit.sh
./scripts/tests/test-all-integration.sh
./scripts/tests/test-all.sh
```

Comando sequencial a partir da raiz:

```bash
dotnet test Backend/Compensa.Core.Api/Compensa.Core.Api.sln
dotnet test Backend/Compensa.Identity.Api/Compensa.Identity.Api.sln
pnpm --dir Frontend build
pnpm --dir Frontend test:e2e
```

Para os serviços Python, executar separadamente:

```bash
cd Backend/Compensa.Notifications
source .venv/bin/activate
pytest tests
cd ../..

cd Backend/CompensaAI
source .venv/bin/activate
pytest tests
cd ../..
```

## 10. Observações importantes

- Os testes e2e não usam password, porque a aplicação autentica por link mágico.
- Para e2e, o modo `VITE_ENABLE_DEV_LOGIN=true` é ativado automaticamente pelo `playwright.config.ts`.
- Para validar a aplicação completa em Docker Swarm, usar `./scripts/smoke-infra.sh`.
- Não commitar ficheiros `.env` com segredos reais.
- Se o Playwright falhar por browsers ausentes, executar `pnpm --dir Frontend exec playwright install`.
