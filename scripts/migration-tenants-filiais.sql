-- ============================================================
-- MIGRAÇÃO: Expandir tabela tenants + Criar tabela filiais
-- Banco: blumenvision (PostgreSQL / Cloud SQL)
-- NOTA: tenants.id é INTEGER (serial), não UUID
-- Todos os comandos são idempotentes (seguros para re-executar)
-- ============================================================

-- 1. Adicionar novos campos à tabela tenants
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS razao_social VARCHAR(500);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS nome_fantasia VARCHAR(500);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS proprietario VARCHAR(255);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS proprietario_cpf VARCHAR(14);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS telefone VARCHAR(20);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS endereco_logradouro VARCHAR(500);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS endereco_numero VARCHAR(20);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS endereco_complemento VARCHAR(255);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS endereco_bairro VARCHAR(255);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS endereco_cidade VARCHAR(255);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS endereco_uf VARCHAR(2);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS endereco_cep VARCHAR(10);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS has_filiais BOOLEAN DEFAULT false;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- 2. Criar tabela de filiais (tenant_id é INTEGER, referenciando tenants.id)
CREATE TABLE IF NOT EXISTS filiais (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  razao_social VARCHAR(500) NOT NULL,
  nome_fantasia VARCHAR(500),
  cnpj VARCHAR(18),
  responsavel VARCHAR(255),
  email VARCHAR(255),
  telefone VARCHAR(20),
  endereco_logradouro VARCHAR(500),
  endereco_numero VARCHAR(20),
  endereco_complemento VARCHAR(255),
  endereco_bairro VARCHAR(255),
  endereco_cidade VARCHAR(255),
  endereco_uf VARCHAR(2),
  endereco_cep VARCHAR(10),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Criar tabela report_data (se não existir)
CREATE TABLE IF NOT EXISTS report_data (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  upload_id INTEGER NOT NULL REFERENCES uploads(id) ON DELETE CASCADE,
  row_number INTEGER NOT NULL,
  cpf VARCHAR(20),
  nome_cliente VARCHAR(300),
  contrato VARCHAR(100),
  produto VARCHAR(200),
  status_operacao VARCHAR(100),
  valor_principal DECIMAL(15,2),
  valor_parcela DECIMAL(15,2),
  data_operacao DATE,
  data_pagamento DATE,
  raw_data JSONB,
  processed_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Índices para performance
CREATE INDEX IF NOT EXISTS idx_filiais_tenant ON filiais(tenant_id);
CREATE INDEX IF NOT EXISTS idx_filiais_cnpj ON filiais(cnpj);
CREATE INDEX IF NOT EXISTS idx_report_data_tenant ON report_data(tenant_id);
CREATE INDEX IF NOT EXISTS idx_report_data_upload ON report_data(upload_id);
CREATE INDEX IF NOT EXISTS idx_report_data_cpf ON report_data(cpf);
CREATE INDEX IF NOT EXISTS idx_report_data_contrato ON report_data(contrato);

-- ============================================================
-- FIM DA MIGRAÇÃO
-- ============================================================
