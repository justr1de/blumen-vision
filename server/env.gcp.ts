// ============================================================
// Blúmen Vision — Variáveis de Ambiente para GCP
// Substitui o _core/env.ts do Manus
// ============================================================
// Para usar este arquivo em produção GCP:
//   1. Backup: cp server/_core/env.ts server/_core/env.manus.ts
//   2. Copiar: cp server/env.gcp.ts server/_core/env.ts
// ============================================================

export const ENV = {
  // ── Autenticação ──────────────────────────────────────────
  // JWT secret para assinar session cookies (gerenciado pelo Secret Manager)
  cookieSecret: process.env.JWT_SECRET ?? "",

  // ── Banco de Dados ────────────────────────────────────────
  // Cloud SQL PostgreSQL connection string
  databaseUrl: process.env.DATABASE_URL ?? "",

  // ── Google Cloud ──────────────────────────────────────────
  gcpProjectId: process.env.GCP_PROJECT_ID ?? "blumenvision",
  gcsBucket: process.env.GCS_BUCKET ?? "blumenvision-storage",
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",

  // ── Aplicação ─────────────────────────────────────────────
  isProduction: process.env.NODE_ENV === "production",
  port: parseInt(process.env.PORT || "8080", 10),

  // ── Super Admins (emails autorizados) ─────────────────────
  superAdminEmails: [
    "contato@dataro-it.com.br",
    "anderson@blumenbiz.com",
    "camila@blumenbiz.com",
  ],

  // ── Compatibilidade (manter para transição gradual) ───────
  // Estes campos existem no env.ts original do Manus
  // Podem ser removidos após migração completa
  appId: process.env.VITE_APP_ID ?? process.env.GCP_PROJECT_ID ?? "blumenvision",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
