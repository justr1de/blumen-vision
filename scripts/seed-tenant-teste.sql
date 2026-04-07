-- =====================================================
-- Seed: Tenant de Teste para Upload de Documentos
-- Execute após a migração de tenants/filiais
-- =====================================================

-- Criar tenant de teste
INSERT INTO tenants (id, name, slug, email, cnpj, phone, is_active, created_at)
VALUES (
  gen_random_uuid(),
  'Empresa Teste',
  'empresa-teste',
  'teste@blumenvision.com.br',
  '00.000.000/0001-00',
  '(69) 99999-0000',
  true,
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- Criar usuário de teste vinculado ao tenant
-- Senha: teste123 (hash SHA256 com salt)
DO $$
DECLARE
  v_tenant_id UUID;
  v_salt TEXT := 'a1b2c3d4e5f6a7b8a1b2c3d4e5f6a7b8';
  v_hash TEXT;
BEGIN
  SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'empresa-teste';
  
  IF v_tenant_id IS NOT NULL THEN
    v_hash := v_salt || ':' || encode(digest(v_salt || 'teste123', 'sha256'), 'hex');
    
    INSERT INTO users (tenant_id, email, password_hash, name, role)
    VALUES (v_tenant_id, 'teste@blumenvision.com.br', v_hash, 'Usuário Teste', 'manager')
    ON CONFLICT (email) DO NOTHING;
    
    RAISE NOTICE 'Tenant de teste criado: %', v_tenant_id;
  END IF;
END $$;

-- Nota: Para criar o tenant via interface, use o formulário em /admin/clientes/novo
-- Credenciais de teste:
--   E-mail: teste@blumenvision.com.br
--   Senha: teste123
