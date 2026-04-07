-- ============================================================
-- SEED 010: Super Admins e Dados Demo
-- Banco: blumenvision (PostgreSQL / Cloud SQL)
--
-- NOTA: Todos os IDs são INTEGER (serial), não UUID.
-- Este script substitui o seed-superadmins.sql antigo que
-- usava UUIDs como IDs.
--
-- Credenciais padrão: Blumen@2025
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1. TENANTS
-- ============================================================

-- Tenant: Blúmen Biz (empresa principal)
INSERT INTO tenants (name, nome, slug, email, cnpj, plano, status, is_active)
VALUES ('Blúmen Biz', 'Blúmen Biz', 'blumen-biz', 'camila@blumenbiz.com', NULL, 'enterprise', 'active', true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  nome = EXCLUDED.nome,
  email = EXCLUDED.email;

-- Tenant: DataRO IT (suporte técnico)
INSERT INTO tenants (name, nome, slug, email, cnpj, plano, status, is_active)
VALUES ('DataRO IT', 'DataRO IT', 'dataro-it', 'contato@dataro-it.com.br', NULL, 'enterprise', 'active', true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  nome = EXCLUDED.nome,
  email = EXCLUDED.email;

-- ============================================================
-- 2. SUPER ADMINS
-- ============================================================
-- Senha: Blumen@2025
-- Hash: salt:sha256(salt + password)

DO $$
DECLARE
  v_blumen_id INTEGER;
  v_dataro_id INTEGER;
  v_salt TEXT := 'blumensalt2025';
  v_hash TEXT;
BEGIN
  -- Buscar IDs dos tenants
  SELECT id INTO v_blumen_id FROM tenants WHERE slug = 'blumen-biz';
  SELECT id INTO v_dataro_id FROM tenants WHERE slug = 'dataro-it';

  -- Gerar hash da senha
  v_hash := v_salt || ':' || encode(sha256(convert_to(v_salt || 'Blumen@2025', 'UTF8')), 'hex');

  -- Camila Arnuti (super_admin)
  INSERT INTO users (tenant_id, name, email, password_hash, role, is_active)
  VALUES (v_blumen_id, 'Camila Arnuti', 'camila@blumenbiz.com', v_hash, 'super_admin', true)
  ON CONFLICT (email) DO UPDATE SET
    role = 'super_admin',
    is_active = true,
    password_hash = EXCLUDED.password_hash,
    tenant_id = EXCLUDED.tenant_id;

  -- Anderson (super_admin)
  INSERT INTO users (tenant_id, name, email, password_hash, role, is_active)
  VALUES (v_blumen_id, 'Anderson', 'anderson@blumenbiz.com', v_hash, 'super_admin', true)
  ON CONFLICT (email) DO UPDATE SET
    role = 'super_admin',
    is_active = true,
    password_hash = EXCLUDED.password_hash,
    tenant_id = EXCLUDED.tenant_id;

  -- DataRO IT - Suporte (super_admin)
  INSERT INTO users (tenant_id, name, email, password_hash, role, is_active)
  VALUES (v_dataro_id, 'DataRO IT - Suporte', 'contato@dataro-it.com.br', v_hash, 'super_admin', true)
  ON CONFLICT (email) DO UPDATE SET
    role = 'super_admin',
    is_active = true,
    password_hash = EXCLUDED.password_hash,
    tenant_id = EXCLUDED.tenant_id;

  -- DataRO IT - Suporte 2 (admin)
  INSERT INTO users (tenant_id, name, email, password_hash, role, is_active)
  VALUES (v_dataro_id, 'DataRO IT - Suporte 2', 'suporte@dataro-it.com.br', v_hash, 'admin', true)
  ON CONFLICT (email) DO UPDATE SET
    role = 'admin',
    is_active = true,
    password_hash = EXCLUDED.password_hash,
    tenant_id = EXCLUDED.tenant_id;

  RAISE NOTICE 'Super admins criados. Blumen ID: %, DataRO ID: %', v_blumen_id, v_dataro_id;
END $$;

-- ============================================================
-- 3. DADOS DEMO: Hierarquia Gerencial (para tenant Blúmen Biz)
-- ============================================================

DO $$
DECLARE
  v_tenant_id INTEGER;
  v_group_id INTEGER;
  v_seg_fin_id INTEGER;
  v_seg_var_id INTEGER;
  v_seg_ind_id INTEGER;
BEGIN
  SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'blumen-biz';
  IF v_tenant_id IS NULL THEN
    RAISE NOTICE 'Tenant blumen-biz não encontrado, pulando dados demo';
    RETURN;
  END IF;

  -- Grupo Imediata
  INSERT INTO groups (tenant_id, name, description)
  VALUES (v_tenant_id, 'Grupo Imediata', 'Consolidado de todas as operações')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_group_id;

  IF v_group_id IS NULL THEN
    SELECT id INTO v_group_id FROM groups WHERE tenant_id = v_tenant_id AND name = 'Grupo Imediata';
  END IF;

  -- Segmentos
  INSERT INTO segments (group_id, tenant_id, name, description)
  VALUES (v_group_id, v_tenant_id, 'Serviços Financeiros', 'Operações de serviços financeiros')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_seg_fin_id;
  IF v_seg_fin_id IS NULL THEN
    SELECT id INTO v_seg_fin_id FROM segments WHERE tenant_id = v_tenant_id AND name = 'Serviços Financeiros';
  END IF;

  INSERT INTO segments (group_id, tenant_id, name, description)
  VALUES (v_group_id, v_tenant_id, 'Varejo', 'Operações de varejo')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_seg_var_id;
  IF v_seg_var_id IS NULL THEN
    SELECT id INTO v_seg_var_id FROM segments WHERE tenant_id = v_tenant_id AND name = 'Varejo';
  END IF;

  INSERT INTO segments (group_id, tenant_id, name, description)
  VALUES (v_group_id, v_tenant_id, 'Indústria', 'Operações industriais')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_seg_ind_id;
  IF v_seg_ind_id IS NULL THEN
    SELECT id INTO v_seg_ind_id FROM segments WHERE tenant_id = v_tenant_id AND name = 'Indústria';
  END IF;

  -- Unidades
  INSERT INTO units (segment_id, tenant_id, name, cnpj)
  SELECT v_seg_fin_id, v_tenant_id, 'Loja Centro', '12.345.678/0001-01'
  WHERE NOT EXISTS (SELECT 1 FROM units WHERE tenant_id = v_tenant_id AND name = 'Loja Centro');

  INSERT INTO units (segment_id, tenant_id, name, cnpj)
  SELECT v_seg_fin_id, v_tenant_id, 'Loja Norte', '12.345.678/0002-02'
  WHERE NOT EXISTS (SELECT 1 FROM units WHERE tenant_id = v_tenant_id AND name = 'Loja Norte');

  INSERT INTO units (segment_id, tenant_id, name, cnpj)
  SELECT v_seg_var_id, v_tenant_id, 'Loja Sul', '23.456.789/0001-01'
  WHERE NOT EXISTS (SELECT 1 FROM units WHERE tenant_id = v_tenant_id AND name = 'Loja Sul');

  INSERT INTO units (segment_id, tenant_id, name, cnpj)
  SELECT v_seg_var_id, v_tenant_id, 'Loja Oeste', '23.456.789/0002-02'
  WHERE NOT EXISTS (SELECT 1 FROM units WHERE tenant_id = v_tenant_id AND name = 'Loja Oeste');

  INSERT INTO units (segment_id, tenant_id, name, cnpj)
  SELECT v_seg_ind_id, v_tenant_id, 'Fábrica Principal', '34.567.890/0001-01'
  WHERE NOT EXISTS (SELECT 1 FROM units WHERE tenant_id = v_tenant_id AND name = 'Fábrica Principal');

  RAISE NOTICE 'Dados demo criados para tenant ID: %', v_tenant_id;
END $$;

-- ============================================================
-- 4. CATEGORIAS PADRÃO (para tenant Blúmen Biz)
-- ============================================================

DO $$
DECLARE
  v_tenant_id INTEGER;
BEGIN
  SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'blumen-biz';
  IF v_tenant_id IS NULL THEN RETURN; END IF;

  INSERT INTO categories (tenant_id, name, type) VALUES
    (v_tenant_id, 'Vendas', 'receita'),
    (v_tenant_id, 'Serviços', 'receita'),
    (v_tenant_id, 'Aluguel', 'despesa'),
    (v_tenant_id, 'Pessoal', 'despesa'),
    (v_tenant_id, 'Impostos', 'despesa'),
    (v_tenant_id, 'Financeiro', 'despesa'),
    (v_tenant_id, 'Despesa Fixa', 'despesa'),
    (v_tenant_id, 'Transferência', 'transferencia')
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Categorias padrão criadas para tenant ID: %', v_tenant_id;
END $$;

-- ============================================================
-- CREDENCIAIS DE ACESSO:
--   camila@blumenbiz.com      → super_admin (Blumen@2025)
--   anderson@blumenbiz.com    → super_admin (Blumen@2025)
--   contato@dataro-it.com.br  → super_admin (Blumen@2025)
--   suporte@dataro-it.com.br  → admin       (Blumen@2025)
-- ============================================================
