-- ============================================================
-- SEED 011: Tenant de Teste
-- Banco: blumenvision (PostgreSQL / Cloud SQL)
--
-- Cria um tenant de teste com um usuário admin para
-- validação de funcionalidades de upload e processamento.
--
-- NOTA: Usa enum 'profissional' (não 'professional')
--       Usa role 'admin' (não 'manager')
--       Trata conflito de CNPJ duplicado
--
-- Credenciais: teste@blumenvision.com.br / teste123
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_tenant_id INTEGER;
  v_salt TEXT;
  v_hash TEXT;
BEGIN
  -- 1. Verificar se tenant de teste já existe (por slug ou CNPJ)
  SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'empresa-teste';

  IF v_tenant_id IS NULL THEN
    SELECT id INTO v_tenant_id FROM tenants WHERE cnpj = '00.000.000/0001-00';
  END IF;

  -- Se não existe, criar
  IF v_tenant_id IS NULL THEN
    INSERT INTO tenants (name, nome, slug, email, cnpj, plano, status, is_active,
      razao_social, nome_fantasia, proprietario, proprietario_cpf, phone)
    VALUES (
      'Empresa Teste', 'Empresa Teste', 'empresa-teste',
      'teste@blumenvision.com.br', '00.000.000/0001-00',
      'profissional', 'active', true,
      'Empresa Teste Ltda', 'Empresa Teste',
      'Usuário Teste', '000.000.000-00', '(00) 00000-0000'
    )
    RETURNING id INTO v_tenant_id;
  END IF;

  -- 2. Criar usuário de teste (role: admin)
  v_salt := encode(gen_random_bytes(16), 'hex');
  v_hash := v_salt || ':' || encode(sha256(convert_to(v_salt || 'teste123', 'UTF8')), 'hex');

  INSERT INTO users (tenant_id, name, email, password_hash, role, is_active)
  VALUES (v_tenant_id, 'Usuário Teste', 'teste@blumenvision.com.br', v_hash, 'admin', true)
  ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    tenant_id = EXCLUDED.tenant_id;

  RAISE NOTICE 'Tenant de teste criado/encontrado com ID: %', v_tenant_id;
END $$;

-- ============================================================
-- CREDENCIAIS DE ACESSO:
--   E-mail: teste@blumenvision.com.br
--   Senha:  teste123
-- ============================================================
