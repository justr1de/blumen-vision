export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getModel } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { data, prompt, tipo } = await req.json();

    if (!data) {
      return NextResponse.json({ error: "Dados não fornecidos" }, { status: 400 });
    }

    const model = getModel();

    const systemPrompt = `Você é um auditor contábil especializado. Analise os dados financeiros fornecidos e identifique:
1. Inconsistências nos lançamentos (duplicidades, inversões de sinal, contas erradas)
2. Diferenças entre valores devidos e pagos
3. Padrões de erro recorrentes
4. Recomendações de correção

Tipo de análise: ${tipo || "geral"}
${prompt ? `Instrução adicional: ${prompt}` : ""}

Responda em JSON com a estrutura:
{
  "analise": "resumo da análise",
  "inconsistencias": [{ "tipo": "...", "descricao": "...", "valor": 0, "correcao_sugerida": "..." }],
  "total_erros": 0,
  "valor_total_divergencia": 0,
  "recomendacoes": ["..."]
}`;

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: `Dados para análise:\n${JSON.stringify(data, null, 2)}` },
    ]);

    const responseText = result.response.text();

    let parsed;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: responseText };
    } catch {
      parsed = { raw: responseText, error: "Não foi possível parsear como JSON" };
    }

    return NextResponse.json({ resultado: parsed });
  } catch (error) {
    console.error("[Analyze Structured Error]", error);
    return NextResponse.json(
      { error: "Erro ao analisar dados" },
      { status: 500 }
    );
  }
}
