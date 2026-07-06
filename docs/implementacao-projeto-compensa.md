# Implementação do Projeto Compensa+

## 1. Introdução

O Compensa+ é uma plataforma de gestão académica desenvolvida para apoiar o processo de compensação de aulas no contexto institucional. O sistema permite gerir pedidos de compensação, horários, cursos, unidades curriculares, salas, utilizadores, notificações e apoio por inteligência artificial.

A implementação evoluiu de uma aplicação frontend para uma arquitetura distribuída baseada em microserviços, com separação clara de responsabilidades, autenticação por link mágico, persistência em PostgreSQL, comunicação assíncrona com RabbitMQ, cache com Redis, observabilidade com OpenTelemetry, métricas em Prometheus/Grafana e execução em Docker Compose ou Docker Swarm.

O objetivo técnico principal foi criar uma solução modular, escalável e testável, em que cada serviço tem uma responsabilidade bem definida e pode ser desenvolvido, testado e executado de forma independente.

## 2. Tecnologias utilizadas

As principais tecnologias usadas no projeto foram:

- **Frontend:** React, Vite, TypeScript, React Router, TanStack Query, Tailwind CSS, Radix UI, Material UI, Recharts e Playwright.
- **Backend .NET:** ASP.NET Core, Entity Framework Core, PostgreSQL, JWT Bearer Authentication, MassTransit, RabbitMQ, Redis, OpenTelemetry e Serilog.
- **Backend Python:** FastAPI, SQLAlchemy, asyncpg, Pydantic, aio-pika, OpenTelemetry, OpenAI SDK e integração com Gemini.
- **Gateway:** YARP Reverse Proxy.
- **Base de dados:** PostgreSQL com múltiplas bases lógicas.
- **Mensageria:** RabbitMQ.
- **Cache:** Redis.
- **Observabilidade:** OpenTelemetry Collector, Prometheus, Grafana, Loki, Tempo, Alertmanager e Aspire Dashboard.
- **Contentorização:** Docker, Docker Compose, Docker Swarm e Nginx.
- **Administração de containers:** Portainer.
- **Testes:** xUnit, pytest e Playwright.

## 3. Arquitetura geral

A arquitetura segue um modelo de microserviços, onde o frontend comunica preferencialmente com o API Gateway. O gateway encaminha os pedidos para os serviços internos conforme a rota.

```text
Frontend React/Nginx
        |
        v
API Gateway YARP
        |
        +--> Identity API
        +--> Core API
        +--> Notifications API
        +--> CompensaAI

Core API --------> PostgreSQL
Identity API ----> PostgreSQL
Notifications --> PostgreSQL
CompensaAI ------> PostgreSQL/Redis/Core API

Core API --------> RabbitMQ --------> Notifications API

Serviços --------> OpenTelemetry Collector
Collector -------> Prometheus / Loki / Tempo / Aspire
Grafana ---------> Prometheus / Loki / Tempo
```

### 3.1 Responsabilidade dos componentes

- **Frontend:** interface web da aplicação, com páginas protegidas, dashboards, gestão de pedidos, calendário, cursos, salas, notificações, utilizadores e assistente de IA.
- **API Gateway:** ponto único de entrada para as APIs, reduzindo acoplamento entre frontend e microserviços.
- **Identity API:** autenticação, autorização, utilizadores, roles, links mágicos e tokens JWT.
- **Core API:** domínio principal da aplicação, incluindo compensações, cursos, anos letivos, salas, horários, importação de horários, pesquisa global e dashboard.
- **Notifications API:** armazenamento e leitura de notificações, preferências e consumo de eventos.
- **CompensaAI:** assistente inteligente com integração a modelos de IA e ferramentas que consultam o Core API.
- **PostgreSQL:** persistência relacional.
- **RabbitMQ:** comunicação assíncrona por eventos.
- **Redis:** cache e apoio a sessões/consultas.
- **Grafana/Prometheus/Loki/Tempo/Aspire:** visualização de métricas, logs e traces.
- **Portainer:** administração visual dos serviços Docker Swarm.

## 4. Estrutura geral do repositório

```text
CompensaProject/
  Backend/
    Compensa.Core.Api/
    Compensa.Identity.Api/
    Compensa.Gateway/
    Compensa.Notifications/
    CompensaAI/
    ConsoleTest/
  Database/
  Frontend/
  TimetableSource/
  docker/
    alertmanager/
    grafana/
    loki/
    otel-collector/
    prometheus/
    tempo/
  docs/
  guidelines/
  scripts/
  docker-compose.yml
  docker-stack.yml
  docker-compose.database.yml
  .env.example
```

### 4.1 Descrição das pastas principais

- `Backend/`: contém todos os microserviços backend.
- `Database/`: contém a imagem e scripts de inicialização do PostgreSQL.
- `Frontend/`: contém a aplicação React/Vite.
- `TimetableSource/`: contém ficheiros de horários usados como fonte para importação.
- `docker/`: contém configuração de observabilidade, dashboards, alertas e collectors.
- `scripts/`: contém scripts auxiliares para executar, validar e destruir a stack.
- `docs/`: documentação técnica gerada para apoio ao relatório.
- `guidelines/`: documentação de arquitetura, desenvolvimento e visão do projeto.
- `docker-compose.yml`: ambiente local com Docker Compose.
- `docker-stack.yml`: orquestração Docker Swarm.
- `.env.example`: exemplo das variáveis de ambiente necessárias.

