-- ============================================================
-- Blúmen Vision — Schema do Banco de Dados
-- Banco: blumenvision (PostgreSQL / Cloud SQL)
-- NOTA: tenants.id, users.id, uploads.id são INTEGER (serial)
-- ============================================================

-- ATENÇÃO: As tabelas abaixo são para o módulo Vision Caixa.
-- As tabelas base (tenants, users, uploads, sessions, etc.)
-- já existem no banco e NÃO devem ser recriadas.
-- ============================================================

-- Tabela de Grupos (Nível 3 da hierarquia gerencial)
-- Usa a tabela 'segmentos' que já existe no banco para nível superior
-- Se precisar de hierarquia adicional, descomente abaixo:

-- CREATE TABLE IF NOT EXISTS vision_groups (
--   id SERIAL PRIMARY KEY,
--   tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
--   name VARCHAR(255) NOT NULL,
--   description TEXT,
--   is_active BOOLEAN DEFAULT true,
--   created_at TIMESTAMPTZ DEFAULT NOW(),
--   updated_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- Tabela de Contas Bancárias do Vision (complementar à contas_bancarias existente)
-- A tabela contas_bancarias já existe no banco.
-- Se precisar de campos adicionais, use ALTER TABLE.

-- Tabela de Categorias de Lançamento do Vision (complementar à categorias existente)
-- A tabela categorias já existe no banco.

-- Tabela de Lançamentos do Vision (complementar à lancamentos existente)
-- A tabela lancamentos já existe no banco.

-- Tabela de Recebíveis do Vision (complementar à recebiveis existente)
-- A tabela recebiveis já existe no banco.

-- ============================================================
-- Tabelas que NÃO existem e precisam ser criadas:
-- ============================================================

-- Tabela report_data (dados processados dos uploads)
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
  raw_data JSONB,
  processed_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para report_data
CREATE INDEX IF NOT EXISTS idx_report_data_tenant ON report_data(tenant_id);
CREATE INDEX IF NOT EXISTS idx_report_data_upload ON report_data(upload_id);
CREATE INDEX IF NOT EXISTS idx_report_data_cpf ON report_data(cpf);
CREATE INDEX IF NOT EXISTS idx_report_data_contrato ON report_data(contrato);

-- ============================================================
-- FIM DO SETUP
-- ============================================================
