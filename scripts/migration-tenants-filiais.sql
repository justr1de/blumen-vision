-- =====================================================
-- Migração: Expandir tabela tenants + Criar tabela filiais
-- =====================================================

-- Adicionar novos campos à tabela tenants
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS razao_social VARCHAR(500);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS nome_fantasia VARCHAR(500);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS proprietario VARCHAR(255);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS proprietario_cpf VARCHAR(14);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS endereco_logradouro VARCHAR(500);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS endereco_numero VARCHAR(20);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS endereco_complemento VARCHAR(255);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS endereco_bairro VARCHAR(255);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS endereco_cidade VARCHAR(255);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS endereco_uf VARCHAR(2);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS endereco_cep VARCHAR(10);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS has_filiais BOOLEAN DEFAULT false;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- Tabela de Filiais
CREATE TABLE IF NOT EXISTS filiais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
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
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_filiais_tenant ON filiais(tenant_id);
CREATE INDEX IF NOT EXISTS idx_filiais_cnpj ON filiais(cnpj);
