export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getModel } from "@/lib/gemini";

// Tamanho máximo: 16MB
const MAX_SIZE = 16 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Arquivo excede o limite de 16MB" },
        { status: 413 }
      );
    }

    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato não suportado. Use .xlsx, .xls, .csv ou .pdf" },
        { status: 400 }
      );
    }

    // Para Cloud Storage (quando configurado):
    // const storage = new Storage();
    // const bucket = storage.bucket(process.env.GCS_BUCKET_NAME!);
    // const blob = bucket.file(`uploads/${Date.now()}-${file.name}`);
    // await blob.save(Buffer.from(await file.arrayBuffer()));

    // Análise com Gemini
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");

    try {
      const model = getModel();
      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: file.type,
            data: base64,
          },
        },
        {
          text: `Analise esta planilha financeira e retorne um resumo em JSON:
{
  "tipo": "tipo do documento",
  "empresa": "nome da empresa se identificável",
  "total_linhas": número estimado de linhas,
  "colunas_principais": ["lista de colunas"],
  "resumo": "breve descrição do conteúdo"
}`,
        },
      ]);

      const responseText = result.response.text();
      let analysis;
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      } catch {
        analysis = null;
      }

      return NextResponse.json({
        message: `Arquivo "${file.name}" recebido e analisado com sucesso`,
        filename: file.name,
        size: file.size,
        type: file.type,
        analysis,
      });
    } catch {
      // Se Gemini não estiver configurado, retorna sem análise
      return NextResponse.json({
        message: `Arquivo "${file.name}" recebido com sucesso`,
        filename: file.name,
        size: file.size,
        type: file.type,
        analysis: null,
      });
    }
  } catch (error) {
    console.error("[Upload Error]", error);
    return NextResponse.json(
      { error: "Erro ao processar upload" },
      { status: 500 }
    );
  }
}
