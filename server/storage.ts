/**
 * Storage — GCS-based (Manus Forge removed)
 * Uses Google Cloud Storage when GCS_BUCKET is configured,
 * otherwise falls back to local filesystem storage.
 */
import fs from "fs";
import path from "path";

const GCS_BUCKET = process.env.GCS_BUCKET || "";
const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const key = relKey.replace(/^\/+/, "");

  if (GCS_BUCKET) {
    // GCS upload via REST API
    const { Storage } = await import("@google-cloud/storage");
    const storage = new Storage();
    const bucket = storage.bucket(GCS_BUCKET);
    const file = bucket.file(key);
    const buffer = typeof data === "string" ? Buffer.from(data) : Buffer.from(data);
    await file.save(buffer, { contentType, resumable: false });
    await file.makePublic();
    const url = `https://storage.googleapis.com/${GCS_BUCKET}/${key}`;
    return { key, url };
  }

  // Fallback: local filesystem
  ensureUploadDir();
  const filePath = path.join(UPLOAD_DIR, key);
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const buffer = typeof data === "string" ? Buffer.from(data) : Buffer.from(data);
  fs.writeFileSync(filePath, buffer);
  const url = `/uploads/${key}`;
  return { key, url };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = relKey.replace(/^\/+/, "");

  if (GCS_BUCKET) {
    const url = `https://storage.googleapis.com/${GCS_BUCKET}/${key}`;
    return { key, url };
  }

  return { key, url: `/uploads/${key}` };
}
