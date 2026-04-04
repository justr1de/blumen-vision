# Blúmen Vision — Guia de Deploy no Google Cloud Platform

**Projeto GCP:** blumenvision | **ID:** 375006379721 | **Região:** southamerica-east1 (São Paulo)

---

## Visão Geral da Arquitetura

O sistema Blúmen Vision será hospedado inteiramente na infraestrutura do Google Cloud Platform, utilizando serviços gerenciados que garantem escalabilidade, segurança e baixa latência para usuários no Brasil. A arquitetura segue o padrão de aplicação containerizada com banco de dados gerenciado e armazenamento de objetos.

| Componente | Serviço GCP | Descrição |
|------------|-------------|-----------|
| Aplicação (Frontend + Backend) | **Cloud Run** | Container Node.js com Express + React SPA |
| Banco de Dados | **Cloud SQL** | PostgreSQL 15 gerenciado |
| Armazenamento de Arquivos | **Cloud Storage** | Bucket para planilhas, PDFs e assets |
| Inteligência Artificial | **Vertex AI / Gemini API** | Motor de IA para análise financeira |
| Secrets e Credenciais | **Secret Manager** | Gerenciamento seguro de variáveis sensíveis |
| Container Registry | **Artifact Registry** | Armazenamento de imagens Docker |
| CI/CD | **Cloud Build** | Build e deploy automatizados |
| Landing Page | **Vercel** | Página institucional (separada) |

---

## Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                     Google Cloud Platform                        │
│                    Projeto: blumenvision                         │
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐   │
│  │  Cloud Run    │───▸│  Cloud SQL   │    │  Cloud Storage   │   │
│  │  (Node.js)   │    │ (PostgreSQL) │    │  (Planilhas/PDF) │   │
│  │  Port: 8080  │    │  db-f1-micro │    │  blumenvision-   │   │
│  └──────┬───────┘    └──────────────┘    │  storage         │   │
│         │                                 └──────────────────┘   │
│         │            ┌──────────────┐                            │
│         ├───────────▸│  Vertex AI   │                            │
│         │            │  (Gemini)    │                            │
│         │            └──────────────┘                            │
│         │                                                        │
│         │            ┌──────────────┐    ┌──────────────────┐   │
│         ├───────────▸│  Secret Mgr  │    │ Artifact Registry│   │
│         │            └──────────────┘    └──────────────────┘   │
│         │                                                        │
└─────────┼────────────────────────────────────────────────────────┘
          │
          │  HTTPS
          │
┌─────────┴─────────┐         ┌──────────────────────┐
│   Usuários         │         │  Vercel              │
│   (Navegador)      │◂───────▸│  Landing Page         │
│                    │  Link   │  financeiro-armuti... │
└────────────────────┘         └──────────────────────┘
```

---

## Pré-requisitos

Antes de iniciar o deploy, certifique-se de que os seguintes itens estão configurados na sua máquina local ou ambiente de CI/CD.

| Requisito | Versão Mínima | Comando de Verificação |
|-----------|---------------|------------------------|
| Google Cloud CLI (gcloud) | 450+ | `gcloud --version` |
| Docker | 24+ | `docker --version` |
| Node.js | 22+ | `node --version` |
| pnpm | 10+ | `pnpm --version` |

Para instalar o Google Cloud CLI, acesse [cloud.google.com/sdk/docs/install](https://cloud.google.com/sdk/docs/install) e siga as instruções para seu sistema operacional.

---

## Etapa 1: Provisionamento da Infraestrutura

O script `scripts/gcp-setup.sh` automatiza a criação de todos os recursos necessários no GCP. Ele deve ser executado uma única vez, antes do primeiro deploy.

```bash
# Autenticar no GCP
gcloud auth login
gcloud config set project blumenvision

# Executar o script de provisionamento
chmod +x scripts/gcp-setup.sh
./scripts/gcp-setup.sh
```

O script realiza as seguintes operações em sequência:

1. Habilita as APIs necessárias (Cloud Run, Cloud SQL, Storage, Artifact Registry, Cloud Build, Secret Manager)
2. Cria uma Service Account dedicada (`blumen-vision-sa`) com os papéis IAM necessários
3. Provisiona uma instância Cloud SQL PostgreSQL 15 (tier `db-f1-micro`, 10GB SSD)
4. Cria o banco de dados `blumenvision` e o usuário `blumen_admin` com senha gerada automaticamente
5. Cria um bucket Cloud Storage com CORS configurado
6. Cria o repositório no Artifact Registry para imagens Docker
7. Armazena secrets no Secret Manager (JWT_SECRET, DATABASE_URL, GEMINI_API_KEY)

> **Importante:** Anote a senha do banco de dados exibida ao final do script. Ela será necessária para conexão direta ao banco.

---

## Etapa 2: Migração do Banco de Dados (MySQL → PostgreSQL)

O sistema atualmente utiliza MySQL (TiDB) no ambiente Manus. Para o GCP, será necessário migrar para PostgreSQL. O guia detalhado está em `scripts/migrate-to-postgres.md`, mas os passos principais são apresentados a seguir.

```bash
# 1. Instalar driver PostgreSQL
pnpm add pg @types/pg
pnpm remove mysql2

