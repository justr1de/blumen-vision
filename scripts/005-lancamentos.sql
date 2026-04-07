-- ============================================================
-- MIGRAÇÃO 005: Lançamentos Financeiros (Transactions)
-- Banco: blumenvision (PostgreSQL / Cloud SQL)
--
-- Lançamentos são o coração do sistema financeiro.
-- Cada lançamento pertence a um tenant e pode estar vinculado
-- a uma unidade, segmento, grupo, conta bancária e categoria.
--
-- Tipos: 'receita', 'despesa', 'transferencia'
-- Status: 'pendente', 'pago', 'vencido', 'cancelado'
--
-- Todos os IDs são INTEGER (serial). Todos os comandos idempotentes.
-- ============================================================

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  unit_id INTEGER REFERENCES units(id) ON DELETE SET NULL,
  segment_id INTEGER REFERENCES segments(id) ON DELETE SET NULL,
  group_id INTEGER REFERENCES groups(id) ON DELETE SET NULL,
  bank_account_id INTEGER REFERENCES bank_accounts(id) ON DELETE SET NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'despesa',
  description TEXT,
  amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  transaction_date DATE,
  due_date DATE,
  payment_date DATE,
  status VARCHAR(50) DEFAULT 'pendente',
  reference VARCHAR(255),
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Colunas que podem estar faltando
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS payment_date DATE;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS reference VARCHAR(255);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS metadata JSONB;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Índices para performance em consultas frequentes
CREATE INDEX IF NOT EXISTS idx_transactions_tenant ON transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_unit ON transactions(unit_id);
CREATE INDEX IF NOT EXISTS idx_transactions_segment ON transactions(segment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_group ON transactions(group_id);
CREATE INDEX IF NOT EXISTS idx_transactions_bank ON transactions(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_due ON transactions(due_date);

-- Índice composto para consultas de dashboard (tenant + tipo + data)
CREATE INDEX IF NOT EXISTS idx_transactions_tenant_type_date
  ON transactions(tenant_id, type, transaction_date);

-- ============================================================
-- FIM DA MIGRAÇÃO 005
-- ============================================================