## 5. API Gateway

O API Gateway foi implementado com **YARP Reverse Proxy** em ASP.NET Core. A sua função é expor uma entrada única para o frontend e encaminhar pedidos para os serviços corretos.

### 5.1 Estrutura de pastas

```text
Backend/Compensa.Gateway/CompensaGateway/
  Middleware/
    StructuredLoggingMiddleware.cs
  Properties/
    launchSettings.json
  Program.cs
  appsettings.json
  appsettings.Development.json
  Dockerfile
  CompensaGateway.csproj
```

### 5.2 Implementação

O gateway centraliza:

- roteamento para Identity API, Core API, Notifications API e CompensaAI;
- CORS para permitir chamadas do frontend;
- health check em `/health`;
- logging estruturado;
- rate limiting;
- exportação de telemetria via OpenTelemetry.

O frontend em Docker usa Nginx e comunica com o backend através do gateway, normalmente pela rota `/api`.

## 6. Identity API

O Identity API é o microserviço responsável por autenticação e gestão de utilizadores.

### 6.1 Estrutura de pastas

```text
Backend/Compensa.Identity.Api/CompensaIdentityApi/
  Contracts/
    Auth/
    Users/
  Controllers/
    AuthController.cs
    UsersController.cs
  DTOs/
  Data/
  Infrastructure/
    Auth/
    Database/
    Email/
    MagicLinks/
    OpenApi/
  IntegrationEvents/
  Middleware/
  Migrations/
  Models/
  Observability/
    CompensaIdentityMetrics.cs
  Repositories/
    AuthTokens/
    Users/
  Services/
    Auth/
    Users/
  Program.cs
  appsettings.json
  appsettings.Development.json
  Dockerfile
  docker-compose.yml
  CompensaIdentityApi.csproj
```

### 6.2 Funcionalidades principais

O serviço implementa:

- autenticação por **link mágico**, sem password;
- geração e validação de JWT;
- refresh tokens;
- gestão de utilizadores;
- roles e permissões;
- envio de email para links mágicos;
- seed opcional de administrador;
- health check;
- métricas e traces com OpenTelemetry.

### 6.3 Autenticação por link mágico

O projeto não utiliza autenticação por password. O fluxo é:

1. O utilizador introduz o email.
2. O Identity API gera um token temporário.
3. É enviado um link mágico por email.
4. O utilizador abre o link.
5. O token é validado.
6. O backend emite um access token JWT e, quando aplicável, refresh token.

Para testes e desenvolvimento existe suporte a modo de desenvolvimento no frontend com:

```text
VITE_ENABLE_DEV_LOGIN=true
```

Este modo permite obter um fluxo de login controlado durante testes e2e, sem depender de envio real de email.

### 6.4 Segurança

O serviço exige que `JWT_SIGNING_KEY` seja configurado por variável de ambiente e tenha tamanho adequado. A chave não deve ficar hardcoded em ficheiros de configuração.

Também foram removidos valores sensíveis padrão dos ficheiros Docker, obrigando o uso de `.env`.

## 7. Core API

O Core API é o serviço principal de domínio. É onde está implementada a lógica central da aplicação Compensa+.

### 7.1 Estrutura de pastas

```text
Backend/Compensa.Core.Api/CompensaCoreApi/
  Contracts/
  Controllers/
    AcademicYearsController.cs
    ClassroomsController.cs
    CompensationRequestsController.cs
    CoursesController.cs
    DashboardController.cs
    SchedulesController.cs
    SearchController.cs
    UserUnitAssignmentsController.cs
  Data/
  Domain/
    AcademicYears/
    Assignments/
    Audit/
    Classrooms/
    CompensationRequests/
    Courses/
  Dtos/
    AcademicYears/
    Assignments/
    Classrooms/
    CompensationRequests/
    Courses/
    Dashboard/
    Notifications/
    Schedules/
    Search/
  Exceptions/
  Extensions/
  Infrastructure/
    Auth/
    Caching/
    Database/
    OpenApi/
  IntegrationEvents/
  Middleware/
  Migrations/
  Observability/
    CompensaCoreMetrics.cs
  Repositories/
    AcademicYears/
    Assignments/
    Classrooms/
    CompensationRequests/
    Courses/
    Notifications/
  Services/
    AcademicYears/
    Assignments/
    Audit/
    Classrooms/
    CompensationRequests/
    Courses/
    Dashboard/
    Documents/
    Notifications/
    Schedules/
    Search/
  Program.cs
  appsettings.json
  appsettings.Development.json
  Dockerfile
  docker-compose.yml
  CompensaCoreApi.csproj
```

### 7.2 Funcionalidades principais

O Core API implementa:

- gestão de anos letivos;
- gestão de cursos;
- gestão de unidades curriculares;
- gestão de componentes curriculares;
- gestão de turmas;
- gestão de salas;
- gestão de horários;
- importação de horários;
- pedidos de compensação;
- aprovação/rejeição de pedidos;
- comentários e documentos associados a pedidos;
- pesquisa global;
- dashboard com indicadores;
- auditoria;
- publicação de eventos para RabbitMQ;
- armazenamento local de documentos em volume Docker;
- métricas de negócio.

