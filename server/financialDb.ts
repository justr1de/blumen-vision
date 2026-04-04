/**
 * Financial DB — Query helpers para dados financeiros
 * Usa Drizzle ORM para acessar as tabelas financeiras.
 */
import { eq, desc, asc } from "drizzle-orm";
import { getDb } from "./db";
import {
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

// ═══════════════════════════════════════════════════════════════
// CLIENTES
// ═══════════════════════════════════════════════════════════════

export async function getAllClientes() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clientes).orderBy(asc(clientes.nome));
}

export async function getClienteBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(clientes)
    .where(eq(clientes.slug, slug))
    .limit(1);
  return result[0] ?? null;
}

// ═══════════════════════════════════════════════════════════════
// KPIs
// ═══════════════════════════════════════════════════════════════

export async function getKpisByCliente(clienteId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(kpis)
    .where(eq(kpis.clienteId, clienteId))
    .limit(1);
  return result[0]?.dados ?? null;
}

// ═══════════════════════════════════════════════════════════════
// EVOLUÇÃO MENSAL
// ═══════════════════════════════════════════════════════════════

export async function getEvolucaoMensal(clienteId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(evolucaoMensal)
    .where(eq(evolucaoMensal.clienteId, clienteId))
    .orderBy(asc(evolucaoMensal.mes));
}

// ═══════════════════════════════════════════════════════════════
// DRE ITEMS
// ═══════════════════════════════════════════════════════════════

export async function getDreItems(clienteId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(dreItems)
    .where(eq(dreItems.clienteId, clienteId))
    .orderBy(asc(dreItems.codigo));
}

// ═══════════════════════════════════════════════════════════════
// PLANO DE CONTAS
// ═══════════════════════════════════════════════════════════════

export async function getPlanoContas(clienteId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(planoContas)
    .where(eq(planoContas.clienteId, clienteId))
    .orderBy(asc(planoContas.codigo));
}

// ═══════════════════════════════════════════════════════════════
// MOVIMENTO ANALÍTICO (lançamentos)
// ═══════════════════════════════════════════════════════════════

export async function getMovimentoTop(clienteId: number, limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(lancamentos)
    .where(eq(lancamentos.clienteId, clienteId))
    .orderBy(desc(lancamentos.data))
    .limit(limit);
}

// ═══════════════════════════════════════════════════════════════
// CONCENTRAÇÃO: BANCOS
// ═══════════════════════════════════════════════════════════════

export async function getBancos(clienteId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(concentracaoBancos)
    .where(eq(concentracaoBancos.clienteId, clienteId))
    .orderBy(desc(concentracaoBancos.receitas));
}

// ═══════════════════════════════════════════════════════════════
// CONCENTRAÇÃO: LOJAS
// ═══════════════════════════════════════════════════════════════

export async function getLojas(clienteId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(concentracaoLojas)
    .where(eq(concentracaoLojas.clienteId, clienteId))
    .orderBy(desc(concentracaoLojas.receitas));
}

// ═══════════════════════════════════════════════════════════════
// CONCENTRAÇÃO: CATEGORIAS
// ═══════════════════════════════════════════════════════════════

export async function getCategorias(clienteId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(concentracaoCategorias)
    .where(eq(concentracaoCategorias.clienteId, clienteId))
    .orderBy(desc(concentracaoCategorias.valorTotal));
}

// ═══════════════════════════════════════════════════════════════
// CREDIÁRIO
// ═══════════════════════════════════════════════════════════════

export async function getCrediarios(clienteId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(crediarios)
    .where(eq(crediarios.clienteId, clienteId))
    .orderBy(desc(crediarios.saldo));
}

// ═══════════════════════════════════════════════════════════════
// PATRIMONIAL
// ═══════════════════════════════════════════════════════════════

export async function getPatrimoniais(clienteId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(patrimoniais)
    .where(eq(patrimoniais.clienteId, clienteId))
    .orderBy(desc(patrimoniais.data));
}

// ═══════════════════════════════════════════════════════════════
// TOP CLIENTES (Indústria de Tijolos)
// ═══════════════════════════════════════════════════════════════

export async function getTopClientes(clienteId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(topClientes)
    .where(eq(topClientes.clienteId, clienteId))
    .orderBy(desc(topClientes.faturamento));
}
