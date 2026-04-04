/**
 * Upload Router — Upload e processamento de planilhas financeiras
 * Suporta upload de arquivos Excel/CSV, processamento via LLM,
 * e seed de dados no banco.
 */
import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import { getDb } from "./db";
import {
  uploads,
  clientes,
  kpis,
  evolucaoMensal,
  dreItems,
  planoContas,
  lancamentos,
  concentracaoBancos,
  concentracaoLojas,
  concentracaoCategorias,
  crediarios,
  patrimoniais,
  topClientes,
} from "../drizzle/schema";
import { eq } from "drizzle-orm";

export const uploadRouter = router({
  /**
   * Upload de planilha — salva no S3 e registra no banco
   */
  uploadFile: protectedProcedure
    .input(
      z.object({
        fileBase64: z.string(),
        fileName: z.string(),
        mimeType: z.string(),
        size: z.number(),
        clienteId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const buffer = Buffer.from(input.fileBase64, "base64");
      const fileKey = `uploads/${nanoid()}-${input.fileName}`;
      const { url: fileUrl } = await storagePut(fileKey, buffer, input.mimeType);

      const db = await getDb();
      if (!db) throw new Error("Banco de dados indisponível");

      const [record] = await db.insert(uploads).values({
        filename: input.fileName,
        fileUrl,
        fileKey,
        mimeType: input.mimeType,
        size: input.size,
        status: "pending",
        userId: ctx.user?.id ?? null,
        clienteId: input.clienteId ?? null,
      });

      return {
        id: record.insertId,
        fileUrl,
        status: "pending",
      };
    }),

  /**
   * Processa planilha — envia ao LLM para extração estruturada
   */
  processFile: protectedProcedure
    .input(
      z.object({
        uploadId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco de dados indisponível");

      const [upload] = await db
        .select()
        .from(uploads)
        .where(eq(uploads.id, input.uploadId))
        .limit(1);

      if (!upload) throw new Error("Upload não encontrado");

      // Atualiza status para processing
      await db
        .update(uploads)
        .set({ status: "processing" })
        .where(eq(uploads.id, input.uploadId));

      try {
        // Envia ao LLM para análise
        const result = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `Você é um especialista em análise de planilhas financeiras. Analise o arquivo e retorne um JSON estruturado com:
- tipo_documento: "dre" | "extrato" | "balancete" | "movimento" | "plano_contas"
- empresa: nome da empresa
- periodo: período coberto
- resumo: resumo executivo
- dados_extraidos: dados relevantes extraídos
- alertas: lista de inconsistências ou pontos de atenção encontrados
Responda APENAS com JSON válido.`,
            },
            {
              role: "user",
              content: [
                {
                  type: "file_url",
                  file_url: {
                    url: upload.fileUrl,
                    mime_type: upload.mimeType as any,
                  },
                },
                {
                  type: "text",
                  text: `Analise esta planilha financeira: ${upload.filename}`,
                },
              ],
            },
          ],
          response_format: { type: "json_object" },
        });

        const content = result.choices?.[0]?.message?.content;
        let parsedResult: unknown = null;

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
          parsedResult = JSON.parse(textContent);
        } catch {
          parsedResult = { raw: content, error: "Falha ao parsear JSON" };
        }

        // Atualiza com resultado
        await db
          .update(uploads)
          .set({
            status: "done",
            resultado: parsedResult,
          })
          .where(eq(uploads.id, input.uploadId));

        return {
          status: "done",
          resultado: parsedResult,
        };
      } catch (error) {
        await db
          .update(uploads)
          .set({
            status: "error",
            resultado: {
              error: error instanceof Error ? error.message : "Erro desconhecido",
            },
          })
          .where(eq(uploads.id, input.uploadId));

        throw error;
      }
    }),

  /**
   * Lista uploads do usuário
   */
  listUploads: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(uploads)
      .where(eq(uploads.userId, ctx.user?.id ?? 0))
      .orderBy(uploads.createdAt);
  }),

  /**
   * Seed de dados JSON para um cliente — popula todas as tabelas
   */
  seedClientData: protectedProcedure
    .input(
      z.object({
        slug: z.string(),
        data: z.any(), // JSON completo do cliente
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco de dados indisponível");

      const { slug, data } = input;

      // Busca ou cria o cliente
      let [cliente] = await db
        .select()
        .from(clientes)
        .where(eq(clientes.slug, slug))
        .limit(1);

      if (!cliente) {
        const [result] = await db.insert(clientes).values({
          nome: data.empresa || (slug === "imediata" ? "Grupo Imediata" : "Indústria de Tijolos"),
          tipo: data.tipo_negocio || (slug === "imediata" ? "financeira" : "industria_ceramica"),
          periodo: data.periodo || "Mai-Out/2025",
          slug,
          metadata: { empresa: data.empresa, tipo_negocio: data.tipo_negocio },
        });
        [cliente] = await db
          .select()
          .from(clientes)
          .where(eq(clientes.id, Number(result.insertId)))
          .limit(1);
      }

      const cId = cliente.id;
      let counts = { kpis: 0, evolucao: 0, dre: 0, plano: 0, movimento: 0, bancos: 0, lojas: 0, categorias: 0, crediario: 0, patrimonial: 0, topClientes: 0 };

      // KPIs
      if (data.kpis) {
        await db.delete(kpis).where(eq(kpis.clienteId, cId));
        await db.insert(kpis).values({ clienteId: cId, dados: data.kpis });
        counts.kpis = 1;
      }

      // Evolução Mensal
      if (data.evolucao_mensal?.length) {
        await db.delete(evolucaoMensal).where(eq(evolucaoMensal.clienteId, cId));
        for (const m of data.evolucao_mensal) {
          await db.insert(evolucaoMensal).values({
            clienteId: cId,
            mes: m.mes,
            mesLabel: m.mes_label,
            receitas: m.receitas ?? 0,
            despesas: m.despesas ?? 0,
            deducoes: m.deducoes ?? 0,
            financeiro: m.financeiro ?? 0,
            resultado: m.resultado ?? 0,
          });
        }
        counts.evolucao = data.evolucao_mensal.length;
      }

      // DRE
      if (data.dre?.length) {
        await db.delete(dreItems).where(eq(dreItems.clienteId, cId));
        for (const d of data.dre) {
          await db.insert(dreItems).values({
            clienteId: cId,
            codigo: d.codigo || d.code || String(d.id || ""),
            nome: d.nome || d.name || "",
            nivel: d.nivel ?? d.level ?? 1,
            tipo: d.tipo || d.type || "lancamento",
            codigoPai: d.codigoPai || d.parentCode || null,
            valores: d.valores || d.values || {},
            total: d.total ?? 0,
          });
        }
        counts.dre = data.dre.length;
      }

      // Plano de Contas
      if (data.plano_contas?.length) {
        await db.delete(planoContas).where(eq(planoContas.clienteId, cId));
        for (const p of data.plano_contas) {
          await db.insert(planoContas).values({
            clienteId: cId,
            codigo: p.codigo || p.code || "",
            nome: p.nome || p.name || "",
            nivel: p.nivel ?? p.level ?? 1,
            tipo: p.tipo || p.type || "lancamento",
            codigoPai: p.codigoPai || p.parentCode || null,
            categoriaGerencial: p.categoriaGerencial || p.category || null,
          });
        }
        counts.plano = data.plano_contas.length;
      }

      // Movimento (lançamentos)
      if (data.movimento_top?.length) {
        await db.delete(lancamentos).where(eq(lancamentos.clienteId, cId));
        for (const l of data.movimento_top) {
          await db.insert(lancamentos).values({
            clienteId: cId,
            data: new Date(l.data || l.date || Date.now()),
            codigo: l.codigo || l.code || "",
            descricao: l.descricao || l.description || "",
            valor: l.valor ?? l.value ?? 0,
            tipo: l.tipo || l.type || "lancamento",
            banco: l.banco || l.bank || null,
            loja: l.loja || l.store || null,
            categoria: l.categoria || l.category || null,
          });
        }
        counts.movimento = data.movimento_top.length;
      }

      // Bancos
      if (data.bancos?.length) {
        await db.delete(concentracaoBancos).where(eq(concentracaoBancos.clienteId, cId));
        for (const b of data.bancos) {
          await db.insert(concentracaoBancos).values({
            clienteId: cId,
            banco: b.banco || b.name || "",
            receitas: b.receitas ?? 0,
            despesas: b.despesas ?? 0,
            lancamentos: b.lancamentos ?? 0,
          });
        }
        counts.bancos = data.bancos.length;
      }

      // Lojas
      if (data.lojas?.length) {
        await db.delete(concentracaoLojas).where(eq(concentracaoLojas.clienteId, cId));
        for (const l of data.lojas) {
          await db.insert(concentracaoLojas).values({
            clienteId: cId,
            loja: l.loja || l.name || "",
            receitas: l.receitas ?? 0,
            despesas: l.despesas ?? 0,
            lancamentos: l.lancamentos ?? 0,
          });
        }
        counts.lojas = data.lojas.length;
      }

      // Categorias
      if (data.categorias?.length) {
        await db.delete(concentracaoCategorias).where(eq(concentracaoCategorias.clienteId, cId));
        for (const c of data.categorias) {
          await db.insert(concentracaoCategorias).values({
            clienteId: cId,
            categoria: c.categoria || c.name || "",
            valorTotal: c.valor_total ?? c.valorTotal ?? 0,
            lancamentos: c.lancamentos ?? 0,
          });
        }
        counts.categorias = data.categorias.length;
      }

      // Crediário
      if (data.crediario?.length) {
        await db.delete(crediarios).where(eq(crediarios.clienteId, cId));
        for (const c of data.crediario) {
          await db.insert(crediarios).values({
            clienteId: cId,
            clienteNome: c.cliente || c.clienteNome || "",
            valorOriginal: c.valor_original ?? c.valorOriginal ?? 0,
            valorPago: c.valor_pago ?? c.valorPago ?? 0,
            saldo: c.saldo ?? 0,
            status: c.status || "em_dia",
            dataVenda: new Date(c.data_venda || c.dataVenda || Date.now()),
          });
        }
        counts.crediario = data.crediario.length;
      }

      // Patrimonial
      if (data.patrimonial?.length) {
        await db.delete(patrimoniais).where(eq(patrimoniais.clienteId, cId));
        for (const p of data.patrimonial) {
          await db.insert(patrimoniais).values({
            clienteId: cId,
            tipo: p.tipo || p.type || "aporte",
            socio: p.socio || p.partner || "",
            valor: p.valor ?? p.value ?? 0,
            data: new Date(p.data || p.date || Date.now()),
            descricao: p.descricao || p.description || null,
          });
        }
        counts.patrimonial = data.patrimonial.length;
      }

      // Top Clientes
      if (data.top_clientes?.length) {
        await db.delete(topClientes).where(eq(topClientes.clienteId, cId));
        for (const t of data.top_clientes) {
          await db.insert(topClientes).values({
            clienteId: cId,
            clienteNome: t.cliente || t.clienteNome || "",
            faturamento: t.faturamento ?? 0,
            quantidade: t.quantidade ?? t.qtd ?? 0,
          });
        }
        counts.topClientes = data.top_clientes.length;
      }

      // Despesas detalhamento como categorias (Tijolos)
      if (data.despesas_detalhamento?.length && !data.categorias?.length) {
        await db.delete(concentracaoCategorias).where(eq(concentracaoCategorias.clienteId, cId));
        for (const d of data.despesas_detalhamento) {
          await db.insert(concentracaoCategorias).values({
            clienteId: cId,
            categoria: d.detalhamento || d.categoria || "",
            valorTotal: Math.abs(d.valor ?? d.valorTotal ?? 0),
            lancamentos: 0,
          });
        }
        counts.categorias = data.despesas_detalhamento.length;
      }

      return {
        clienteId: cId,
        clienteNome: cliente.nome,
        counts,
      };
    }),
});
