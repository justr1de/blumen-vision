#!/bin/bash
# ============================================================
# Blúmen Vision — Provisionamento de Infraestrutura GCP
# Projeto: blumenvision (375006379721)
# Região: southamerica-east1 (São Paulo)
# ============================================================

set -euo pipefail

# ── Variáveis ────────────────────────────────────────────────
PROJECT_ID="blumenvision"
REGION="southamerica-east1"
ZONE="${REGION}-a"
SERVICE_NAME="blumen-vision-app"
DB_INSTANCE_NAME="blumen-vision-db"
DB_NAME="blumenvision"
DB_USER="blumen_admin"
BUCKET_NAME="${PROJECT_ID}-storage"
ARTIFACT_REPO="blumen-vision"
SERVICE_ACCOUNT_NAME="blumen-vision-sa"

echo "============================================"
echo " Blúmen Vision — Setup GCP"
echo " Projeto: ${PROJECT_ID}"
echo " Região:  ${REGION}"
echo "============================================"

# ── 1. Configurar projeto ────────────────────────────────────
echo ""
echo "▸ [1/8] Configurando projeto GCP..."
gcloud config set project ${PROJECT_ID}
gcloud config set compute/region ${REGION}
gcloud config set compute/zone ${ZONE}

# ── 2. Habilitar APIs necessárias ────────────────────────────
echo ""
echo "▸ [2/8] Habilitando APIs..."
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  storage.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  iam.googleapis.com \
  compute.googleapis.com \
  servicenetworking.googleapis.com

echo "  ✓ APIs habilitadas"

# ── 3. Criar Service Account ────────────────────────────────
echo ""
echo "▸ [3/8] Criando Service Account..."
SA_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

gcloud iam service-accounts create ${SERVICE_ACCOUNT_NAME} \
  --display-name="Blúmen Vision Service Account" \
  --description="Service account para o sistema Blúmen Vision" \
  2>/dev/null || echo "  (Service Account já existe)"

# Atribuir roles necessárias
for ROLE in \
  roles/run.invoker \
  roles/cloudsql.client \
  roles/storage.objectAdmin \
  roles/secretmanager.secretAccessor \
  roles/aiplatform.user \
  roles/logging.logWriter \
  roles/monitoring.metricWriter; do
  gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="${ROLE}" \
    --quiet 2>/dev/null
done

echo "  ✓ Service Account configurada: ${SA_EMAIL}"

# ── 4. Criar Cloud SQL (PostgreSQL) ─────────────────────────
echo ""
echo "▸ [4/8] Criando instância Cloud SQL (PostgreSQL 15)..."
echo "  ⚠ Isso pode levar 5-10 minutos..."

gcloud sql instances create ${DB_INSTANCE_NAME} \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=${REGION} \
  --storage-type=SSD \
  --storage-size=10GB \
  --storage-auto-increase \
  --backup-start-time=03:00 \
  --availability-type=zonal \
  --root-password="$(openssl rand -base64 24)" \
  2>/dev/null || echo "  (Instância já existe)"

# Gerar senha segura para o usuário da aplicação
DB_PASSWORD=$(openssl rand -base64 24)

# Criar usuário
gcloud sql users create ${DB_USER} \
  --instance=${DB_INSTANCE_NAME} \
  --password="${DB_PASSWORD}" \
  2>/dev/null || echo "  (Usuário já existe)"

# Criar banco de dados
gcloud sql databases create ${DB_NAME} \
  --instance=${DB_INSTANCE_NAME} \
  2>/dev/null || echo "  (Banco já existe)"

# Obter connection name
CONNECTION_NAME=$(gcloud sql instances describe ${DB_INSTANCE_NAME} --format='value(connectionName)')

echo "  ✓ Cloud SQL criado"
echo "  ✓ Connection: ${CONNECTION_NAME}"
echo "  ✓ DATABASE_URL: postgresql://${DB_USER}:****@/${DB_NAME}?host=/cloudsql/${CONNECTION_NAME}"

# ── 5. Criar Cloud Storage Bucket ───────────────────────────
echo ""
echo "▸ [5/8] Criando bucket Cloud Storage..."

gcloud storage buckets create gs://${BUCKET_NAME} \
  --location=${REGION} \
  --uniform-bucket-level-access \
  --public-access-prevention=enforced \
  2>/dev/null || echo "  (Bucket já existe)"

