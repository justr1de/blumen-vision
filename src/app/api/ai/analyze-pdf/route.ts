export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getModel } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const mimeType = file.type || "application/pdf";

    const model = getModel();

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64,
        },
      },
      {
        text: `Analise este documento financeiro e retorne um JSON estruturado com:
{
  "tipo_documento": "dre" | "extrato" | "balancete" | "movimento" | "plano_contas" | "outro",
  "empresa": "nome da empresa",
  "periodo": "período coberto",
  "resumo": "resumo executivo em 2-3 frases",
  "dados_extraidos": { ... dados relevantes ... },
  "alertas": ["lista de inconsistências ou pontos de atenção"],
  "total_registros": número
}
Responda APENAS com JSON válido.`,
      },
    ]);

    const responseText = result.response.text();

    let parsed;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: responseText };
    } catch {
      parsed = { raw: responseText, error: "Não foi possível parsear como JSON" };
    }

    return NextResponse.json({ resultado: parsed, filename: file.name });
  } catch (error) {
    console.error("[Analyze PDF Error]", error);
    return NextResponse.json(
      { error: "Erro ao analisar documento" },
      { status: 500 }
    );
  }
}
