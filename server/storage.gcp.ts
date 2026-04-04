// ============================================================
// Blúmen Vision — Google Cloud Storage Adapter
// Substitui o storage.ts do Manus por GCS nativo
// ============================================================
// Para usar este arquivo em produção GCP:
//   1. Renomear storage.ts → storage.manus.ts (backup)
//   2. Renomear storage.gcp.ts → storage.ts
//   3. Instalar: pnpm add @google-cloud/storage
// ============================================================

import { Storage } from "@google-cloud/storage";

const BUCKET_NAME = process.env.GCS_BUCKET || "blumenvision-storage";
const PROJECT_ID = process.env.GCP_PROJECT_ID || "blumenvision";

// O Cloud Run injeta credenciais automaticamente via Application Default Credentials
const storage = new Storage({ projectId: PROJECT_ID });
const bucket = storage.bucket(BUCKET_NAME);

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

/**
 * Upload de arquivo para o Google Cloud Storage
 * Mantém a mesma interface do storage.ts original
 */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  const file = bucket.file(key);

  const buffer =
    typeof data === "string" ? Buffer.from(data) : Buffer.from(data);

  await file.save(buffer, {
    metadata: {
      contentType,
      cacheControl: "public, max-age=31536000",
    },
    resumable: false,
  });

  // Gerar URL pública assinada (válida por 7 dias)
  const [signedUrl] = await file.getSignedUrl({
    action: "read",
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 dias
  });

  return { key, url: signedUrl };
}

/**
 * Obter URL de download assinada do Google Cloud Storage
 * Mantém a mesma interface do storage.ts original
 */
export async function storageGet(
  relKey: string,
  expiresInMs = 7 * 24 * 60 * 60 * 1000 // 7 dias default
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  const file = bucket.file(key);

  const [signedUrl] = await file.getSignedUrl({
    action: "read",
    expires: Date.now() + expiresInMs,
  });

  return { key, url: signedUrl };
}

/**
 * Deletar arquivo do Google Cloud Storage
 */
export async function storageDelete(relKey: string): Promise<void> {
  const key = normalizeKey(relKey);
  const file = bucket.file(key);
  await file.delete({ ignoreNotFound: true });
}

/**
 * Verificar se arquivo existe no Google Cloud Storage
 */
export async function storageExists(relKey: string): Promise<boolean> {
  const key = normalizeKey(relKey);
  const file = bucket.file(key);
  const [exists] = await file.exists();
  return exists;
}
