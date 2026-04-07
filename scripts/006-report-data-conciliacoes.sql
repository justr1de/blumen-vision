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
-- Todos os IDs são INTEGER (serial). Todos os comandos idempotentes.
-- ============================================================

-- ============================================================
-- 1. REPORT_DATA (dados processados dos uploads)
-- ============================================================
-- Campos usados pela API de upload (app/api/upload/route.ts):
--   tenant_id, upload_id, row_number, cpf, nome_cliente,
--   contrato, produto, status_operacao, valor_principal,
--   valor_parcela, data_operacao, data_pagamento,
--   raw_data (jsonb), processed_data (jsonb)

CREATE TABLE IF NOT EXISTS report_data (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  upload_id INTEGER NOT NULL REFERENCES uploads(id) ON DELETE CASCADE,
  row_number INTEGER NOT NULL,
  cpf VARCHAR(20),
  nome_cliente VARCHAR(500),
  contrato VARCHAR(100),
  produto VARCHAR(255),
  status_operacao VARCHAR(100),
  valor_principal DECIMAL(15,2),
  valor_parcela DECIMAL(15,2),
  data_operacao DATE,
  data_pagamento DATE,
  tipo_transacao VARCHAR(100),
  banco VARCHAR(255),
  agencia VARCHAR(20),
  conta VARCHAR(30),
  parcela_atual INTEGER,
  total_parcelas INTEGER,
  taxa_juros DECIMAL(8,4),
  valor_iof DECIMAL(15,2),
  valor_seguro DECIMAL(15,2),
  valor_liquido DECIMAL(15,2),
  raw_data JSONB,
  processed_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Colunas extras que podem estar faltando (campos de auditoria)
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

-- Índices para consultas frequentes
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
-- Registra o resultado da comparação entre lançamentos
-- do sistema e dados dos relatórios bancários/financeiros.
-- Status: 'conciliado', 'divergente', 'pendente', 'manual'

CREATE TABLE IF NOT EXISTS conciliacoes (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  upload_id INTEGER REFERENCES uploads(id) ON DELETE SET NULL,
  report_data_id INTEGER REFERENCES report_data(id) ON DELETE SET NULL,
  transaction_id INTEGER REFERENCES transactions(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'pendente',
  tipo_divergencia VARCHAR(100),
  valor_sistema DECIMAL(15,2),
  valor_relatorio DECIMAL(15,2),
  diferenca DECIMAL(15,2),
  observacao TEXT,
  resolvido_por INTEGER REFERENCES users(id) ON DELETE SET NULL,
  resolvido_em TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conciliacoes_tenant ON conciliacoes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_conciliacoes_upload ON conciliacoes(upload_id);
CREATE INDEX IF NOT EXISTS idx_conciliacoes_status ON conciliacoes(status);
CREATE INDEX IF NOT EXISTS idx_conciliacoes_report ON conciliacoes(report_data_id);
CREATE INDEX IF NOT EXISTS idx_conciliacoes_transaction ON conciliacoes(transaction_id);

-- ============================================================
-- FIM DA MIGRAÇÃO 006
-- ============================================================