### 7.3 Aplicação de DDD

O Core API segue uma organização inspirada em **Domain-Driven Design (DDD)**. O domínio foi separado por áreas de negócio, permitindo que a lógica central fique isolada de detalhes de infraestrutura.

Principais conceitos DDD aplicados:

- **Domínio:** classes que representam conceitos de negócio, como `CompensationRequest`, `Course`, `Classroom`, `AcademicYear`, `ClassSchedule` e `AuditLog`.
- **Entidades:** objetos com identidade própria, persistidos em base de dados.
- **Value-like concepts/enums:** estados e tipos como `CompensationRequestStatus`, `ClassroomType`, `TeachingComponentType`, `CourseDegreeType` e `UnitComponentType`.
- **Repositories:** abstraem o acesso a dados, permitindo separar consultas/persistência da lógica de aplicação.
- **Services:** concentram regras de negócio e casos de uso.
- **DTOs:** transportam dados para entrada e saída das APIs sem expor diretamente o modelo de domínio.
- **Infrastructure:** contém detalhes técnicos como autenticação, cache, base de dados e OpenAPI.

Esta separação facilita manutenção, testes e evolução da aplicação.

### 7.4 Exemplos de entidades de domínio

```text
Domain/CompensationRequests/
  CompensationRequest.cs
  CompensationRequestComment.cs
  CompensationRequestDocument.cs
  CompensationRequestStatus.cs
  TeachingComponentType.cs

Domain/Courses/
  Course.cs
  CourseOffering.cs
  CurricularUnit.cs
  CurricularUnitOffering.cs
  CurricularUnitComponent.cs
  ClassGroup.cs
  ClassSchedule.cs
```

### 7.5 Regras de compensação e conflitos

Uma parte crítica do Core API é a validação de conflitos de horários. A lógica está centralizada em serviços como:

```text
Services/Schedules/ScheduleConflictRule.cs
Services/Schedules/ScheduleAvailabilityService.cs
Services/CompensationRequests/CompensationRequestService.cs
```

Estas regras validam, por exemplo:

- disponibilidade de sala;
- disponibilidade de turma;
- disponibilidade de docente;
- conflitos com horários existentes;
- validade de datas e períodos propostos;
- permissões conforme o papel do utilizador.

### 7.6 Startup da base de dados em ambiente replicado

No Docker Swarm, o `core-api` executa com 2 réplicas. Como ambas poderiam tentar aplicar migrations e seeds ao mesmo tempo, foi adicionado um lock de base de dados com PostgreSQL advisory lock no `DatabaseStartupService`.

Isto evita condições de corrida durante:

- migrations;
- criação de tabelas auxiliares;
- criação de índices;
- seed de anos letivos;
- seed de cursos e salas.

## 8. Notifications API

O Notifications API foi implementado em Python com FastAPI. É responsável por persistir notificações, gerir preferências e consumir eventos.

### 8.1 Estrutura de pastas

```text
Backend/Compensa.Notifications/
  app/
    api/
      auth.py
      endpoints.py
    core/
      config.py
      database.py
      rabbitmq.py
    models/
      notification.py
    services/
      consumer.py
      email.py
    main.py
    metrics.py
  tests/
    test_auth.py
    test_endpoints.py
    test_health.py
  Dockerfile
  docker-compose.yml
  requirements.txt
```

### 8.2 Funcionalidades principais

O serviço implementa:

- listagem de notificações por utilizador;
- marcação de notificações como lidas;
- gestão de preferências de notificação;
- consumo de eventos RabbitMQ;
- envio de email;
- autenticação por JWT;
- health check em `/health`;
- métricas de negócio via OpenTelemetry.

### 8.3 Endpoints principais

```text
GET   /health
GET   /api/notifications
PATCH /api/notifications/{notification_id}/read
GET   /api/preferences
PUT   /api/preferences
```

### 8.4 Métricas

As métricas estão definidas em:

```text
Backend/Compensa.Notifications/app/metrics.py
```

Incluem:

- notificações criadas;
- notificações lidas;
- eventos consumidos;
- falhas de consumo;
- entregas de email;
- preferências atualizadas.

## 9. CompensaAI

O CompensaAI é o microserviço de assistência inteligente. Foi implementado com FastAPI e integra modelos de IA com o contexto real da aplicação.

### 9.1 Estrutura de pastas

```text
Backend/CompensaAI/
  app/
    api/
      auth.py
      routes/
        chat.py
    core/
      config.py
    services/
      ai_coordinator.py
      cache_service.py
      core_api_service.py
      gemini_service.py
      openai_service.py
    main.py
    metrics.py
  tests/
    test_auth.py
    test_health.py
  Dockerfile
  docker-compose.yml
  requirements.txt
```

### 9.2 Funcionalidades principais

O serviço implementa:

- chat autenticado;
- integração com OpenAI;
- integração com Gemini;
- upload de ficheiros;
- eliminação de threads;
- cache de respostas/contexto;
- chamadas autenticadas ao Core API;
- exposição de ferramentas para consulta e ação sobre dados reais.

