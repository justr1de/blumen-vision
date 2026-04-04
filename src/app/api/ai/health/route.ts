export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";

export async function GET() {
  const hasGemini = !!process.env.GEMINI_API_KEY;
  const hasDb = !!process.env.DATABASE_URL;

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      gemini: hasGemini ? "configured" : "missing",
      database: hasDb ? "configured" : "missing",
    },
  });
}
