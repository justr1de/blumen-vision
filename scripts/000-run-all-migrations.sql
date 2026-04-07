-- ============================================================
-- BLÚMEN VISION — Script Master de Migração
-- ============================================================
--
-- Este script executa todas as migrações em ordem.
-- Cada migração é idempotente e segura para re-executar.
--
-- COMO EXECUTAR:
--   Opção 1 — Cloud SQL Studio (recomendado):
--     Copie e cole cada arquivo .sql na ordem abaixo.
--
--   Opção 2 — psql via terminal:
--     psql $DATABASE_URL -f scripts/000-run-all-migrations.sql
--
--   Opção 3 — Node.js runner:
--     node scripts/run-migrations.mjs
--
-- ORDEM DE EXECUÇÃO:
--   001-base-tables.sql        → tenants, users, uploads, sessions
--   002-tenants-filiais.sql    → expansão tenants + filiais
--   003-hierarquia-gerencial.sql → groups, segments, units
--   004-contas-categorias.sql  → bank_accounts, categories
--   005-lancamentos.sql        → transactions
--   006-report-data-conciliacoes.sql → report_data, conciliacoes
--   007-recebiveis.sql         → recebiveis
--   008-audit-config.sql       → audit_log, tenant_config
--
-- TABELAS CRIADAS (total: 15):
--   tenants, users, uploads, sessions,
--   filiais, groups, segments, units,
--   bank_accounts, categories, transactions,
--   report_data, conciliacoes, recebiveis,
--   audit_log, tenant_config
--
-- ============================================================

\echo '================================================'
\echo 'Blúmen Vision — Executando migrações...'
\echo '================================================'

\echo ''
\echo '>>> 001: Tabelas base (tenants, users, uploads, sessions)'
\i 001-base-tables.sql

\echo ''
\echo '>>> 002: Expansão tenants + filiais'
\i 002-tenants-filiais.sql

\echo ''
\echo '>>> 003: Hierarquia gerencial (groups, segments, units)'
\i 003-hierarquia-gerencial.sql

\echo ''
\echo '>>> 004: Contas bancárias e categorias'
\i 004-contas-categorias.sql

\echo ''
\echo '>>> 005: Lançamentos (transactions)'
\i 005-lancamentos.sql

\echo ''
\echo '>>> 006: Report data + conciliações'
\i 006-report-data-conciliacoes.sql

\echo ''
\echo '>>> 007: Recebíveis'
\i 007-recebiveis.sql

\echo ''
\echo '>>> 008: Audit log + configurações'
\i 008-audit-config.sql

\echo ''
\echo '================================================'
\echo 'Todas as migrações executadas com sucesso!'
\echo '================================================'

-- Verificação final: listar todas as tabelas
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;