### 9.3 Endpoints principais

```text
GET    /health
POST   /api/chat/message
POST   /api/chat/upload
DELETE /api/chat/thread/{thread_id}
```

### 9.4 Ferramentas de IA

O serviço define ferramentas para permitir que o assistente interaja com o domínio da aplicação. Exemplos:

- consultar notificações do utilizador;
- listar pedidos de compensação;
- consultar detalhes de pedido;
- criar rascunho de pedido;
- submeter pedido de compensação;
- aprovar ou rejeitar pedido;
- consultar salas disponíveis;
- consultar disponibilidade de turmas;
- consultar cursos;
- consultar anos letivos;
- obter resumo do dashboard;
- executar pesquisa global.

Esta abordagem permite que a IA atue como camada de assistência, sem substituir as regras do Core API. As regras de negócio continuam centralizadas no Core API.

### 9.5 Modelos de IA utilizados

A camada de IA foi implementada com suporte a dois provedores:

- **OpenAI**, através da Assistants API;
- **Google Gemini**, através da biblioteca `google.generativeai`.

No estado atual do projeto, os modelos configurados no código são:

```text
OpenAI: gpt-4-turbo-preview
Gemini: gemini-flash-latest
```

O serviço responsável por coordenar a escolha do provedor é:

```text
Backend/CompensaAI/app/services/ai_coordinator.py
```

Este coordenador permite trabalhar em modo:

- `openai`: força o uso da integração OpenAI;
- `gemini`: força o uso da integração Gemini;
- `auto`: tenta usar OpenAI e, em caso de erro, indisponibilidade ou ausência temporária, faz fallback para Gemini.

O fallback automático foi implementado para aumentar a resiliência do assistente. Se o OpenAI falhar em modo automático, o serviço marca temporariamente o OpenAI como indisponível e redireciona as próximas interações para Gemini durante um período de segurança.

### 9.6 Arquitetura interna da IA

A arquitetura do CompensaAI foi dividida em serviços especializados:

```text
app/services/
  ai_coordinator.py
  openai_service.py
  gemini_service.py
  core_api_service.py
  cache_service.py
```

Responsabilidades:

- `ai_coordinator.py`: decide qual provedor usar, gere fallback, threads e cache.
- `openai_service.py`: cria/usa o assistant OpenAI, threads, ficheiros, tools e function calling.
- `gemini_service.py`: cria sessões Gemini, envia mensagens, carrega ficheiros e executa function calls.
- `core_api_service.py`: encapsula chamadas autenticadas ao Core API.
- `cache_service.py`: guarda respostas reutilizáveis para reduzir chamadas repetidas aos modelos.

O fluxo simplificado é:

```text
Frontend
  -> CompensaAI /api/chat/message
    -> valida JWT
    -> cria contexto do utilizador
    -> consulta cache
    -> escolhe OpenAI ou Gemini
    -> modelo decide se responde diretamente ou chama uma ferramenta
    -> ferramenta chama Core API, se necessário
    -> resposta volta ao frontend
```

### 9.7 OpenAI Assistants API

A integração OpenAI está em:

```text
Backend/CompensaAI/app/services/openai_service.py
```

O serviço usa `AsyncOpenAI` e cria/reutiliza um assistant chamado:

```text
Compensa IA Assistant v10
```

O assistant é configurado com:

- instruções de comportamento específicas para o domínio Compensa+;
- regras de segurança por perfil;
- ferramenta `file_search`;
- function calling para consultar e alterar dados através do Core API;
- suporte a upload de ficheiros;
- threads para manter contexto conversacional.

O modelo configurado na criação do assistant é:

```text
gpt-4-turbo-preview
```

As instruções do assistant definem que ele deve:

- responder a cumprimentos e perguntas gerais sem chamar ferramentas;
- explicar o que é o Compensa+;
- ajudar professores, coordenadores e administradores;
- não inventar IDs;
- resolver GUIDs através de consultas aos serviços;
- pedir confirmação antes de submeter pedidos;
- respeitar permissões;
- não revelar dados de outros utilizadores a professores;
- usar gráficos apenas quando o utilizador pedir estatísticas ou visualização.

### 9.8 Gemini

A integração Gemini está em:

```text
Backend/CompensaAI/app/services/gemini_service.py
```

O modelo usado é:

```text
gemini-flash-latest
```

O Gemini recebe as mesmas instruções principais do assistente e também tem tools declaradas em Python. Isto permite que, mesmo quando a resposta é gerada pelo Gemini, o assistente continue a conseguir:

- consultar pedidos;
- consultar cursos;
- procurar salas;
- validar disponibilidade;
- renderizar gráficos;
- criar ações de interface;
- consultar notificações;
- aprovar/rejeitar pedidos quando autorizado.

O Gemini mantém sessões conversacionais internas através de identificadores do tipo:

```text
gemini_thread_<id>
```

### 9.9 Function calling e ações da interface

A IA não escreve diretamente na base de dados. Quando precisa de dados reais ou pretende executar uma ação, chama ferramentas controladas pelo backend.

Exemplos de ferramentas:

