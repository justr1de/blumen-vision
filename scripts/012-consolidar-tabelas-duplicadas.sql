-- ============================================================
-- MIGRAÇÃO 012: Consolidar Tabelas Duplicadas (EN → PT)
--
-- O banco possui tabelas duplicadas em inglês e português.
-- Esta migração:
--   1. Garante que as tabelas PT tenham todas as colunas
--   2. Migra dados das tabelas EN para PT (se houver)
--   3. Cria views EN → PT para compatibilidade temporária
--   4. Remove as tabelas EN originais
--
-- Pares duplicados:
--   bank_accounts  → contas_bancarias
--   categories     → categorias
--   segments       → segmentos
--   transactions   → lancamentos
--   units          → unidades
--
-- IMPORTANTE: Execute em duas partes se der erro.
-- Todos os comandos são idempotentes.
-- ============================================================


-- ============================================================
-- PARTE 1: Garantir colunas nas tabelas PT
-- ============================================================

-- 1A. contas_bancarias (equivale a bank_accounts)
ALTER TABLE contas_bancarias ADD COLUMN IF NOT EXISTS unit_id INTEGER;
ALTER TABLE contas_bancarias ADD COLUMN IF NOT EXISTS nome VARCHAR(255);
ALTER TABLE contas_bancarias ADD COLUMN IF NOT EXISTS banco VARCHAR(255);
ALTER TABLE contas_bancarias ADD COLUMN IF NOT EXISTS agencia VARCHAR(20);
ALTER TABLE contas_bancarias ADD COLUMN IF NOT EXISTS conta VARCHAR(30);
ALTER TABLE contas_bancarias ADD COLUMN IF NOT EXISTS tipo VARCHAR(50);
ALTER TABLE contas_bancarias ADD COLUMN IF NOT EXISTS saldo_inicial DECIMAL(15,2) DEFAULT 0;
ALTER TABLE contas_bancarias ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
ALTER TABLE contas_bancarias ADD COLUMN IF NOT EXISTS descricao TEXT;
ALTER TABLE contas_bancarias ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE contas_bancarias ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMPTZ DEFAULT NOW();
-- Colunas em inglês que bank_accounts pode ter (manter para compatibilidade)
ALTER TABLE contas_bancarias ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE contas_bancarias ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255);
ALTER TABLE contas_bancarias ADD COLUMN IF NOT EXISTS agency VARCHAR(20);
ALTER TABLE contas_bancarias ADD COLUMN IF NOT EXISTS account_number VARCHAR(30);
ALTER TABLE contas_bancarias ADD COLUMN IF NOT EXISTS account_type VARCHAR(50);
ALTER TABLE contas_bancarias ADD COLUMN IF NOT EXISTS initial_balance DECIMAL(15,2) DEFAULT 0;
ALTER TABLE contas_bancarias ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE contas_bancarias ADD COLUMN IF NOT EXISTS description TEXT;

-- 1B. categorias (equivale a categories)
ALTER TABLE categorias ADD COLUMN IF NOT EXISTS parent_id INTEGER;
ALTER TABLE categorias ADD COLUMN IF NOT EXISTS nome VARCHAR(255);
ALTER TABLE categorias ADD COLUMN IF NOT EXISTS tipo VARCHAR(50);
ALTER TABLE categorias ADD COLUMN IF NOT EXISTS descricao TEXT;
ALTER TABLE categorias ADD COLUMN IF NOT EXISTS codigo VARCHAR(20);
ALTER TABLE categorias ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
ALTER TABLE categorias ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE categorias ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMPTZ DEFAULT NOW();
-- Colunas EN
ALTER TABLE categorias ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE categorias ADD COLUMN IF NOT EXISTS type VARCHAR(50);
ALTER TABLE categorias ADD COLUMN IF NOT EXISTS code VARCHAR(20);
ALTER TABLE categorias ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 1C. segmentos (equivale a segments)
ALTER TABLE segmentos ADD COLUMN IF NOT EXISTS group_id INTEGER;
ALTER TABLE segmentos ADD COLUMN IF NOT EXISTS nome VARCHAR(255);
ALTER TABLE segmentos ADD COLUMN IF NOT EXISTS descricao TEXT;
ALTER TABLE segmentos ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
ALTER TABLE segmentos ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE segmentos ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMPTZ DEFAULT NOW();
-- Colunas EN
ALTER TABLE segmentos ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE segmentos ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE segmentos ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 1D. unidades (equivale a units)
ALTER TABLE unidades ADD COLUMN IF NOT EXISTS segment_id INTEGER;
ALTER TABLE unidades ADD COLUMN IF NOT EXISTS nome VARCHAR(255);
ALTER TABLE unidades ADD COLUMN IF NOT EXISTS cnpj VARCHAR(20);
ALTER TABLE unidades ADD COLUMN IF NOT EXISTS descricao TEXT;
ALTER TABLE unidades ADD COLUMN IF NOT EXISTS responsavel VARCHAR(255);
ALTER TABLE unidades ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE unidades ADD COLUMN IF NOT EXISTS telefone VARCHAR(20);
ALTER TABLE unidades ADD COLUMN IF NOT EXISTS endereco TEXT;
ALTER TABLE unidades ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
ALTER TABLE unidades ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE unidades ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMPTZ DEFAULT NOW();
-- Colunas EN
ALTER TABLE unidades ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE unidades ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE unidades ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 1E. lancamentos (equivale a transactions)
ALTER TABLE lancamentos ADD COLUMN IF NOT EXISTS unit_id INTEGER;
ALTER TABLE lancamentos ADD COLUMN IF NOT EXISTS segment_id INTEGER;
ALTER TABLE lancamentos ADD COLUMN IF NOT EXISTS group_id INTEGER;
ALTER TABLE lancamentos ADD COLUMN IF NOT EXISTS bank_account_id INTEGER;
ALTER TABLE lancamentos ADD COLUMN IF NOT EXISTS category_id INTEGER;
ALTER TABLE lancamentos ADD COLUMN IF NOT EXISTS tipo VARCHAR(50);
ALTER TABLE lancamentos ADD COLUMN IF NOT EXISTS descricao TEXT;
ALTER TABLE lancamentos ADD COLUMN IF NOT EXISTS valor DECIMAL(15,2);
ALTER TABLE lancamentos ADD COLUMN IF NOT EXISTS data_lancamento DATE;
ALTER TABLE lancamentos ADD COLUMN IF NOT EXISTS data_vencimento DATE;
ALTER TABLE lancamentos ADD COLUMN IF NOT EXISTS data_pagamento DATE;
ALTER TABLE lancamentos ADD COLUMN IF NOT EXISTS referencia VARCHAR(255);
ALTER TABLE lancamentos ADD COLUMN IF NOT EXISTS observacoes TEXT;
ALTER TABLE lancamentos ADD COLUMN IF NOT EXISTS metadata JSONB;
ALTER TABLE lancamentos ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE lancamentos ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMPTZ DEFAULT NOW();
-- Colunas EN
ALTER TABLE lancamentos ADD COLUMN IF NOT EXISTS type VARCHAR(50);
ALTER TABLE lancamentos ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE lancamentos ADD COLUMN IF NOT EXISTS amount DECIMAL(15,2);
ALTER TABLE lancamentos ADD COLUMN IF NOT EXISTS transaction_date DATE;
ALTER TABLE lancamentos ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE lancamentos ADD COLUMN IF NOT EXISTS payment_date DATE;
ALTER TABLE lancamentos ADD COLUMN IF NOT EXISTS reference VARCHAR(255);
ALTER TABLE lancamentos ADD COLUMN IF NOT EXISTS notes TEXT;


