-- ============================================================
-- SEED: Criar tenant de teste para upload de planilhas
-- Banco: blumenvision (PostgreSQL / Cloud SQL)
-- NOTA: tenants.id e users.id são INTEGER (serial)
-- Requer extensão pgcrypto para crypt()
-- ============================================================

-- Garantir extensão pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Criar tenant de teste (se não existir pelo slug)
-- Colunas reais: uuid, nome, slug, plano, status, is_active, cnpj, created_at, updated_at
INSERT INTO tenants (uuid, nome, slug, plano, status, is_active, cnpj, created_at, updated_at)
SELECT
  gen_random_uuid(),
  'Empresa Teste',
  'empresa-teste',
  'professional',
  'active',
  true,
  '00.000.000/0001-00',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM tenants WHERE slug = 'empresa-teste'
);

-- 2. Atualizar campos extras do tenant (se a migração já foi executada)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'razao_social') THEN
    UPDATE tenants SET
      razao_social = 'Empresa Teste Ltda',
      nome_fantasia = 'Empresa Teste',
      proprietario = 'Usuário Teste',
      proprietario_cpf = '000.000.000-00',
      email = 'teste@blumenvision.com.br',
      telefone = '(00) 00000-0000'
    WHERE slug = 'empresa-teste';
  END IF;
END $$;

-- 3. Criar usuário de teste vinculado ao tenant
-- Colunas reais: uuid, name, email, password_hash, login_method, role, status, email_verified, tenant_id, is_active
DO $$
DECLARE
  v_tenant_id INTEGER;
BEGIN
  SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'empresa-teste';

  IF v_tenant_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'teste@blumenvision.com.br') THEN
    INSERT INTO users (uuid, name, email, password_hash, login_method, role, status, email_verified, tenant_id, is_active, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      'Usuário Teste',
      'teste@blumenvision.com.br',
      crypt('teste123', gen_salt('bf')),
      'credentials',
      'user',
      'active',
      true,
      v_tenant_id,
      true,
      NOW(),
      NOW()
    );
    RAISE NOTICE 'Usuário de teste criado para tenant ID: %', v_tenant_id;
  ELSE
    RAISE NOTICE 'Tenant não encontrado ou usuário já existe';
  END IF;
END $$;

-- ============================================================
-- Credenciais de acesso:
--   E-mail: teste@blumenvision.com.br
--   Senha:  teste123
-- ============================================================