# Configurar CORS para o bucket
cat > /tmp/cors.json << 'EOF'
[
  {
    "origin": ["*"],
    "method": ["GET", "PUT", "POST", "DELETE"],
    "responseHeader": ["Content-Type", "Authorization"],
    "maxAgeSeconds": 3600
  }
]
EOF

gcloud storage buckets update gs://${BUCKET_NAME} --cors-file=/tmp/cors.json
rm /tmp/cors.json

echo "  ✓ Bucket criado: gs://${BUCKET_NAME}"

# ── 6. Criar Artifact Registry ──────────────────────────────
echo ""
echo "▸ [6/8] Criando repositório Artifact Registry..."

gcloud artifacts repositories create ${ARTIFACT_REPO} \
  --repository-format=docker \
  --location=${REGION} \
  --description="Imagens Docker do Blúmen Vision" \
  2>/dev/null || echo "  (Repositório já existe)"

echo "  ✓ Artifact Registry: ${REGION}-docker.pkg.dev/${PROJECT_ID}/${ARTIFACT_REPO}"

# ── 7. Criar Secrets no Secret Manager ──────────────────────
echo ""
echo "▸ [7/8] Configurando secrets..."

# JWT Secret
JWT_SECRET=$(openssl rand -base64 32)
echo -n "${JWT_SECRET}" | gcloud secrets create jwt-secret \
  --data-file=- \
  --replication-policy=automatic \
  2>/dev/null || echo "  (Secret jwt-secret já existe)"

# Database URL
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@/${DB_NAME}?host=/cloudsql/${CONNECTION_NAME}"
echo -n "${DATABASE_URL}" | gcloud secrets create database-url \
  --data-file=- \
  --replication-policy=automatic \
  2>/dev/null || echo "  (Secret database-url já existe)"

# Gemini API Key (placeholder — substituir pela chave real)
echo -n "SUBSTITUIR_PELA_CHAVE_REAL" | gcloud secrets create gemini-api-key \
  --data-file=- \
  --replication-policy=automatic \
  2>/dev/null || echo "  (Secret gemini-api-key já existe)"

echo "  ✓ Secrets configurados no Secret Manager"

# ── 8. Deploy inicial no Cloud Run ──────────────────────────
echo ""
echo "▸ [8/8] Preparando deploy no Cloud Run..."
echo ""
echo "  Para fazer o primeiro deploy, execute:"
echo ""
echo "  # Build e push da imagem"
echo "  docker build -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/${ARTIFACT_REPO}/${SERVICE_NAME}:latest ."
echo "  docker push ${REGION}-docker.pkg.dev/${PROJECT_ID}/${ARTIFACT_REPO}/${SERVICE_NAME}:latest"
echo ""
echo "  # Ou via gcloud (build remoto):"
echo "  gcloud run deploy ${SERVICE_NAME} \\"
echo "    --source . \\"
echo "    --region ${REGION} \\"
echo "    --service-account ${SA_EMAIL} \\"
echo "    --allow-unauthenticated \\"
echo "    --add-cloudsql-instances ${CONNECTION_NAME} \\"
echo "    --set-secrets DATABASE_URL=database-url:latest,JWT_SECRET=jwt-secret:latest,GEMINI_API_KEY=gemini-api-key:latest \\"
echo "    --set-env-vars NODE_ENV=production,GCS_BUCKET=${BUCKET_NAME},GCP_PROJECT_ID=${PROJECT_ID} \\"
echo "    --memory 1Gi \\"
echo "    --cpu 1 \\"
echo "    --min-instances 0 \\"
echo "    --max-instances 10 \\"
echo "    --port 8080"

echo ""
echo "============================================"
echo " ✓ Infraestrutura GCP provisionada!"
echo "============================================"
echo ""
echo " Resumo:"
echo "  • Projeto:          ${PROJECT_ID}"
echo "  • Região:           ${REGION}"
echo "  • Cloud SQL:        ${DB_INSTANCE_NAME} (PostgreSQL 15)"
echo "  • Database:         ${DB_NAME}"
echo "  • Bucket:           gs://${BUCKET_NAME}"
echo "  • Artifact Registry: ${REGION}-docker.pkg.dev/${PROJECT_ID}/${ARTIFACT_REPO}"
echo "  • Service Account:  ${SA_EMAIL}"
echo ""
echo " ⚠ IMPORTANTE:"
echo "  1. Atualize o secret 'gemini-api-key' com sua chave real do Gemini"
echo "  2. Salve a senha do banco: ${DB_PASSWORD}"
echo "  3. Configure o domínio personalizado no Cloud Run após o primeiro deploy"
echo ""
