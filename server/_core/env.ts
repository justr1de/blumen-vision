export const ENV = {
  appId: process.env.GCP_PROJECT_ID ?? "blumenvision",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  appUrl: process.env.APP_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",
};