# 2. Atualizar drizzle.config.ts (dialect: "postgresql")
# 3. Atualizar drizzle/schema.ts (mysqlTable → pgTable)
# 4. Atualizar server/db.ts (mysql2 → node-postgres)

# 5. Gerar e aplicar migrações
pnpm db:push
```

O formato da `DATABASE_URL` para Cloud SQL via Cloud Run utiliza Unix socket, conforme o padrão abaixo:

```
postgresql://blumen_admin:SENHA@/blumenvision?host=/cloudsql/blumenvision:southamerica-east1:blumen-vision-db
```

---

## Etapa 3: Substituição dos Adaptadores Manus

O projeto contém adaptadores prontos para substituir os serviços Manus por equivalentes GCP nativos. Os arquivos `.gcp.ts` foram criados como drop-in replacements.

| Arquivo Manus (atual) | Arquivo GCP (substituição) | Serviço GCP |
|------------------------|---------------------------|-------------|
| `server/storage.ts` | `server/storage.gcp.ts` | Cloud Storage |
| `server/_core/llm.ts` | `server/llm.gcp.ts` | Gemini API REST |
| `server/_core/env.ts` | `server/env.gcp.ts` | Variáveis nativas |

Para aplicar a substituição, basta renomear os arquivos conforme o procedimento descrito em cada arquivo `.gcp.ts`. As interfaces (assinaturas de funções) foram mantidas idênticas, garantindo que nenhum código consumidor precise ser alterado.

Dependências adicionais necessárias para os adaptadores GCP:

```bash
pnpm add @google-cloud/storage
# Opcional (se usar Vertex AI SDK em vez de REST):
# pnpm add @google-cloud/vertexai
```

---

## Etapa 4: Deploy no Cloud Run

Existem três opções para realizar o deploy, ordenadas da mais simples para a mais robusta.

### Opção A: Deploy direto via gcloud (recomendada para início)

```bash
gcloud run deploy blumen-vision-app \
  --source . \
  --region southamerica-east1 \
  --service-account blumen-vision-sa@blumenvision.iam.gserviceaccount.com \
  --allow-unauthenticated \
  --add-cloudsql-instances blumenvision:southamerica-east1:blumen-vision-db \
  --set-secrets "DATABASE_URL=database-url:latest,JWT_SECRET=jwt-secret:latest,GEMINI_API_KEY=gemini-api-key:latest" \
  --set-env-vars "NODE_ENV=production,GCS_BUCKET=blumenvision-storage,GCP_PROJECT_ID=blumenvision" \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --port 8080
```

### Opção B: Deploy via script automatizado

```bash
./scripts/deploy.sh
```

### Opção C: CI/CD via Cloud Build (produção)

O arquivo `cloudbuild.yaml` na raiz do projeto configura o pipeline completo de build, push e deploy. Para ativá-lo, conecte o repositório GitHub ao Cloud Build no console do GCP.

```bash
# Trigger manual
gcloud builds submit --config cloudbuild.yaml .
```

---

## Etapa 5: Configuração de Domínio

Após o primeiro deploy, o Cloud Run fornecerá uma URL automática no formato `https://blumen-vision-app-XXXXX-rj.a.run.app`. Para configurar um domínio personalizado, siga os passos abaixo.

```bash
# Mapear domínio personalizado
gcloud run domain-mappings create \
  --service blumen-vision-app \
  --domain app.blumenbiz.com \
  --region southamerica-east1
```

O GCP fornecerá registros DNS (CNAME ou A) que devem ser configurados no registro.br ou no provedor DNS do domínio. O certificado SSL é provisionado automaticamente pelo Cloud Run.

---

## Etapa 6: Vincular Landing Page (Vercel)

A landing page em https://financeiro-armuti-pmpb.vercel.app/ deve ter seus botões de "Acessar plataforma" e "Acessar Blúmen Vision" apontando para a URL do sistema no Cloud Run. Os links a serem atualizados no código da landing page são os seguintes.

