/**
 * Financial Router — Rotas tRPC para dados financeiros
 * Serve dados de clientes, DRE, lançamentos, plano de contas,
 * crediário, patrimonial, KPIs e evolução mensal.
 */
import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import {
  getClienteBySlug,
  getAllClientes,
  getKpisByCliente,
  getEvolucaoMensal,
  getDreItems,
  getPlanoContas,
  getMovimentoTop,
  getBancos,
  getLojas,
  getCategorias,
  getCrediarios,
  getPatrimoniais,
  getTopClientes,
} from "./financialDb";

export const financialRouter = router({
  /**
   * Lista todos os clientes disponíveis
   */
  clientes: publicProcedure.query(async () => {
    return getAllClientes();
  }),

  /**
   * Busca um cliente pelo slug
   */
  clienteBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return getClienteBySlug(input.slug);
    }),

  /**
   * Retorna KPIs do cliente
   */
  kpis: publicProcedure
    .input(z.object({ clienteId: z.number() }))
    .query(async ({ input }) => {
      return getKpisByCliente(input.clienteId);
    }),

  /**
   * Retorna evolução mensal
   */
  evolucaoMensal: publicProcedure
    .input(z.object({ clienteId: z.number() }))
    .query(async ({ input }) => {
      return getEvolucaoMensal(input.clienteId);
    }),

  /**
   * Retorna itens DRE
   */
  dre: publicProcedure
    .input(z.object({ clienteId: z.number() }))
    .query(async ({ input }) => {
      return getDreItems(input.clienteId);
    }),

  /**
   * Retorna plano de contas
   */
  planoContas: publicProcedure
    .input(z.object({ clienteId: z.number() }))
    .query(async ({ input }) => {
      return getPlanoContas(input.clienteId);
    }),

  /**
   * Retorna top lançamentos (movimento analítico)
   */
  movimento: publicProcedure
    .input(
      z.object({
        clienteId: z.number(),
        limit: z.number().optional().default(100),
      })
    )
    .query(async ({ input }) => {
      return getMovimentoTop(input.clienteId, input.limit);
    }),

  /**
   * Concentração por banco
   */
  bancos: publicProcedure
    .input(z.object({ clienteId: z.number() }))
    .query(async ({ input }) => {
      return getBancos(input.clienteId);
    }),

  /**
   * Concentração por loja
   */
  lojas: publicProcedure
    .input(z.object({ clienteId: z.number() }))
    .query(async ({ input }) => {
      return getLojas(input.clienteId);
    }),

  /**
   * Concentração por categoria
   */
  categorias: publicProcedure
    .input(z.object({ clienteId: z.number() }))
    .query(async ({ input }) => {
      return getCategorias(input.clienteId);
    }),

  /**
   * Crediário (Indústria de Tijolos)
   */
  crediario: publicProcedure
    .input(z.object({ clienteId: z.number() }))
    .query(async ({ input }) => {
      return getCrediarios(input.clienteId);
    }),

  /**
   * Patrimonial
   */
  patrimonial: publicProcedure
    .input(z.object({ clienteId: z.number() }))
    .query(async ({ input }) => {
      return getPatrimoniais(input.clienteId);
    }),

  /**
   * Top clientes (Indústria de Tijolos)
   */
  topClientes: publicProcedure
    .input(z.object({ clienteId: z.number() }))
    .query(async ({ input }) => {
      return getTopClientes(input.clienteId);
    }),

  /**
   * Dashboard completo — retorna todos os dados de um cliente de uma vez
   */
  dashboardCompleto: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const cliente = await getClienteBySlug(input.slug);
      if (!cliente) return null;

      const [kpisData, evolucao, dre, plano, movimento, bancos, lojas, categorias, crediario, patrimonial, topCli] =
        await Promise.all([
          getKpisByCliente(cliente.id),
          getEvolucaoMensal(cliente.id),
          getDreItems(cliente.id),
          getPlanoContas(cliente.id),
          getMovimentoTop(cliente.id, 100),
          getBancos(cliente.id),
          getLojas(cliente.id),
          getCategorias(cliente.id),
          getCrediarios(cliente.id),
          getPatrimoniais(cliente.id),
          getTopClientes(cliente.id),
        ]);

      return {
        cliente,
        kpis: kpisData,
        evolucao_mensal: evolucao,
        dre,
        plano_contas: plano,
        movimento_top: movimento,
        bancos,
        lojas,
        categorias,
        crediario,
        patrimonial,
        top_clientes: topCli,
      };
    }),
});