```text
get_user_assignments
get_available_rooms
get_rooms_availability
get_class_group_day
get_classrooms
get_dashboard_summary
search_global
get_my_compensation_requests
get_request_details
update_request_status
get_courses
get_course_details
get_academic_years
get_user_notifications
submit_compensation_request
```

Também existem ferramentas que devolvem ações para o frontend:

```text
CreateCompensationRequest
ManageCompensationRequest
RenderChart
```

Estas ações permitem que o chat mostre elementos interativos, como:

- formulário/rascunho de pedido;
- cartões para aprovar ou rejeitar pedidos;
- gráficos dinâmicos com estatísticas.

### 9.10 Segurança na IA

A segurança da IA depende de três camadas:

1. **JWT obrigatório:** os endpoints de chat usam o token do utilizador autenticado.
2. **Contexto do utilizador:** o serviço passa para o modelo o nome, identificador e papel do utilizador.
3. **Regras no Core API:** mesmo que a IA peça uma ação, a validação final acontece no Core API.

Isto significa que a IA não substitui autorização backend. Um professor não deve conseguir consultar dados privados de outros utilizadores, porque as chamadas reais continuam protegidas por JWT e regras de autorização nos serviços.

### 9.11 Configuração da IA

As chaves são configuradas por variáveis de ambiente:

```text
OPENAI_API_KEY=
GEMINI_API_KEY=
CORE_API_URL=http://core-api:8080
JWT_SIGNING_KEY=
JWT_ISSUER=Compensa.Identity
JWT_AUDIENCE=Compensa.Api
```

Se nenhuma chave (`OPENAI_API_KEY` ou `GEMINI_API_KEY`) estiver configurada, o serviço responde com uma mensagem informativa indicando que o assistente de IA não está configurado.

Em Docker Compose e Docker Swarm, estas variáveis são passadas para o serviço `compensa-ai` através do `.env`.

### 9.12 Métricas

As métricas estão definidas em:

```text
Backend/CompensaAI/app/metrics.py
```

Incluem:

- pedidos de chat;
- falhas de chat;
- latência de chat;
- uploads de ficheiros;
- threads eliminadas.

## 10. Frontend

O frontend foi implementado com React, Vite e TypeScript. A aplicação fornece a interface web para todos os perfis de utilizador.

### 10.1 Estrutura de pastas

```text
Frontend/
  src/
    app/
      components/
        common/
        core/
        domain/
        ui/
      config/
      imports/
      layouts/
      mocks/
      pages/
        AiConverter/
        Calendar/
        Classrooms/
        CoordinatorRequests/
        Courses/
        Dashboard/
        ImportSchedules/
        Login/
        Notifications/
        Preferences/
        Profile/
        Requests/
        Settings/
        SystemCalendar/
        TeacherRequests/
        Users/
        academicYears/
      providers/
      routes/
      services/
        academicYears/
        api/
        assignments/
        auth/
        classrooms/
        compensationRequests/
        courses/
        dashboard/
        holidays/
        notifications/
        schedules/
        search/
        users/
      types/
      utils/
    styles/
  tests/
    e2e/
      auth.spec.ts
      authorization.spec.ts
      dashboard.spec.ts
      fixtures.ts
  Dockerfile
  nginx.conf
  package.json
  playwright.config.ts
```

### 10.2 Funcionalidades principais

O frontend implementa:

- login com link mágico;
- modo de login de desenvolvimento para testes;
- rotas protegidas;
- dashboard;
- gestão de pedidos;
- visão de pedidos por professor;
- visão de pedidos por coordenador;
- calendário;
- cursos;
- detalhes de curso e turmas;
- salas;
- importação de horários;
- notificações;
- preferências;
- utilizadores;
- anos letivos;
- configurações;
- assistente de IA.

### 10.3 Serviços frontend

A camada `services/` isola as chamadas HTTP para as APIs. Isto evita que páginas e componentes conheçam diretamente detalhes de endpoints.

Exemplos:

```text
services/auth/
services/compensationRequests/
services/courses/
services/dashboard/
services/notifications/
services/search/
services/users/
```

### 10.4 Autenticação no frontend

O frontend guarda e gere a sessão através de serviços em:

```text
Frontend/src/app/services/auth/
```

O fluxo normal usa link mágico. Para testes e desenvolvimento, o Playwright ativa:

```text
VITE_ENABLE_DEV_LOGIN=true
```

Isto permite contornar a dependência de email real nos testes e2e.

### 10.5 Nginx

Em Docker, o frontend é servido por Nginx.

O ficheiro:

```text
Frontend/nginx.conf
```

é responsável por:

- servir os ficheiros estáticos gerados pelo Vite;
- suportar fallback de SPA;
- expor `/health`;
- encaminhar chamadas `/api` para o API Gateway.

## 11. Base de dados

O projeto usa PostgreSQL como sistema de persistência. Apesar de existir uma instância PostgreSQL única em Docker, os serviços usam bases lógicas separadas.

Bases principais:

```text
CompensaIdentityDB
CompensaCoreDB
CompensaNotificationsDB
CompensaAiDB
```

### 11.1 Volume persistente

O volume partilhado entre Docker Compose e Docker Swarm é:

```text
compensaproject_compensa_postgres_data
```

Isto garante que, ao alternar entre `docker compose` e `docker stack`, os dados continuam a ser os mesmos.

