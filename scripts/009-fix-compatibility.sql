-- ============================================================
-- MIGRAÇÃO 009: Correções de Compatibilidade
-- Banco: blumenvision (PostgreSQL / Cloud SQL)
--
-- Algumas páginas da aplicação ainda usam nomes de colunas
-- antigos (original_filename, row_count) que não existem
-- na tabela uploads. Este script cria views de compatibilidade
-- e garante que o banco funcione com todo o código existente.
--
-- NOTA: A correção definitiva é atualizar o código da aplicação
-- para usar os nomes corretos (filename, resultado->>'row_count').
-- As views abaixo são um paliativo temporário.
-- ============================================================

-- 1. Garantir que a coluna 'nome' exista em tenants
-- (algumas queries usam COALESCE(t.nome, t.name))
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS nome VARCHAR(500);

-- 2. Sincronizar nome/name quando um estiver NULL
-- (executar manualmente se necessário)
UPDATE tenants SET nome = name WHERE nome IS NULL AND name IS NOT NULL;
UPDATE tenants SET name = nome WHERE name IS NULL AND nome IS NOT NULL;

-- 3. View de compatibilidade para uploads
-- A página /painel/page.tsx usa: original_filename, row_count
-- A API correta usa: filename, resultado->'row_count'
CREATE OR REPLACE VIEW uploads_compat AS
SELECT
  id,
  tenant_id,
  user_id,
  filename,
  filename AS original_filename,
  file_url,
  file_key,
  mime_type,
  size,
  status,
  resultado,
  COALESCE((resultado->>'row_count')::INTEGER, 0) AS row_count,
  created_at,
  updated_at
FROM uploads;

-- NOTA: Para usar esta view, altere as queries que usam
-- 'FROM uploads' para 'FROM uploads_compat' nas páginas
-- que ainda usam os nomes antigos. Ou, melhor ainda,
-- corrija o código para usar os nomes corretos.

-- ============================================================
-- FIM DA MIGRAÇÃO 009
-- ============================================================