| Botão na Landing Page | URL de Destino |
|----------------------|----------------|
| "Acessar plataforma" (hero) | `https://app.blumenbiz.com` ou URL do Cloud Run |
| "BLÚMEN VISION" (nav) | `https://app.blumenbiz.com` |
| "Acessar Blúmen Vision" (ecossistema) | `https://app.blumenbiz.com` |
| "Acessar plataforma" (contato) | `https://app.blumenbiz.com` |

---

## Variáveis de Ambiente

O arquivo `.env.gcp.example` contém todas as variáveis necessárias para o ambiente GCP. Em produção, as variáveis sensíveis são gerenciadas pelo Secret Manager e injetadas automaticamente no Cloud Run.

| Variável | Origem | Descrição |
|----------|--------|-----------|
| `DATABASE_URL` | Secret Manager | Connection string do Cloud SQL PostgreSQL |
| `JWT_SECRET` | Secret Manager | Chave para assinar session cookies |
| `GEMINI_API_KEY` | Secret Manager | Chave da API Gemini para IA |
| `GCP_PROJECT_ID` | Env var | ID do projeto GCP (`blumenvision`) |
| `GCS_BUCKET` | Env var | Nome do bucket Cloud Storage |
| `NODE_ENV` | Env var | Ambiente (`production`) |
| `PORT` | Cloud Run (auto) | Porta do servidor (8080) |

---

## Estimativa de Custos

A estimativa abaixo considera uso moderado (até 1.000 requisições/dia, 10GB de dados, 5 usuários simultâneos) na região `southamerica-east1`.

| Serviço | Tier/Config | Custo Mensal Estimado |
|---------|-------------|----------------------|
| Cloud Run | 1 vCPU, 1GB RAM, min 0 instâncias | R$ 0 – R$ 50 (pay-per-use) |
| Cloud SQL | db-f1-micro, 10GB SSD | R$ 40 – R$ 60 |
| Cloud Storage | 10GB, classe Standard | R$ 2 – R$ 5 |
| Artifact Registry | Armazenamento de imagens | R$ 1 – R$ 3 |
| Secret Manager | 3 secrets, ~100 acessos/dia | R$ 0 (free tier) |
| Gemini API | ~1.000 chamadas/dia | R$ 0 – R$ 30 (free tier generoso) |
| **Total estimado** | | **R$ 43 – R$ 148/mês** |

> **Nota:** Os créditos GCP disponíveis (R$ 7.738 restantes) cobrem aproximadamente 4-15 anos de operação neste nível de uso.

---

## Checklist de Deploy

| Etapa | Status | Comando/Ação |
|-------|--------|-------------|
| Autenticar no GCP | ☐ | `gcloud auth login` |
| Executar script de setup | ☐ | `./scripts/gcp-setup.sh` |
| Migrar schema para PostgreSQL | ☐ | Ver `scripts/migrate-to-postgres.md` |
| Substituir adaptadores Manus → GCP | ☐ | Renomear arquivos `.gcp.ts` |
| Instalar dependências GCP | ☐ | `pnpm add @google-cloud/storage pg` |
| Atualizar GEMINI_API_KEY no Secret Manager | ☐ | `gcloud secrets versions add gemini-api-key --data-file=-` |
| Primeiro deploy no Cloud Run | ☐ | `./scripts/deploy.sh` |
| Configurar domínio personalizado | ☐ | `gcloud run domain-mappings create ...` |
| Atualizar links na landing page Vercel | ☐ | Editar código no repositório Vercel |
| Testar autenticação e fluxos | ☐ | Acessar URL do Cloud Run |

---

## Arquivos de Migração Criados

| Arquivo | Descrição |
|---------|-----------|
| `Dockerfile` | Multi-stage build para Cloud Run (Node.js 22 Alpine) |
| `.dockerignore` | Exclusões para otimizar o build Docker |
| `cloudbuild.yaml` | Pipeline CI/CD para Cloud Build |
| `scripts/gcp-setup.sh` | Provisionamento automatizado da infraestrutura GCP |
| `scripts/deploy.sh` | Script de deploy rápido no Cloud Run |
| `scripts/migrate-to-postgres.md` | Guia de migração MySQL → PostgreSQL |
| `server/storage.gcp.ts` | Adaptador Cloud Storage (substitui Forge storage) |
| `server/llm.gcp.ts` | Adaptador Gemini API (substitui Forge LLM) |
| `server/env.gcp.ts` | Variáveis de ambiente GCP (substitui Manus env) |
| `.env.gcp.example` | Template de variáveis de ambiente |

---

## Suporte e Contato

Para questões técnicas sobre a infraestrutura GCP, entre em contato com a equipe DATA-RO Inteligência Territorial (contato@dataro-it.com.br).
