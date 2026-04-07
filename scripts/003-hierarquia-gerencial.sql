-- ============================================================
-- MIGRAÇÃO 003: Hierarquia Gerencial (Groups, Segments, Units)
-- Banco: blumenvision (PostgreSQL / Cloud SQL)
--
-- Estrutura de 3 níveis:
--   Grupo (groups) → Segmento (segments) → Unidade (units)
--
-- Exemplo:
--   Grupo Imediata
--     ├── Serviços Financeiros
--     │     ├── Loja Centro
--     │     └── Loja Norte
--     ├── Varejo
--     │     ├── Loja Sul
--     │     └── Loja Oeste
--     └── Indústria
--           └── Fábrica Principal
--
-- NOTA: Nomes de tabelas em inglês conforme código da aplicação.
-- Todos os IDs são INTEGER (serial). Todos os comandos idempotentes.
-- ============================================================

-- ============================================================
-- 1. GROUPS (Grupos — nível 1)
-- ============================================================

CREATE TABLE IF NOT EXISTS groups (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE groups ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_groups_tenant ON groups(tenant_id);

-- ============================================================
-- 2. SEGMENTS (Segmentos — nível 2)
-- ============================================================

CREATE TABLE IF NOT EXISTS segments (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE segments ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE segments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_segments_group ON segments(group_id);
CREATE INDEX IF NOT EXISTS idx_segments_tenant ON segments(tenant_id);

-- ============================================================
-- 3. UNITS (Unidades — nível 3, cada uma com CNPJ)
-- ============================================================

CREATE TABLE IF NOT EXISTS units (
  id SERIAL PRIMARY KEY,
  segment_id INTEGER NOT NULL REFERENCES segments(id) ON DELETE CASCADE,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
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

ALTER TABLE units ADD COLUMN IF NOT EXISTS responsavel VARCHAR(255);
ALTER TABLE units ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE units ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE units ADD COLUMN IF NOT EXISTS endereco_logradouro VARCHAR(500);
ALTER TABLE units ADD COLUMN IF NOT EXISTS endereco_numero VARCHAR(20);
ALTER TABLE units ADD COLUMN IF NOT EXISTS endereco_complemento VARCHAR(255);
ALTER TABLE units ADD COLUMN IF NOT EXISTS endereco_bairro VARCHAR(255);
ALTER TABLE units ADD COLUMN IF NOT EXISTS endereco_cidade VARCHAR(255);
ALTER TABLE units ADD COLUMN IF NOT EXISTS endereco_uf VARCHAR(2);
ALTER TABLE units ADD COLUMN IF NOT EXISTS endereco_cep VARCHAR(10);
ALTER TABLE units ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE units ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_units_segment ON units(segment_id);
CREATE INDEX IF NOT EXISTS idx_units_tenant ON units(tenant_id);
CREATE INDEX IF NOT EXISTS idx_units_cnpj ON units(cnpj);

-- ============================================================
-- FIM DA MIGRAÇÃO 003
-- ============================================================
