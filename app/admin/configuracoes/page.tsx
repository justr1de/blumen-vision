import { Settings, Database, Shield, Server } from 'lucide-react'

export default function AdminConfiguracoesPage() {
  const configs = [
    { label: 'Banco de Dados', value: 'Cloud SQL PostgreSQL (southamerica-east1)', icon: Database, status: 'Conectado' },
    { label: 'Deploy', value: 'GCP Cloud Run (Production)', icon: Server, status: 'Ativo' },
    { label: 'Autenticação', value: 'JWT com cookies HttpOnly', icon: Shield, status: 'Ativo' },
    { label: 'Multitenancy', value: 'Isolamento por tenant_id', icon: Settings, status: 'Ativo' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Configurações</h1>
        <p className="text-[var(--text-tertiary)] text-sm mt-1">Configurações do sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {configs.map((c) => (
          <div key={c.label} className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)] p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-[var(--bg-tertiary)] rounded-xl flex items-center justify-center">
                <c.icon className="w-5 h-5 text-[var(--text-secondary)]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">{c.label}</p>
                <p className="text-xs text-[var(--text-muted)]">{c.value}</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-[var(--olive-50)] text-[var(--olive)]">{c.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
