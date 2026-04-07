-- ============================================================
-- MIGRAÇÃO 002: Expandir tenants + Criar tabela filiais
-- Banco: blumenvision (PostgreSQL / Cloud SQL)
--
-- NOTA: tenants.id é INTEGER (serial), não UUID.
-- Todos os comandos são idempotentes (seguros para re-executar).
--
-- Esta migração adiciona campos de cadastro completo ao tenant
-- (razão social, nome fantasia, proprietário, endereço, etc.)
-- e cria a tabela de filiais para empresas com múltiplas unidades.
-- ============================================================

-- 1. Campos de identificação da empresa
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS razao_social VARCHAR(500);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS nome_fantasia VARCHAR(500);

-- 2. Campos do proprietário/responsável
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS proprietario VARCHAR(255);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS proprietario_cpf VARCHAR(14);

-- 3. Campos de endereço
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS endereco_logradouro VARCHAR(500);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS endereco_numero VARCHAR(20);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS endereco_complemento VARCHAR(255);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS endereco_bairro VARCHAR(255);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS endereco_cidade VARCHAR(255);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS endereco_uf VARCHAR(2);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS endereco_cep VARCHAR(10);

-- 4. Campos de controle de filiais
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS has_filiais BOOLEAN DEFAULT false;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- ============================================================
-- TABELA: filiais
-- Cada filial pertence a um tenant (empresa).
-- A coluna phone (não telefone) é usada pela API.
-- ============================================================

CREATE TABLE IF NOT EXISTS filiais (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  razao_social VARCHAR(500) NOT NULL,
  nome_fantasia VARCHAR(500),
  cnpj VARCHAR(18),
  responsavel VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
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

-- Índices para filiais
CREATE INDEX IF NOT EXISTS idx_filiais_tenant ON filiais(tenant_id);
CREATE INDEX IF NOT EXISTS idx_filiais_cnpj ON filiais(cnpj);
CREATE INDEX IF NOT EXISTS idx_filiais_active ON filiais(tenant_id, is_active);

-- ============================================================
-- FIM DA MIGRAÇÃO 002
-- ============================================================
