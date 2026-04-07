# Blúmen Vision — Scripts de Migração

## Visão Geral

Scripts SQL idempotentes para criação e manutenção do banco de dados PostgreSQL do Blúmen Vision. Todos os scripts usam `CREATE TABLE IF NOT EXISTS` e `ALTER TABLE ADD COLUMN IF NOT EXISTS`, sendo seguros para re-executar a qualquer momento.

## Estrutura do Banco

O banco utiliza **INTEGER (SERIAL)** como chave primária em todas as tabelas. As foreign keys são todas INTEGER referenciando o `id` da tabela pai.

### Tabelas (15 no total)

| Script | Tabela | Descrição |
|--------|--------|-----------|
| 001 | `tenants` | Empresas/clientes do sistema |
| 001 | `users` | Usuários com autenticação por e-mail |
| 001 | `uploads` | Arquivos enviados (planilhas, PDFs, imagens) |
| 001 | `sessions` | Sessões de autenticação (opcional, JWT-based) |
| 002 | `filiais` | Filiais/unidades de cada empresa |
| 003 | `groups` | Grupos empresariais (nível 1 da hierarquia) |
| 003 | `segments` | Segmentos de negócio (nível 2) |
| 003 | `units` | Unidades operacionais com CNPJ (nível 3) |
| 004 | `bank_accounts` | Contas bancárias |
| 004 | `categories` | Categorias de lançamento (receita/despesa/transferência) |
| 005 | `transactions` | Lançamentos financeiros |
| 006 | `report_data` | Dados extraídos dos uploads (planilhas/OCR) |
| 006 | `conciliacoes` | Resultados de conciliação bancária |
| 007 | `recebiveis` | Valores a receber (crediário, boletos, etc.) |
| 008 | `audit_log` | Log de auditoria de ações |
| 008 | `tenant_config` | Configurações por tenant |

### Hierarquia Gerencial (3 níveis)

```
Grupo (groups)
  └── Segmento (segments)
        └── Unidade (units) ← cada uma com CNPJ
```

## Como Executar

### Opção 1: Cloud SQL Studio (recomendado para produção)

1. Acesse o Cloud SQL Studio no Google Cloud Console
2. Conecte ao banco `blumenvision`
3. Cole e execute cada script na ordem numérica (001 → 009)
4. Depois, execute os seeds (010 → 011)

### Opção 2: Node.js Runner

```bash
# Apenas migrações (estrutura)
DATABASE_URL="postgresql://..." node scripts/run-migrations.mjs

# Migrações + seeds (estrutura + dados)
DATABASE_URL="postgresql://..." node scripts/run-migrations.mjs --with-seeds

# Apenas seeds (dados)
DATABASE_URL="postgresql://..." node scripts/run-migrations.mjs --only-seeds

# Dry run (mostra o que seria executado)
node scripts/run-migrations.mjs --dry-run
```

### Opção 3: psql

```bash
cd scripts/
psql $DATABASE_URL -f 000-run-all-migrations.sql
```

## Ordem de Execução

### Migrações (estrutura)

| # | Arquivo | O que faz |
|---|---------|-----------|
| 001 | `001-base-tables.sql` | Tabelas base: tenants, users, uploads, sessions |
| 002 | `002-tenants-filiais.sql` | Campos expandidos em tenants + tabela filiais |
| 003 | `003-hierarquia-gerencial.sql` | Groups, segments, units |
| 004 | `004-contas-categorias.sql` | Bank_accounts, categories |
| 005 | `005-lancamentos.sql` | Transactions (lançamentos financeiros) |
| 006 | `006-report-data-conciliacoes.sql` | Report_data, conciliacoes |
| 007 | `007-recebiveis.sql` | Recebíveis |
| 008 | `008-audit-config.sql` | Audit_log, tenant_config |
| 009 | `009-fix-compatibility.sql` | View de compatibilidade para código legado |

### Seeds (dados)

| # | Arquivo | O que faz |
|---|---------|-----------|
| 010 | `010-seed-superadmins.sql` | Tenants base + super admins + dados demo |
| 011 | `011-seed-tenant-teste.sql` | Tenant de teste para upload |

## Credenciais Padrão

| E-mail | Senha | Role | Tenant |
|--------|-------|------|--------|
| camila@blumenbiz.com | Blumen@2025 | super_admin | Blúmen Biz |
| anderson@blumenbiz.com | Blumen@2025 | super_admin | Blúmen Biz |
| contato@dataro-it.com.br | Blumen@2025 | super_admin | DataRO IT |
| suporte@dataro-it.com.br | Blumen@2025 | admin | DataRO IT |
| teste@blumenvision.com.br | teste123 | manager | Empresa Teste |

## Problemas Conhecidos

### Código legado em `/painel/page.tsx`

A página do painel do cliente ainda usa colunas que não existem na tabela `uploads`:
- `original_filename` → deveria ser `filename`
- `row_count` → deveria ser `(resultado->>'row_count')::INTEGER`

O script `009-fix-compatibility.sql` cria uma view `uploads_compat` como paliativo. A correção definitiva é atualizar o código TypeScript.

### Coluna `phone` vs `telefone`

A API (`app/api/admin/tenants/route.ts`) usa `phone`. Os scripts antigos usavam `telefone`. Os novos scripts (002) usam `phone` para manter consistência com o código.

### Coluna `name` vs `nome` em tenants

Algumas queries usam `COALESCE(t.nome, t.name)`. O script 009 garante que ambas as colunas existam e estejam sincronizadas.