No `.env` pode ser configurado com:

```text
POSTGRES_VOLUME_NAME=compensaproject_compensa_postgres_data
CORE_UPLOADS_VOLUME_NAME=compensaproject_compensa_core_uploads
PORTAINER_VOLUME_NAME=compensa_portainer_data
```

### 11.2 Migrations

Os serviços .NET usam Entity Framework Core Migrations. O Core API inclui também lógica de compatibilidade para garantir que tabelas e índices críticos existem mesmo quando a base já contém dados anteriores.

## 12. Comunicação assíncrona

O projeto usa RabbitMQ para comunicação por eventos. O Core API publica eventos relacionados com o domínio, e o Notifications API pode consumir esses eventos para criar notificações e enviar emails.

Esta abordagem reduz acoplamento direto entre serviços. Por exemplo, o Core API não precisa enviar email diretamente. Ele publica um evento, e o serviço de notificações decide como tratar esse evento.

## 13. Cache

Redis é usado como infraestrutura de cache e apoio a operações que beneficiam de armazenamento rápido.

No Docker, o Redis é exposto internamente como:

```text
redis:6379
```

Em alguns serviços, a string de conexão é passada por variável:

```text
Redis__ConnectionString=redis:6379
REDIS_URL=redis://redis:6379
```

## 14. Observabilidade

A observabilidade foi implementada para permitir acompanhar o comportamento da aplicação em execução.

### 14.1 Componentes

```text
docker/
  grafana/
    provisioning/
      alerting/
      dashboards/
      datasources/
  prometheus/
    prometheus.yml
    alert_rules.yml
  otel-collector/
    config.yaml
  loki/
  tempo/
  alertmanager/
```

### 14.2 Pipeline de telemetria

Os serviços exportam métricas e traces para o OpenTelemetry Collector.

O collector envia:

- métricas para Prometheus;
- traces para Tempo e Aspire;
- logs para Loki e Aspire;
- métricas derivadas de traces via `spanmetrics`.

```text
Serviços
  -> OpenTelemetry Collector
      -> Prometheus
      -> Loki
      -> Tempo
      -> Aspire Dashboard
      -> Grafana
```

### 14.3 Grafana

Grafana é configurado automaticamente com datasources:

- Prometheus;
- Loki;
- Tempo.

Também existe dashboard provisionado:

```text
docker/grafana/provisioning/dashboards/compensa-service-metrics.json
```

Este dashboard permite visualizar métricas relevantes dos serviços.

### 14.4 Métricas por serviço

**Core API**

Ficheiro:

```text
Backend/Compensa.Core.Api/CompensaCoreApi/Observability/CompensaCoreMetrics.cs
```

Inclui métricas de negócio relacionadas com pedidos, aprovações, rejeições, conflitos e processamento.

**Identity API**

Ficheiro:

```text
Backend/Compensa.Identity.Api/CompensaIdentityApi/Observability/CompensaIdentityMetrics.cs
```

Inclui métricas relacionadas com autenticação, links mágicos, tokens e operações de utilizador.

**Notifications API**

Ficheiro:

```text
Backend/Compensa.Notifications/app/metrics.py
```

Inclui notificações criadas, lidas, eventos consumidos, falhas e emails.

**CompensaAI**

Ficheiro:

```text
Backend/CompensaAI/app/metrics.py
```

Inclui pedidos de chat, falhas, latência, uploads e threads eliminadas.

## 15. Docker Compose

O Docker Compose é usado para desenvolvimento local.

Ficheiro principal:

```text
docker-compose.yml
```

Serviços incluídos:

- PostgreSQL;
- RabbitMQ;
- Redis;
- Identity API;
- Core API;
- CompensaAI;
- Notifications API;
- API Gateway;
- Frontend com Nginx;
- OpenTelemetry Collector;
- Aspire Dashboard;
- Prometheus;
- Alertmanager;
- Grafana;
- Loki;
- Tempo.

Comando:

```bash
docker compose up --build
```

## 16. Docker Swarm

O Docker Swarm é usado para orquestração dos containers.

Ficheiro:

```text
docker-stack.yml
```

Script de arranque:

```bash
./scripts/stack-up.sh
```

Script de destruição:

```bash
./scripts/stack-destroy.sh
```

### 16.1 Serviços com múltiplas réplicas

No Swarm, alguns serviços foram configurados com múltiplas instâncias:

```text
core-api: 2 replicas
notifications-api: 2 replicas
```

Isto permite validar a aplicação num cenário mais próximo de produção, com balanceamento interno pelo Docker Swarm.

### 16.2 Portainer

Portainer foi adicionado para permitir administração visual dos containers e serviços Swarm.

Endpoint:

```text
http://localhost:9000
```

Na primeira abertura é necessário criar o utilizador administrador. Se a janela de criação expirar, o serviço deve ser reiniciado:

```bash
docker service update --force compensa_portainer
```

### 16.3 Volumes no Swarm

O volume PostgreSQL do Swarm foi alinhado com o Docker Compose para evitar perda aparente de dados:

```text
compensaproject_compensa_postgres_data
```

Assim, tanto `docker compose` como `docker stack` usam os mesmos dados.

## 17. Variáveis de ambiente

