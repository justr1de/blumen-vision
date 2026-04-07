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
-- NOTA: A tabela recebiveis pode já existir de migrações
-- anteriores. Todas as colunas são garantidas via ALTER TABLE.
--
-- Todos os IDs são INTEGER (serial). Todos os comandos idempotentes.
-- ============================================================

CREATE TABLE IF NOT EXISTS recebiveis (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'aberto',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Garantir que TODAS as colunas existam (a tabela pode já existir)
ALTER TABLE recebiveis ADD COLUMN IF NOT EXISTS tenant_id INTEGER;
ALTER TABLE recebiveis ADD COLUMN IF NOT EXISTS unit_id INTEGER;
ALTER TABLE recebiveis ADD COLUMN IF NOT EXISTS bank_account_id INTEGER;
ALTER TABLE recebiveis ADD COLUMN IF NOT EXISTS category_id INTEGER;
ALTER TABLE recebiveis ADD COLUMN IF NOT EXISTS cpf_cliente VARCHAR(20);
ALTER TABLE recebiveis ADD COLUMN IF NOT EXISTS nome_cliente VARCHAR(500);
ALTER TABLE recebiveis ADD COLUMN IF NOT EXISTS contrato VARCHAR(100);
ALTER TABLE recebiveis ADD COLUMN IF NOT EXISTS descricao TEXT;
ALTER TABLE recebiveis ADD COLUMN IF NOT EXISTS valor_original DECIMAL(15,2) DEFAULT 0;
ALTER TABLE recebiveis ADD COLUMN IF NOT EXISTS valor_pago DECIMAL(15,2) DEFAULT 0;
ALTER TABLE recebiveis ADD COLUMN IF NOT EXISTS valor_pendente DECIMAL(15,2) DEFAULT 0;
ALTER TABLE recebiveis ADD COLUMN IF NOT EXISTS data_emissao DATE;
ALTER TABLE recebiveis ADD COLUMN IF NOT EXISTS data_vencimento DATE;
ALTER TABLE recebiveis ADD COLUMN IF NOT EXISTS data_pagamento DATE;
ALTER TABLE recebiveis ADD COLUMN IF NOT EXISTS parcela_atual INTEGER;
ALTER TABLE recebiveis ADD COLUMN IF NOT EXISTS total_parcelas INTEGER;
ALTER TABLE recebiveis ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'aberto';
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
