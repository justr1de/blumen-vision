# Blumen Vision API — Deploy no Google Cloud Run

Este diretório contém o código equivalente ao backend tRPC do portal Manus, adaptado para rodar como serviço independente no Google Cloud Run com FastAPI e integração direta com o Gemini via Vertex AI.

## Arquitetura

O serviço expõe 4 endpoints REST que replicam as funcionalidades do router `ai` do tRPC, permitindo que o frontend Next.js (ou qualquer outro cliente) consuma a API de IA financeira diretamente do Cloud Run.

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/ai/health` | GET | Health check da integração Gemini |
| `/api/ai/chat` | POST | Chat financeiro inteligente com contexto |
| `/api/ai/analyze-pdf` | POST | Análise de PDFs com Gemini (texto livre) |
| `/api/ai/extract` | POST | Extração estruturada de dados (retorna JSON) |

## Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `GEMINI_API_KEY` | Sim (dev) | Chave da API Gemini para desenvolvimento |
| `GOOGLE_APPLICATION_CREDENTIALS` | Sim (prod) | Caminho para o JSON da Service Account |
| `GCP_PROJECT_ID` | Não | ID do projeto GCP (default: `blumenvision`) |
| `GCP_REGION` | Não | Região do Vertex AI (default: `southamerica-east1`) |
| `PORT` | Não | Porta do servidor (default: `8080`, injetada pelo Cloud Run) |

## Deploy

### Opção 1: Deploy via gcloud CLI

```bash
# Autenticar
gcloud auth login
gcloud config set project blumenvision

# Build e deploy
cd cloud-run
gcloud run deploy blumen-vision-api \
  --source . \
  --region southamerica-east1 \
  --allow-unauthenticated \
  --set-env-vars "GEMINI_API_KEY=sua_chave_aqui" \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 5
```

### Opção 2: Deploy via Artifact Registry + Docker

```bash
# Build da imagem
docker build -t southamerica-east1-docker.pkg.dev/blumenvision/blumen-api/blumen-vision-api:latest .

# Push para o Artifact Registry
docker push southamerica-east1-docker.pkg.dev/blumenvision/blumen-api/blumen-vision-api:latest

# Deploy no Cloud Run
gcloud run deploy blumen-vision-api \
  --image southamerica-east1-docker.pkg.dev/blumenvision/blumen-api/blumen-vision-api:latest \
  --region southamerica-east1 \
  --allow-unauthenticated
```

### Opção 3: Deploy via Cloud Build (CI/CD)

Crie um arquivo `cloudbuild.yaml` na raiz:

```yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'southamerica-east1-docker.pkg.dev/$PROJECT_ID/blumen-api/blumen-vision-api:$COMMIT_SHA', '.']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'southamerica-east1-docker.pkg.dev/$PROJECT_ID/blumen-api/blumen-vision-api:$COMMIT_SHA']
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'blumen-vision-api'
      - '--image'
      - 'southamerica-east1-docker.pkg.dev/$PROJECT_ID/blumen-api/blumen-vision-api:$COMMIT_SHA'
      - '--region'
      - 'southamerica-east1'
```

## Payloads de Exemplo

### Chat

```json
POST /api/ai/chat
{
  "messages": [
    {"role": "user", "content": "Explique a estrutura de um DRE gerencial"}
  ]
}
```

### Análise de PDF

```json
POST /api/ai/analyze-pdf
{
  "file_base64": "JVBERi0xLjQK...",
  "file_name": "extrato_bmg.pdf",
  "mime_type": "application/pdf",
  "prompt": "Identifique todas as taxas de juros neste contrato"
}
```

### Extração Estruturada

```json
POST /api/ai/extract
{
  "file_base64": "JVBERi0xLjQK...",
  "file_name": "dre_2025.pdf",
  "extraction_type": "dre"
}
```

## Correspondência com o Backend Manus (tRPC)

| tRPC (Manus) | REST (Cloud Run) | Observação |
|--------------|-------------------|------------|
| `trpc.ai.chat.mutate()` | `POST /api/ai/chat` | Mesmo payload, mesma resposta |
| `trpc.ai.analyzePdf.mutate()` | `POST /api/ai/analyze-pdf` | camelCase → snake_case |
| `trpc.ai.analyzeStructured.mutate()` | `POST /api/ai/extract` | camelCase → snake_case |
| `trpc.ai.health.query()` | `GET /api/ai/health` | Sem autenticação |

## Segurança em Produção

Para produção, recomenda-se substituir a `GEMINI_API_KEY` por autenticação via Service Account, que é injetada automaticamente no Cloud Run. O código já suporta ambos os modos: se `GEMINI_API_KEY` estiver definida, usa a chave diretamente; caso contrário, usa Application Default Credentials (ADC).

Passos para configurar Service Account:

1. Criar conta de serviço com papel `Vertex AI User`
2. Associar ao serviço Cloud Run nas configurações de IAM
3. Remover a variável `GEMINI_API_KEY` do ambiente de produção
