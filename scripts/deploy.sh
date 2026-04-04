#!/bin/bash
# ============================================================
# Blúmen Vision — Deploy rápido no Cloud Run
# Uso: ./scripts/deploy.sh [tag]
# ============================================================

set -euo pipefail

PROJECT_ID="blumenvision"
REGION="southamerica-east1"
SERVICE_NAME="blumen-vision-app"
ARTIFACT_REPO="blumen-vision"
SA_EMAIL="blumen-vision-sa@${PROJECT_ID}.iam.gserviceaccount.com"

# Tag da imagem (default: timestamp)
TAG="${1:-$(date +%Y%m%d-%H%M%S)}"
IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${ARTIFACT_REPO}/${SERVICE_NAME}:${TAG}"

# Connection name do Cloud SQL
CONNECTION_NAME=$(gcloud sql instances describe blumen-vision-db --format='value(connectionName)' 2>/dev/null || echo "")

echo "▸ Deploying Blúmen Vision..."
echo "  Image: ${IMAGE}"
echo "  Region: ${REGION}"
echo ""

# Deploy via gcloud (build remoto + deploy)
gcloud run deploy ${SERVICE_NAME} \
  --source . \
  --region ${REGION} \
  --service-account ${SA_EMAIL} \
  --allow-unauthenticated \
  --add-cloudsql-instances ${CONNECTION_NAME} \
  --set-secrets "DATABASE_URL=database-url:latest,JWT_SECRET=jwt-secret:latest,GEMINI_API_KEY=gemini-api-key:latest" \
  --set-env-vars "NODE_ENV=production,GCS_BUCKET=${PROJECT_ID}-storage,GCP_PROJECT_ID=${PROJECT_ID}" \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --port 8080

# Obter URL do serviço
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format='value(status.url)')

echo ""
echo "✓ Deploy concluído!"
echo "  URL: ${SERVICE_URL}"
echo ""