O projeto usa `.env` para configurar portas, credenciais, chaves e integrações.

Criar ficheiro:

```bash
cp .env.example .env
```

Variáveis críticas:

```text
POSTGRES_USER=compensa
POSTGRES_PASSWORD=...
POSTGRES_DB=compensa
POSTGRES_PORT=5432

IDENTITY_DB=CompensaIdentityDB
CORE_DB=CompensaCoreDB
AI_DB=CompensaAiDB
NOTIFICATIONS_DB=CompensaNotificationsDB

JWT_ISSUER=Compensa.Identity
JWT_AUDIENCE=Compensa.Api
JWT_SIGNING_KEY=...

FRONTEND_PUBLIC_URL=http://localhost:5173
VITE_API_URL=/api
VITE_ENABLE_DEV_LOGIN=false

EMAIL_SMTP_HOST=...
EMAIL_SMTP_PORT=587
EMAIL_USERNAME=...
EMAIL_PASSWORD=...

OPENAI_API_KEY=...
GEMINI_API_KEY=...

POSTGRES_VOLUME_NAME=compensaproject_compensa_postgres_data
CORE_UPLOADS_VOLUME_NAME=compensaproject_compensa_core_uploads
PORTAINER_VOLUME_NAME=compensa_portainer_data
```

### 17.1 Segurança das configurações

Valores sensíveis não devem ficar no repositório:

- passwords de base de dados;
- JWT signing key;
- credenciais SMTP;
- chaves OpenAI/Gemini;
- passwords administrativas.

Os ficheiros Docker exigem que `POSTGRES_PASSWORD` e `JWT_SIGNING_KEY` venham do `.env`.

## 18. Testes

Foram adicionados testes em diferentes níveis para reduzir risco de regressões.

## 18.1 Testes unitários e de integração no Core API

Pasta:

```text
Backend/Compensa.Core.Api/CompensaCoreApi.Tests/
  ApiContractTests.cs
  CompensationRequestAuthorizationTests.cs
  ScheduleConflictRuleTests.cs
```

Cobertura principal:

- contratos de API;
- regras de autorização em pedidos de compensação;
- regras de conflito de horários;
- cenários críticos de compensação.

Comando:

```bash
dotnet test Backend/Compensa.Core.Api/Compensa.Core.Api.sln
```

## 18.2 Testes unitários no Identity API

Pasta:

```text
Backend/Compensa.Identity.Api/CompensaIdentityApi.Tests/
  JwtTokenSecurityTests.cs
  JwtTokenServiceTests.cs
  RefreshTokenTests.cs
```

Cobertura principal:

- geração de JWT;
- validação de parâmetros de segurança;
- refresh tokens;
- garantias mínimas de assinatura e expiração.

Comando:

```bash
dotnet test Backend/Compensa.Identity.Api/Compensa.Identity.Api.sln
```

## 18.3 Testes no Notifications API

Pasta:

```text
Backend/Compensa.Notifications/tests/
  test_auth.py
  test_endpoints.py
  test_health.py
```

Cobertura principal:

- autenticação JWT;
- health check;
- endpoints de notificações;
- preferências.

Comando:

```bash
pytest Backend/Compensa.Notifications/tests
```

## 18.4 Testes no CompensaAI

Pasta:

```text
Backend/CompensaAI/tests/
  test_auth.py
  test_health.py
```

Cobertura principal:

- autenticação;
- health check;
- proteção de endpoints críticos.

Comando:

```bash
pytest Backend/CompensaAI/tests
```

## 18.5 Testes e2e no frontend

Pasta:

```text
Frontend/tests/e2e/
  auth.spec.ts
  authorization.spec.ts
  dashboard.spec.ts
  fixtures.ts
```

Configuração:

```text
Frontend/playwright.config.ts
```

O Playwright sobe o frontend numa porta própria:

```text
http://127.0.0.1:5174
```

E ativa:

```text
VITE_ENABLE_DEV_LOGIN=true
```

Isto é necessário porque a aplicação usa link mágico e não password. Nos testes e2e não se deve depender de email real.

Cobertura principal:

- fluxo de autenticação;
- acesso a rotas protegidas;
- autorização por perfil;
- renderização do dashboard;
- validação de pontos críticos da experiência principal.

Comando:

```bash
pnpm --dir Frontend test:e2e
```

## 19. Scripts de operação

### 19.1 Subir stack Swarm

```bash
./scripts/stack-up.sh
```

O script:

- valida Docker;
- valida `.env`;
- inicializa Swarm se necessário;
- constrói imagens, exceto quando `SKIP_BUILD=true`;
- resolve variáveis do `docker-stack.yml`;
- preserva nomes de volumes;
- aplica a stack;
- força rolling update dos serviços de aplicação com imagens locais;
- imprime links úteis de todos os serviços.

### 19.2 Subir sem rebuild

```bash
SKIP_BUILD=true ./scripts/stack-up.sh
```

### 19.3 Destruir stack

```bash
./scripts/stack-destroy.sh
```

### 19.4 Smoke test

```bash
./scripts/smoke-infra.sh
```

Valida:

- health do gateway;
- health do frontend;
- health do Identity API;
- health do Core API;
- health do CompensaAI;
- health do Notifications API;
- Prometheus;
- OpenTelemetry Collector;
- Grafana;
- dashboard provisionado;
- Aspire Dashboard.

