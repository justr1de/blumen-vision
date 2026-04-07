-- ============================================================
-- MIGRAÇÃO 006: Report Data + Conciliações
-- Banco: blumenvision (PostgreSQL / Cloud SQL)
--
-- report_data: dados extraídos das planilhas/PDFs enviados
--   via upload. Cada linha corresponde a um registro do
--   documento original, com campos normalizados.
--
-- conciliacoes: resultado da conciliação entre lançamentos
--   do sistema e dados dos relatórios bancários/financeiros.
--
-- NOTA: A tabela report_data pode já existir de migrações
-- anteriores. Todas as colunas são adicionadas via ALTER TABLE
-- para garantir compatibilidade.
--
-- Todos os IDs são INTEGER (serial). Todos os comandos idempotentes.
-- ============================================================

-- ============================================================
-- 1. REPORT_DATA (dados processados dos uploads)
-- ============================================================

CREATE TABLE IF NOT EXISTS report_data (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  row_number INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Garantir que TODAS as colunas existam (a tabela pode já existir com schema antigo)
ALTER TABLE report_data ADD COLUMN IF NOT EXISTS tenant_id INTEGER;
ALTER TABLE report_data ADD COLUMN IF NOT EXISTS upload_id INTEGER;
ALTER TABLE report_data ADD COLUMN IF NOT EXISTS row_number INTEGER DEFAULT 0;
ALTER TABLE report_data ADD COLUMN IF NOT EXISTS cpf VARCHAR(20);
ALTER TABLE report_data ADD COLUMN IF NOT EXISTS nome_cliente VARCHAR(500);
ALTER TABLE report_data ADD COLUMN IF NOT EXISTS contrato VARCHAR(100);
ALTER TABLE report_data ADD COLUMN IF NOT EXISTS produto VARCHAR(255);
ALTER TABLE report_data ADD COLUMN IF NOT EXISTS status_operacao VARCHAR(100);
ALTER TABLE report_data ADD COLUMN IF NOT EXISTS valor_principal DECIMAL(15,2);
ALTER TABLE report_data ADD COLUMN IF NOT EXISTS valor_parcela DECIMAL(15,2);
ALTER TABLE report_data ADD COLUMN IF NOT EXISTS data_operacao DATE;
ALTER TABLE report_data ADD COLUMN IF NOT EXISTS data_pagamento DATE;
ALTER TABLE report_data ADD COLUMN IF NOT EXISTS tipo_transacao VARCHAR(100);
ALTER TABLE report_data ADD COLUMN IF NOT EXISTS banco VARCHAR(255);
ALTER TABLE report_data ADD COLUMN IF NOT EXISTS agencia VARCHAR(20);
ALTER TABLE report_data ADD COLUMN IF NOT EXISTS conta VARCHAR(30);
ALTER TABLE report_data ADD COLUMN IF NOT EXISTS parcela_atual INTEGER;
ALTER TABLE report_data ADD COLUMN IF NOT EXISTS total_parcelas INTEGER;
ALTER TABLE report_data ADD COLUMN IF NOT EXISTS taxa_juros DECIMAL(8,4);
ALTER TABLE report_data ADD COLUMN IF NOT EXISTS valor_iof DECIMAL(15,2);
ALTER TABLE report_data ADD COLUMN IF NOT EXISTS valor_seguro DECIMAL(15,2);
ALTER TABLE report_data ADD COLUMN IF NOT EXISTS valor_liquido DECIMAL(15,2);
ALTER TABLE report_data ADD COLUMN IF NOT EXISTS raw_data JSONB;
ALTER TABLE report_data ADD COLUMN IF NOT EXISTS processed_data JSONB;
ALTER TABLE report_data ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Índices para consultas frequentes (só cria se não existir)
CREATE INDEX IF NOT EXISTS idx_report_data_tenant ON report_data(tenant_id);
CREATE INDEX IF NOT EXISTS idx_report_data_upload ON report_data(upload_id);
CREATE INDEX IF NOT EXISTS idx_report_data_cpf ON report_data(cpf);
CREATE INDEX IF NOT EXISTS idx_report_data_contrato ON report_data(contrato);
CREATE INDEX IF NOT EXISTS idx_report_data_produto ON report_data(produto);
CREATE INDEX IF NOT EXISTS idx_report_data_status ON report_data(status_operacao);
CREATE INDEX IF NOT EXISTS idx_report_data_data_op ON report_data(data_operacao);

-- Índice composto para consultas de auditoria (tenant + CPF + contrato)
CREATE INDEX IF NOT EXISTS idx_report_data_audit
  ON report_data(tenant_id, cpf, contrato);

-- ============================================================
-- 2. CONCILIACOES (resultados de conciliação)
-- ============================================================

CREATE TABLE IF NOT EXISTS conciliacoes (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pendente',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Garantir que TODAS as colunas existam
ALTER TABLE conciliacoes ADD COLUMN IF NOT EXISTS tenant_id INTEGER;
ALTER TABLE conciliacoes ADD COLUMN IF NOT EXISTS upload_id INTEGER;
ALTER TABLE conciliacoes ADD COLUMN IF NOT EXISTS report_data_id INTEGER;
ALTER TABLE conciliacoes ADD COLUMN IF NOT EXISTS transaction_id INTEGER;
ALTER TABLE conciliacoes ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pendente';
ALTER TABLE conciliacoes ADD COLUMN IF NOT EXISTS tipo_divergencia VARCHAR(100);
ALTER TABLE conciliacoes ADD COLUMN IF NOT EXISTS valor_sistema DECIMAL(15,2);
ALTER TABLE conciliacoes ADD COLUMN IF NOT EXISTS valor_relatorio DECIMAL(15,2);
ALTER TABLE conciliacoes ADD COLUMN IF NOT EXISTS diferenca DECIMAL(15,2);
ALTER TABLE conciliacoes ADD COLUMN IF NOT EXISTS observacao TEXT;
ALTER TABLE conciliacoes ADD COLUMN IF NOT EXISTS resolvido_por INTEGER;
ALTER TABLE conciliacoes ADD COLUMN IF NOT EXISTS resolvido_em TIMESTAMPTZ;
ALTER TABLE conciliacoes ADD COLUMN IF NOT EXISTS metadata JSONB;
ALTER TABLE conciliacoes ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE conciliacoes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Índices
CREATE INDEX IF NOT EXISTS idx_conciliacoes_tenant ON conciliacoes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_conciliacoes_upload ON conciliacoes(upload_id);
CREATE INDEX IF NOT EXISTS idx_conciliacoes_status ON conciliacoes(status);
CREATE INDEX IF NOT EXISTS idx_conciliacoes_report ON conciliacoes(report_data_id);
CREATE INDEX IF NOT EXISTS idx_conciliacoes_transaction ON conciliacoes(transaction_id);

-- ============================================================
-- FIM DA MIGRAÇÃO 006
-- ============================================================
