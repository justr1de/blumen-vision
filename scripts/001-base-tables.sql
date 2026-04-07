-- ============================================================
-- MIGRAÇÃO 001: Tabelas base do Blúmen Vision
-- Banco: blumenvision (PostgreSQL / Cloud SQL)
-- 
-- CONTEXTO:
--   O banco pode já ter tabelas criadas parcialmente.
--   Todos os comandos são idempotentes (CREATE IF NOT EXISTS,
--   ALTER ADD COLUMN IF NOT EXISTS) e seguros para re-executar.
--
-- CONVENÇÕES:
--   - PKs: SERIAL (INTEGER auto-increment)
--   - FKs: INTEGER referenciando id da tabela pai
--   - Nomes de tabelas: inglês (conforme código da aplicação)
--   - Nomes de colunas: snake_case
--   - Timestamps: TIMESTAMPTZ com DEFAULT NOW()
-- ============================================================

-- Extensão para geração de UUIDs e criptografia
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1. TENANTS (empresas/clientes)
-- ============================================================
-- A tabela tenants pode já existir com colunas básicas.
-- Garantimos que todas as colunas necessárias existam.

CREATE TABLE IF NOT EXISTS tenants (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT gen_random_uuid(),
  name VARCHAR(500) NOT NULL,
  nome VARCHAR(500),
  slug VARCHAR(255) UNIQUE,
  email VARCHAR(255),
  cnpj VARCHAR(18),
  phone VARCHAR(20),
  plano VARCHAR(50) DEFAULT 'basic',
  status VARCHAR(50) DEFAULT 'active',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Colunas que podem estar faltando (adicionadas pela migração de expansão)
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS uuid UUID DEFAULT gen_random_uuid();
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS name VARCHAR(500);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS nome VARCHAR(500);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS cnpj VARCHAR(18);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS plano VARCHAR(50);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS status VARCHAR(50);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Índices
CREATE UNIQUE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_cnpj ON tenants(cnpj);
CREATE INDEX IF NOT EXISTS idx_tenants_email ON tenants(email);

-- ============================================================
-- 2. USERS (usuários do sistema)
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT gen_random_uuid(),
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  login_method VARCHAR(50) DEFAULT 'credentials',
  role VARCHAR(50) DEFAULT 'user',
  status VARCHAR(50) DEFAULT 'active',
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Colunas que podem estar faltando
ALTER TABLE users ADD COLUMN IF NOT EXISTS uuid UUID DEFAULT gen_random_uuid();
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_method VARCHAR(50) DEFAULT 'credentials';
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Índices
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================================
-- 3. UPLOADS (arquivos enviados)
-- ============================================================
-- Colunas reais usadas pela API:
--   id, tenant_id, user_id, filename, file_url, file_key,
--   mime_type, size, status, resultado (jsonb), created_at, updated_at

CREATE TABLE IF NOT EXISTS uploads (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  filename VARCHAR(500) NOT NULL,
  file_url TEXT,
  file_key TEXT,
  mime_type VARCHAR(100),
  size BIGINT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  resultado JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Colunas que podem estar faltando
ALTER TABLE uploads ADD COLUMN IF NOT EXISTS filename VARCHAR(500);
ALTER TABLE uploads ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE uploads ADD COLUMN IF NOT EXISTS file_key TEXT;
ALTER TABLE uploads ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100);
ALTER TABLE uploads ADD COLUMN IF NOT EXISTS size BIGINT DEFAULT 0;
ALTER TABLE uploads ADD COLUMN IF NOT EXISTS resultado JSONB;
ALTER TABLE uploads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Índices
CREATE INDEX IF NOT EXISTS idx_uploads_tenant ON uploads(tenant_id);
CREATE INDEX IF NOT EXISTS idx_uploads_user ON uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_uploads_status ON uploads(status);

-- ============================================================
-- 4. SESSIONS (sessões de autenticação — opcional, JWT-based)
-- ============================================================

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);

-- ============================================================
-- FIM DA MIGRAÇÃO 001
-- ============================================================
