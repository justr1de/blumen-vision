-- ============================================================
-- MIGRAÇÃO 008: Audit Log + Configurações do Tenant
-- Banco: blumenvision (PostgreSQL / Cloud SQL)
--
-- audit_log: registra todas as ações relevantes do sistema
--   para rastreabilidade e compliance.
--
-- tenant_config: configurações específicas de cada tenant
--   (preferências de relatório, regras de negócio, etc.)
--
-- Todos os IDs são INTEGER (serial). Todos os comandos idempotentes.
-- ============================================================

-- ============================================================
-- 1. AUDIT_LOG (log de auditoria)
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id INTEGER,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_tenant ON audit_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);

-- ============================================================
-- 2. TENANT_CONFIG (configurações do tenant)
-- ============================================================

CREATE TABLE IF NOT EXISTS tenant_config (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  config_key VARCHAR(255) NOT NULL,
  config_value TEXT,
  config_type VARCHAR(50) DEFAULT 'string',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, config_key)
);

CREATE INDEX IF NOT EXISTS idx_tenant_config_tenant ON tenant_config(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_config_key ON tenant_config(config_key);

-- ============================================================
-- FIM DA MIGRAÇÃO 008
-- ============================================================
