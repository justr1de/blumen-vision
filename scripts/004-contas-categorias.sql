-- ============================================================
-- MIGRAÇÃO 004: Contas Bancárias e Categorias
-- Banco: blumenvision (PostgreSQL / Cloud SQL)
--
-- Contas bancárias podem estar vinculadas a uma unidade
-- específica ou ser corporativas (unit_id NULL).
-- Categorias classificam os lançamentos financeiros.
--
-- Todos os IDs são INTEGER (serial). Todos os comandos idempotentes.
-- ============================================================

-- ============================================================
-- 1. BANK_ACCOUNTS (Contas Bancárias)
-- ============================================================

CREATE TABLE IF NOT EXISTS bank_accounts (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  unit_id INTEGER REFERENCES units(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  bank_name VARCHAR(255),
  bank_code VARCHAR(10),
  agency VARCHAR(20),
  account_number VARCHAR(30),
  account_type VARCHAR(50) DEFAULT 'checking',
  initial_balance DECIMAL(15,2) DEFAULT 0,
  current_balance DECIMAL(15,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Colunas que podem estar faltando
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS bank_code VARCHAR(10);
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_bank_accounts_tenant ON bank_accounts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_unit ON bank_accounts(unit_id);

-- ============================================================
-- 2. CATEGORIES (Categorias de Lançamento)
-- ============================================================
-- Tipos: 'receita', 'despesa', 'transferencia'

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'despesa',
  description TEXT,
  code VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Colunas que podem estar faltando
ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id INTEGER;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS code VARCHAR(20);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_categories_tenant ON categories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);

-- ============================================================
-- FIM DA MIGRAÇÃO 004
-- ============================================================
