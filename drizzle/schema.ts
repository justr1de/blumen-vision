import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  double,
  json,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

// ═══════════════════════════════════════════════════════════════
// USERS (auth — já existente)
// ═══════════════════════════════════════════════════════════════

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  passwordHash: text("passwordHash"),
  role: mysqlEnum("role", ["user", "admin", "super_admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ═══════════════════════════════════════════════════════════════
// TENANTS (multi-tenancy)
// ═══════════════════════════════════════════════════════════════

export const tenants = mysqlTable("tenants", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  cnpj: varchar("cnpj", { length: 20 }).unique(),
  tipo: varchar("tipo", { length: 50 }).notNull(), // financeira, industria, comercio
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Tenant = typeof tenants.$inferSelect;

// ═══════════════════════════════════════════════════════════════
// CLIENTES (empresas analisadas)
// ═══════════════════════════════════════════════════════════════

export const clientes = mysqlTable("clientes", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  cnpj: varchar("cnpj", { length: 20 }),
  tipo: varchar("tipo", { length: 100 }).notNull(), // financeira, industria_ceramica
  periodo: varchar("periodo", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 50 }).notNull().unique(), // "imediata", "tijolos"
  tenantId: int("tenantId"),
  metadata: json("metadata"), // dados extras como empresa, tipo_negocio
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Cliente = typeof clientes.$inferSelect;

// ═══════════════════════════════════════════════════════════════
// PLANO DE CONTAS
// ═══════════════════════════════════════════════════════════════

export const planoContas = mysqlTable(
  "plano_contas",
  {
    id: int("id").autoincrement().primaryKey(),
    codigo: varchar("codigo", { length: 50 }).notNull(),
    nome: varchar("nome", { length: 500 }).notNull(),
    nivel: int("nivel").notNull(),
    tipo: varchar("tipo", { length: 50 }).notNull(), // totalizadora, lancamento
    codigoPai: varchar("codigoPai", { length: 50 }),
    categoriaGerencial: varchar("categoriaGerencial", { length: 200 }),
    clienteId: int("clienteId").notNull(),
  },
  (table) => [
    uniqueIndex("plano_contas_unique").on(table.clienteId, table.codigo),
    index("plano_contas_cliente_idx").on(table.clienteId),
  ]
);

export type PlanoContasRow = typeof planoContas.$inferSelect;

// ═══════════════════════════════════════════════════════════════
// DRE ITEMS
// ═══════════════════════════════════════════════════════════════

export const dreItems = mysqlTable(
  "dre_items",
  {
    id: int("id").autoincrement().primaryKey(),
    codigo: varchar("codigo", { length: 50 }).notNull(),
    nome: varchar("nome", { length: 500 }).notNull(),
    nivel: int("nivel").notNull(),
    tipo: varchar("tipo", { length: 50 }).notNull(),
    codigoPai: varchar("codigoPai", { length: 50 }),
    valores: json("valores"), // { "mai/2025": 1234.56, ... }
    total: double("total").notNull().default(0),
    clienteId: int("clienteId").notNull(),
  },
  (table) => [
    uniqueIndex("dre_items_unique").on(table.clienteId, table.codigo),
    index("dre_items_cliente_idx").on(table.clienteId),
  ]
);

export type DREItemRow = typeof dreItems.$inferSelect;

// ═══════════════════════════════════════════════════════════════
// LANÇAMENTOS (MOVIMENTO ANALÍTICO)
// ═══════════════════════════════════════════════════════════════

export const lancamentos = mysqlTable(
  "lancamentos",
  {
    id: int("id").autoincrement().primaryKey(),
    data: timestamp("data").notNull(),
    codigo: varchar("codigo", { length: 50 }).notNull(),
    descricao: text("descricao").notNull(),
    valor: double("valor").notNull(),
    tipo: varchar("tipo", { length: 50 }).notNull(), // receita, despesa, transferencia
    banco: varchar("banco", { length: 200 }),
    loja: varchar("loja", { length: 200 }),
    categoria: varchar("categoria", { length: 200 }),
    clienteId: int("clienteId").notNull(),
    contaId: int("contaId"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [
    index("lancamentos_cliente_data_idx").on(table.clienteId, table.data),
    index("lancamentos_cliente_banco_idx").on(table.clienteId, table.banco),
    index("lancamentos_cliente_tipo_idx").on(table.clienteId, table.tipo),
  ]
);

export type LancamentoRow = typeof lancamentos.$inferSelect;

// ═══════════════════════════════════════════════════════════════
// KPIS (indicadores calculados por cliente/período)
// ═══════════════════════════════════════════════════════════════

export const kpis = mysqlTable("kpis", {
  id: int("id").autoincrement().primaryKey(),
  clienteId: int("clienteId").notNull(),
  dados: json("dados").notNull(), // todo o objeto KPI
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ═══════════════════════════════════════════════════════════════
// EVOLUÇÃO MENSAL
// ═══════════════════════════════════════════════════════════════

export const evolucaoMensal = mysqlTable(
  "evolucao_mensal",
  {
    id: int("id").autoincrement().primaryKey(),
    clienteId: int("clienteId").notNull(),
    mes: varchar("mes", { length: 20 }).notNull(),
    mesLabel: varchar("mesLabel", { length: 20 }).notNull(),
    receitas: double("receitas").notNull().default(0),
    despesas: double("despesas").notNull().default(0),
    deducoes: double("deducoes").default(0),
    financeiro: double("financeiro").default(0),
    resultado: double("resultado").default(0),
  },
  (table) => [
    uniqueIndex("evolucao_mensal_unique").on(table.clienteId, table.mes),
  ]
);

// ═══════════════════════════════════════════════════════════════
// BANCOS / LOJAS / CATEGORIAS (concentração)
// ═══════════════════════════════════════════════════════════════

export const concentracaoBancos = mysqlTable("concentracao_bancos", {
  id: int("id").autoincrement().primaryKey(),
  clienteId: int("clienteId").notNull(),
  banco: varchar("banco", { length: 200 }).notNull(),
  receitas: double("receitas").default(0),
  despesas: double("despesas").default(0),
  lancamentos: int("lancamentos").default(0),
});

export const concentracaoLojas = mysqlTable("concentracao_lojas", {
  id: int("id").autoincrement().primaryKey(),
  clienteId: int("clienteId").notNull(),
  loja: varchar("loja", { length: 200 }).notNull(),
  receitas: double("receitas").default(0),
  despesas: double("despesas").default(0),
  lancamentos: int("lancamentos_count").default(0),
});

export const concentracaoCategorias = mysqlTable("concentracao_categorias", {
  id: int("id").autoincrement().primaryKey(),
  clienteId: int("clienteId").notNull(),
  categoria: varchar("categoria", { length: 200 }).notNull(),
  valorTotal: double("valorTotal").default(0),
  lancamentos: int("lancamentos_count").default(0),
});

// ═══════════════════════════════════════════════════════════════
// CREDIÁRIO (Contas a Receber — Indústria de Tijolos)
// ═══════════════════════════════════════════════════════════════

export const crediarios = mysqlTable(
  "crediarios",
  {
    id: int("id").autoincrement().primaryKey(),
    clienteNome: varchar("clienteNome", { length: 200 }).notNull(),
    valorOriginal: double("valorOriginal").notNull(),
    valorPago: double("valorPago").notNull().default(0),
    saldo: double("saldo").notNull().default(0),
    status: varchar("status", { length: 50 }).notNull(), // em_dia, atrasado, quitado
    dataVenda: timestamp("dataVenda").notNull(),
    clienteId: int("clienteId").notNull(),
  },
  (table) => [
    index("crediarios_cliente_status_idx").on(table.clienteId, table.status),
  ]
);

// ═══════════════════════════════════════════════════════════════
// PATRIMONIAL (Aportes, Retornos, Empréstimos)
// ═══════════════════════════════════════════════════════════════

export const patrimoniais = mysqlTable(
  "patrimoniais",
  {
    id: int("id").autoincrement().primaryKey(),
    tipo: varchar("tipo", { length: 50 }).notNull(), // aporte, retorno, emprestimo
    socio: varchar("socio", { length: 200 }).notNull(),
    valor: double("valor").notNull(),
    data: timestamp("data").notNull(),
    descricao: text("descricao"),
    clienteId: int("clienteId").notNull(),
  },
  (table) => [
    index("patrimoniais_cliente_tipo_idx").on(table.clienteId, table.tipo),
  ]
);

// ═══════════════════════════════════════════════════════════════
// TOP CLIENTES (Indústria de Tijolos)
// ═══════════════════════════════════════════════════════════════

export const topClientes = mysqlTable("top_clientes", {
  id: int("id").autoincrement().primaryKey(),
  clienteId: int("clienteId").notNull(),
  clienteNome: varchar("clienteNome", { length: 200 }).notNull(),
  faturamento: double("faturamento").notNull().default(0),
  quantidade: double("quantidade").default(0),
});

// ═══════════════════════════════════════════════════════════════
// UPLOADS DE PLANILHAS
// ═══════════════════════════════════════════════════════════════

export const uploads = mysqlTable("uploads", {
  id: int("id").autoincrement().primaryKey(),
  filename: varchar("filename", { length: 500 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  size: int("size").notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  resultado: json("resultado"),
  userId: int("userId"),
  clienteId: int("clienteId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ═══════════════════════════════════════════════════════════════
// BI REPORTS (Relatórios salvos)
// ═══════════════════════════════════════════════════════════════

export const biReports = mysqlTable("bi_reports", {
  id: int("id").autoincrement().primaryKey(),
  titulo: varchar("titulo", { length: 500 }).notNull(),
  tipo: varchar("tipo", { length: 50 }).notNull(), // dre, movimento, crediario, patrimonial, custom
  filtros: json("filtros"),
  dados: json("dados"),
  clienteId: int("clienteId").notNull(),
  userId: int("userId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