-- ============================================================
-- PARTE 2: Migrar dados das tabelas EN para PT (se houver)
-- ============================================================

-- Migrar bank_accounts → contas_bancarias
INSERT INTO contas_bancarias (tenant_id, unit_id, name, bank_name, agency, account_number, account_type, initial_balance, is_active, description)
SELECT tenant_id, unit_id, name, bank_name, agency, account_number, account_type, initial_balance, is_active, description
FROM bank_accounts ba
WHERE NOT EXISTS (
  SELECT 1 FROM contas_bancarias cb
  WHERE cb.tenant_id = ba.tenant_id AND COALESCE(cb.name, cb.nome) = ba.name
)
ON CONFLICT DO NOTHING;

-- Migrar categories → categorias
INSERT INTO categorias (tenant_id, name, type, parent_id, description, code, is_active)
SELECT tenant_id, name, type, parent_id, description, code, is_active
FROM categories c
WHERE NOT EXISTS (
  SELECT 1 FROM categorias cat
  WHERE cat.tenant_id = c.tenant_id AND COALESCE(cat.name, cat.nome) = c.name
)
ON CONFLICT DO NOTHING;

-- Migrar segments → segmentos
INSERT INTO segmentos (tenant_id, group_id, name, description, is_active)
SELECT tenant_id, group_id, name, description, is_active
FROM segments s
WHERE NOT EXISTS (
  SELECT 1 FROM segmentos seg
  WHERE seg.tenant_id = s.tenant_id AND COALESCE(seg.name, seg.nome) = s.name
)
ON CONFLICT DO NOTHING;

-- Migrar units → unidades
INSERT INTO unidades (tenant_id, segment_id, name, cnpj, is_active)
SELECT tenant_id, segment_id, name, cnpj, is_active
FROM units u
WHERE NOT EXISTS (
  SELECT 1 FROM unidades uni
  WHERE uni.tenant_id = u.tenant_id AND COALESCE(uni.name, uni.nome) = u.name
)
ON CONFLICT DO NOTHING;

-- Migrar transactions → lancamentos
INSERT INTO lancamentos (tenant_id, unit_id, segment_id, group_id, bank_account_id, category_id, type, description, amount, transaction_date, due_date, payment_date, reference, notes, status, metadata)
SELECT tenant_id, unit_id, segment_id, group_id, bank_account_id, category_id, type, description, amount, transaction_date, due_date, payment_date, reference, notes, status, metadata
FROM transactions t
WHERE NOT EXISTS (
  SELECT 1 FROM lancamentos l
  WHERE l.tenant_id = t.tenant_id AND l.description = t.description AND l.amount = t.amount AND l.transaction_date = t.transaction_date
)
ON CONFLICT DO NOTHING;


-- ============================================================
-- PARTE 3: Dropar tabelas EN e criar views de compatibilidade
-- ============================================================

-- Dropar tabelas EN (os dados já foram migrados)
DROP TABLE IF EXISTS bank_accounts CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS segments CASCADE;
DROP TABLE IF EXISTS units CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;

-- Criar views EN → PT para compatibilidade com código existente
CREATE OR REPLACE VIEW bank_accounts AS SELECT * FROM contas_bancarias;
CREATE OR REPLACE VIEW categories AS SELECT * FROM categorias;
CREATE OR REPLACE VIEW segments AS SELECT * FROM segmentos;
CREATE OR REPLACE VIEW units AS SELECT * FROM unidades;
CREATE OR REPLACE VIEW transactions AS SELECT * FROM lancamentos;


-- ============================================================
-- FIM DA MIGRAÇÃO 012
-- ============================================================