## 20. Endpoints principais em ambiente local

Quando a stack está a correr:

```text
Frontend:                    http://localhost:5173
API Gateway:                 http://localhost:5005
Identity API:                http://localhost:5002
Core API:                    http://localhost:5001
CompensaAI:                  http://localhost:8000
Notifications API:           http://localhost:8001

Grafana:                     http://localhost:3000
Prometheus:                  http://localhost:9090
Alertmanager:                http://localhost:9093
Aspire Dashboard:            http://localhost:18888
OpenTelemetry metrics:       http://localhost:8889/metrics
Loki:                        http://localhost:3100
Tempo:                       http://localhost:3200

Portainer:                   http://localhost:9000
RabbitMQ Management:         http://localhost:15672
PostgreSQL:                  localhost:5432
Redis:                       localhost:6379
```

## 21. Fluxos principais da aplicação

### 21.1 Login

```text
Utilizador -> Frontend -> Identity API -> Email com link mágico
Utilizador -> Link mágico -> Identity API -> JWT -> Frontend
```

### 21.2 Pedido de compensação

```text
Professor -> Frontend -> Gateway -> Core API
Core API -> valida horários/salas/turma/docente
Core API -> PostgreSQL
Core API -> RabbitMQ
Notifications API -> cria notificação
```

### 21.3 Aprovação por coordenador

```text
Coordenador -> Frontend -> Gateway -> Core API
Core API -> valida permissões
Core API -> atualiza estado do pedido
Core API -> audita alteração
Core API -> publica evento
Notifications API -> notifica interessado
```

### 21.4 Assistente de IA

```text
Utilizador -> Frontend -> CompensaAI
CompensaAI -> valida JWT
CompensaAI -> OpenAI/Gemini
CompensaAI -> Core API tools
CompensaAI -> resposta contextual ao utilizador
```

## 22. Decisões técnicas relevantes

### 22.1 Microserviços

A separação em microserviços permite isolar responsabilidades. O Identity API pode evoluir sem afetar o Core API. O Notifications API pode escalar de forma independente. O CompensaAI pode integrar novos modelos sem alterar a lógica principal de compensações.

### 22.2 API Gateway

O gateway simplifica o frontend e centraliza o encaminhamento. Em vez de o frontend conhecer todas as URLs internas dos serviços, pode chamar o gateway.

### 22.3 DDD no Core API

O domínio principal tem mais complexidade e, por isso, foi estruturado com conceitos de DDD. Esta decisão permite proteger regras de negócio críticas, como conflitos de horário e autorização em pedidos.

### 22.4 Link mágico em vez de password

A autenticação sem password reduz a necessidade de gerir passwords e alinha-se com um fluxo simples para utilizadores académicos. A segurança passa a depender de tokens temporários, email e JWT.

### 22.5 Observabilidade desde o início

Métricas, logs e traces foram integrados para facilitar diagnóstico. Isto é especialmente importante numa arquitetura distribuída, onde um problema pode envolver múltiplos serviços.

### 22.6 Swarm com réplicas

O Docker Swarm foi usado para demonstrar orquestração real de containers. O `core-api` e o `notifications-api` correm com 2 réplicas para validar o comportamento em ambiente replicado.

## 23. Como preparar o ambiente

### 23.1 Criar `.env`

```bash
cp .env.example .env
```

Editar pelo menos:

```text
POSTGRES_PASSWORD
JWT_SIGNING_KEY
EMAIL_PASSWORD
OPENAI_API_KEY
GEMINI_API_KEY
```

### 23.2 Executar com Docker Compose

```bash
docker compose up --build
```

### 23.3 Executar com Docker Swarm

```bash
./scripts/stack-up.sh
```

### 23.4 Validar

```bash
./scripts/smoke-infra.sh
```

## 24. Estado atual da implementação

O projeto encontra-se implementado como uma solução distribuída funcional, com:

- frontend operacional;
- autenticação por link mágico;
- backend dividido por microserviços;
- domínio principal organizado em DDD;
- persistência PostgreSQL;
- mensageria RabbitMQ;
- cache Redis;
- observabilidade completa;
- dashboards Grafana;
- suporte a Aspire;
- Docker Compose;
- Docker Swarm;
- Portainer;
- testes unitários, integração e e2e.

## 25. Conclusão

A implementação do Compensa+ demonstra uma arquitetura moderna baseada em microserviços, com forte separação de responsabilidades, suporte a escalabilidade, preocupação com segurança, observabilidade e testes.

O Core API concentra as regras críticas de negócio e usa uma estrutura inspirada em DDD. O Identity API resolve autenticação sem password através de link mágico. O Notifications API trata eventos e notificações de forma desacoplada. O CompensaAI adiciona uma camada inteligente sem comprometer a centralização das regras de negócio. O frontend oferece uma experiência web completa, testada com Playwright.

A infraestrutura com Docker Compose e Docker Swarm permite executar o projeto localmente ou em modo orquestrado, com métricas e logs visíveis em Grafana e Aspire. Esta base técnica facilita manutenção, evolução futura e apresentação do projeto como sistema completo de fim de curso.
