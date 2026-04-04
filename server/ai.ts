/**
 * AI Router — Integração Gemini via invokeLLM
 * Suporta:
 *  - Chat financeiro inteligente
 *  - Análise de PDFs (upload → S3 → Gemini)
 *  - Análise de planilhas financeiras
 */
import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { invokeLLM, type Message } from "./_core/llm";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

const SYSTEM_PROMPT_FINANCEIRO = `Você é o **Blumen AI**, assistente financeiro especializado do sistema Blumen Vision.

Suas capacidades:
1. **Análise de DRE** — interpretar Demonstrativos de Resultado do Exercício, identificar tendências, margens e anomalias
2. **Conciliação financeira** — comparar lançamentos, identificar divergências entre sistemas
3. **Análise de empréstimos** — calcular juros, amortizações, saldos devedores e identificar cobranças indevidas
4. **Plano de contas** — explicar hierarquias contábeis, classificações e mapeamentos entre planos
5. **Análise de PDFs** — extrair e interpretar dados de documentos financeiros, contratos, extratos

Regras:
- Sempre responda em português brasileiro
- Use formatação Markdown para organizar as respostas
- Valores monetários devem usar o formato R$ X.XXX,XX
- Seja preciso com números — nunca arredonde sem avisar
- Quando analisar documentos, liste as descobertas em ordem de relevância
- Identifique riscos e oportunidades quando aplicável
- Se não tiver certeza sobre algo, diga explicitamente

Contexto do sistema:
- O sistema atende auditoras contábeis que analisam empréstimos e operações financeiras
- Os clientes incluem financeiras (como Grupo Imediata/BMG) e indústrias (como fábricas de tijolos)
- As planilhas seguem padrões de DRE com contas totalizadoras e de lançamento
- Há mapeamento entre planos de contas diferentes (Nasajon → Gerencial)`;

