# Deploy Azure Compensa+

Esta pasta implementa a estratégia descrita no relatório: Azure para infraestrutura, Terraform para provisionamento, Ansible para configuração das VMs e Docker Swarm para execução dos serviços.

## Topologia provisionada

O deploy segue a topologia de 5 máquinas do diagrama:

| Máquina | Subnet | Tamanho | Função |
| --- | --- | --- | --- |
| `compensa-swarm-manager` | `10.0.1.0/24` | `Standard_B2ms` | Entrada pública, API Gateway, Nginx e manager do Docker Swarm |
| `compensa-backend` | `10.0.1.0/24` | `Standard_B2ms` | Core API, Identity API, Notifications API e Compensa AI API |
| `compensa-db` | `10.0.2.0/24` | `Standard_B2ms` + disco 64 GB | PostgreSQL |
| `compensa-cache` | `10.0.2.0/24` | `Standard_B2s` | Redis e RabbitMQ |
| `compensa-ops` | `10.0.3.0/24` | `Standard_B2s` | Portainer, Grafana, Prometheus, Loki, Tempo, OTel Collector e Aspire |

O Terraform cria:

- Resource Group `compensa-rg`;
- VNet `10.0.0.0/16`;
- subnet de aplicação `10.0.1.0/24`;
- subnet de dados `10.0.2.0/24`;
- subnet de operações `10.0.3.0/24`;
- NSG público para a camada de aplicação, com entrada 80/443 pelo manager e SSH controlado;
- NSG privado para dados e operações;
- VMs:
  - `compensa-swarm-manager`: manager do Swarm, frontend/Nginx e API Gateway;
  - `compensa-backend`: Core API, Identity API, Notifications API e Compensa AI;
  - `compensa-db`: PostgreSQL com disco gerido de 64 GB;
  - `compensa-cache`: Redis e RabbitMQ;
  - `compensa-ops`: Grafana, Prometheus, Loki, Tempo, OpenTelemetry Collector, Aspire e Portainer;
- Azure Container Registry para as imagens Docker;
- Azure Key Vault para secrets operacionais.

## GitHub Secrets necessários

Azure/OIDC:

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`

HCP Terraform/Terraform Cloud:

- `HCP_TERRAFORM_TOKEN`

SSH:

- `AZURE_VM_SSH_PUBLIC_KEY`
- `AZURE_VM_SSH_PRIVATE_KEY`

Aplicação:

- `POSTGRES_PASSWORD`
- `JWT_SIGNING_KEY`
- `RABBITMQ_PASS`
- `EMAIL_USERNAME`
- `EMAIL_PASSWORD`
- `OPENAI_API_KEY`
- `GEMINI_API_KEY`

GitHub Variables recomendadas:

- `ADMIN_SOURCE_CIDRS`: lista JSON de CIDRs autorizados para SSH, por exemplo `["203.0.113.10/32"]`;
- `AZURE_LOCATION`: por exemplo `westeurope`;
- `HCP_TERRAFORM_ORGANIZATION`: organização HCP Terraform;
- `HCP_TERRAFORM_WORKSPACE`: workspace HCP Terraform, por exemplo `compensa-prod`;
- `EMAIL_FROM_ADDRESS`;
- `EMAIL_FROM_NAME`;
- `EMAIL_SMTP_HOST`;
- `EMAIL_SMTP_PORT`;
- `IDENTITY_SEED_ADMIN_EMAIL`.

## Fluxo de deploy

1. Executar o workflow `Azure Infrastructure` em modo manual com `apply=true`.
2. O Terraform cria ou atualiza os recursos Azure e exporta o inventário Ansible.
3. Executar o workflow `Azure Deploy`.
4. O workflow constrói as imagens Docker, publica-as no ACR e executa o Ansible.
5. O Ansible instala Docker, inicializa o Swarm, associa os workers, aplica labels booleanas de placement e executa `docker stack deploy`.

No Swarm, o manager coordena o cluster e os restantes quatro nós entram como workers. O placement dos serviços é controlado por labels:

- `compensa.manager=true`: gateway, frontend/Nginx e serviços que precisam de estar no manager;
- `compensa.backend=true`: APIs da aplicação;
- `compensa.db=true`: PostgreSQL;
- `compensa.cache=true`: Redis e RabbitMQ;
- `compensa.ops=true`: observabilidade e administração.

## Execução local

Com credenciais Azure e HCP Terraform configuradas localmente:

```bash
cat > infra/terraform/azure/backend.hcl <<EOF
organization = "<hcp-terraform-org>"
workspaces {
  name = "compensa-prod"
}
EOF

terraform -chdir=infra/terraform/azure init -backend-config=backend.hcl

terraform -chdir=infra/terraform/azure apply
terraform -chdir=infra/terraform/azure output -raw ansible_inventory > infra/ansible/inventory/azure.ini
```

Depois de publicar as imagens no ACR:

```bash
cd infra/ansible
ansible-galaxy collection install -r requirements.yml
ansible-playbook playbooks/site.yml \
  --extra-vars "acr_login_server=<acr>.azurecr.io" \
  --extra-vars "acr_username=<acr-user-or-token-user>" \
  --extra-vars "acr_password=<acr-password-or-token>" \
  --extra-vars "image_tag=<tag>" \
  --extra-vars "postgres_password=<secret>" \
  --extra-vars "jwt_signing_key=<secret>" \
  --extra-vars "rabbitmq_pass=<secret>"
```

## Notas

- O manager é a única VM com IP público.
- As restantes VMs são acedidas pelo Ansible via `ProxyJump` através do manager.
- O backend fica na subnet de aplicação, mas não recebe IP público; todo o tráfego externo entra por 80/443 no manager.
- O state Terraform fica em HCP Terraform/Terraform Cloud, usando o backend HashiCorp `remote` com execução local no GitHub Actions.
- O disco de 64 GB da VM `compensa-db` é montado em `/var/lib/docker`, garantindo persistência dos volumes locais do PostgreSQL.
- O `docker-stack.yml` usa `IMAGE_REGISTRY_PREFIX` e `IMAGE_TAG`, mantendo compatibilidade com o Swarm local quando essas variáveis não existem.
- Em ambiente local, `scripts/stack-up.sh` aplica todas as labels `compensa.*=true` ao nó único para manter o stack funcional em single-node; em produção, o Ansible aplica apenas a label da função de cada VM.
