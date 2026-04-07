-- ============================================================
-- MIGRAÇÃO 007: Recebíveis
-- Banco: blumenvision (PostgreSQL / Cloud SQL)
--
-- Recebíveis representam valores a receber de clientes,
-- como parcelas de crediário, boletos, duplicatas, etc.
-- Podem estar vinculados a uma unidade e conta bancária.
--
-- Status: 'aberto', 'pago', 'vencido', 'renegociado', 'cancelado'
--
-- Todos os IDs são INTEGER (serial). Todos os comandos idempotentes.
-- ============================================================

CREATE TABLE IF NOT EXISTS recebiveis (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  unit_id INTEGER REFERENCES units(id) ON DELETE SET NULL,
  bank_account_id INTEGER REFERENCES bank_accounts(id) ON DELETE SET NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  cpf_cliente VARCHAR(20),
  nome_cliente VARCHAR(500),
  contrato VARCHAR(100),
  descricao TEXT,
  valor_original DECIMAL(15,2) NOT NULL DEFAULT 0,
  valor_pago DECIMAL(15,2) DEFAULT 0,
  valor_pendente DECIMAL(15,2) DEFAULT 0,
  data_emissao DATE,
  data_vencimento DATE,
  data_pagamento DATE,
  parcela_atual INTEGER,
  total_parcelas INTEGER,
  status VARCHAR(50) DEFAULT 'aberto',
  tipo VARCHAR(50) DEFAULT 'boleto',
  observacao TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Colunas que podem estar faltando
ALTER TABLE recebiveis ADD COLUMN IF NOT EXISTS cpf_cliente VARCHAR(20);
ALTER TABLE recebiveis ADD COLUMN IF NOT EXISTS nome_cliente VARCHAR(500);
ALTER TABLE recebiveis ADD COLUMN IF NOT EXISTS contrato VARCHAR(100);
ALTER TABLE recebiveis ADD COLUMN IF NOT EXISTS valor_pendente DECIMAL(15,2) DEFAULT 0;
ALTER TABLE recebiveis ADD COLUMN IF NOT EXISTS parcela_atual INTEGER;
ALTER TABLE recebiveis ADD COLUMN IF NOT EXISTS total_parcelas INTEGER;
ALTER TABLE recebiveis ADD COLUMN IF NOT EXISTS tipo VARCHAR(50) DEFAULT 'boleto';
ALTER TABLE recebiveis ADD COLUMN IF NOT EXISTS observacao TEXT;
ALTER TABLE recebiveis ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Índices
CREATE INDEX IF NOT EXISTS idx_recebiveis_tenant ON recebiveis(tenant_id);
CREATE INDEX IF NOT EXISTS idx_recebiveis_unit ON recebiveis(unit_id);
CREATE INDEX IF NOT EXISTS idx_recebiveis_cpf ON recebiveis(cpf_cliente);
CREATE INDEX IF NOT EXISTS idx_recebiveis_contrato ON recebiveis(contrato);
CREATE INDEX IF NOT EXISTS idx_recebiveis_status ON recebiveis(status);
CREATE INDEX IF NOT EXISTS idx_recebiveis_vencimento ON recebiveis(data_vencimento);

-- Índice composto para consultas de cobrança
CREATE INDEX IF NOT EXISTS idx_recebiveis_cobranca
  ON recebiveis(tenant_id, status, data_vencimento);

-- ============================================================
-- FIM DA MIGRAÇÃO 007
-- ============================================================