export const aiRouter = router({
  /**
   * Chat financeiro — conversa com contexto
   */
  chat: protectedProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum(["system", "user", "assistant"]),
            content: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const llmMessages: Message[] = [
        { role: "system", content: SYSTEM_PROMPT_FINANCEIRO },
        ...input.messages
          .filter((m) => m.role !== "system")
          .map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
      ];

      const result = await invokeLLM({ messages: llmMessages });
      const content = result.choices?.[0]?.message?.content;

      return {
        response:
          typeof content === "string"
            ? content
            : Array.isArray(content)
              ? content
                  .filter((c) => c.type === "text")
                  .map((c) => (c as { type: "text"; text: string }).text)
                  .join("\n")
              : "Desculpe, não consegui processar a resposta.",
        usage: result.usage,
      };
    }),

  /**
   * Análise de PDF — upload do arquivo, envio ao Gemini com contexto financeiro
   */
  analyzePdf: protectedProcedure
    .input(
      z.object({
        fileBase64: z.string(),
        fileName: z.string(),
        mimeType: z.string().default("application/pdf"),
        prompt: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // 1. Decode base64 and upload to S3
      const buffer = Buffer.from(input.fileBase64, "base64");
      const fileKey = `pdf-analysis/${nanoid()}-${input.fileName}`;
      const { url: fileUrl } = await storagePut(
        fileKey,
        buffer,
        input.mimeType
      );

      // 2. Build messages with file reference
      const userPrompt =
        input.prompt ||
        `Analise este documento financeiro em detalhes. Identifique:
1. Tipo do documento (extrato, contrato, DRE, balancete, etc.)
2. Dados-chave (valores, datas, partes envolvidas)
3. Possíveis inconsistências ou pontos de atenção
4. Resumo executivo das informações mais relevantes`;

      const llmMessages: Message[] = [
        { role: "system", content: SYSTEM_PROMPT_FINANCEIRO },
        {
          role: "user",
          content: [
            {
              type: "file_url",
              file_url: {
                url: fileUrl,
                mime_type: "application/pdf",
              },
            },
            {
              type: "text",
              text: userPrompt,
            },
          ],
        },
      ];

      const result = await invokeLLM({ messages: llmMessages });
      const content = result.choices?.[0]?.message?.content;

      return {
        response:
          typeof content === "string"
            ? content
            : Array.isArray(content)
              ? content
                  .filter((c) => c.type === "text")
                  .map((c) => (c as { type: "text"; text: string }).text)
                  .join("\n")
              : "Não foi possível analisar o documento.",
        fileUrl,
        usage: result.usage,
      };
    }),

  /**
   * Análise estruturada — retorna JSON com dados extraídos
   */
  analyzeStructured: protectedProcedure
    .input(
      z.object({
        fileBase64: z.string(),
        fileName: z.string(),
        mimeType: z.string().default("application/pdf"),
        extractionType: z.enum([
          "dre",
          "extrato",
          "contrato",
          "balancete",
          "generico",
        ]),
      })
    )
    .mutation(async ({ input }) => {
      const buffer = Buffer.from(input.fileBase64, "base64");
      const fileKey = `structured-analysis/${nanoid()}-${input.fileName}`;
      const { url: fileUrl } = await storagePut(
        fileKey,
        buffer,
        input.mimeType
      );

      const extractionPrompts: Record<string, string> = {
        dre: `Extraia todos os dados deste DRE (Demonstrativo de Resultado do Exercício) em formato JSON estruturado com:
- periodo (string)
- contas (array com: codigo, nome, nivel, tipo (totalizadora/lancamento), valores_mensais (objeto mês→valor), total)
- resumo (receita_bruta, deducoes, receita_liquida, custos, lucro_bruto, despesas_operacionais, resultado_operacional, resultado_liquido)`,

        extrato: `Extraia todos os lançamentos deste extrato bancário em formato JSON com:
- banco (string), agencia (string), conta (string), periodo (string)
- lancamentos (array com: data, descricao, valor, tipo (credito/debito), saldo)
- resumo (saldo_inicial, total_creditos, total_debitos, saldo_final)`,

        contrato: `Extraia as informações-chave deste contrato em formato JSON com:
- partes (array com: nome, cpf_cnpj, papel)
- objeto (string), valor (number), prazo (string)
- condicoes (array de strings)
- clausulas_relevantes (array com: numero, resumo)`,

        balancete: `Extraia os dados deste balancete em formato JSON com:
- periodo (string), empresa (string)
- contas (array com: codigo, nome, saldo_anterior, debitos, creditos, saldo_atual)
- totais (total_debitos, total_creditos, saldo_total)`,

        generico: `Extraia todas as informações relevantes deste documento financeiro em formato JSON estruturado, identificando automaticamente o tipo de documento e organizando os dados de forma hierárquica.`,
      };

      const llmMessages: Message[] = [
        {
          role: "system",
          content: `${SYSTEM_PROMPT_FINANCEIRO}\n\nIMPORTANTE: Responda EXCLUSIVAMENTE com JSON válido, sem markdown, sem blocos de código, apenas o JSON puro.`,
        },
        {
          role: "user",
          content: [
            {
              type: "file_url",
              file_url: {
                url: fileUrl,
                mime_type: "application/pdf",
              },
            },
            {
              type: "text",
              text: extractionPrompts[input.extractionType],
            },
          ],
        },
      ];

      const result = await invokeLLM({
        messages: llmMessages,
        response_format: { type: "json_object" },
      });

      const content = result.choices?.[0]?.message?.content;
      let parsedData: unknown = null;

      try {
        const textContent =
          typeof content === "string"
            ? content
            : Array.isArray(content)
              ? content
                  .filter((c) => c.type === "text")
                  .map((c) => (c as { type: "text"; text: string }).text)
                  .join("")
              : "";
        parsedData = JSON.parse(textContent);
      } catch {
        parsedData = { raw: content, error: "Não foi possível parsear o JSON" };
      }

      return {
        data: parsedData,
        fileUrl,
        usage: result.usage,
      };
    }),

  /**
   * Health check — verifica se a integração com o LLM está funcionando
   */
  health: protectedProcedure.query(async () => {
    try {
      const result = await invokeLLM({
        messages: [
          { role: "user", content: "Responda apenas: OK" },
        ],
      });
      const content = result.choices?.[0]?.message?.content;
      return {
        status: "ok" as const,
        model: result.model,
        response: typeof content === "string" ? content : "OK",
      };
    } catch (error) {
      return {
        status: "error" as const,
        model: "unknown",
        response:
          error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }),
});
