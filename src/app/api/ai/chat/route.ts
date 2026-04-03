import { NextRequest, NextResponse } from "next/server";
import { getModel, FINANCIAL_SYSTEM_PROMPT } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Mensagens inválidas" }, { status: 400 });
    }

    const model = getModel();

    const contextStr = context
      ? `\n\nContexto atual:\n- Cliente: ${context.cliente}\n- Tipo: ${context.tipo}\n- Período: ${context.periodo}\n- KPIs: Receitas Brutas: R$ ${context.kpis?.receitas_brutas?.toLocaleString("pt-BR")}, Despesas: R$ ${context.kpis?.despesas?.toLocaleString("pt-BR")}, Resultado: R$ ${context.kpis?.resultado_operacional?.toLocaleString("pt-BR")}`
      : "";

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "Contexto do sistema" }],
        },
        {
          role: "model",
          parts: [{ text: FINANCIAL_SYSTEM_PROMPT + contextStr }],
        },
        ...messages.slice(0, -1).map((m: { role: string; content: string }) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }],
        })),
      ],
    });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const response = result.response.text();

    return NextResponse.json({ response });
  } catch (error) {
    console.error("[AI Chat Error]", error);
    return NextResponse.json(
      { error: "Erro ao processar mensagem" },
      { status: 500 }
    );
  }
}
