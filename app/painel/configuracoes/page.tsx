import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { User, Building2, Shield } from 'lucide-react'

export default async function ClientConfigPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Configurações</h1>
        <p className="text-[var(--text-tertiary)] text-sm mt-1">Informações da sua conta</p>
      </div>

      <div className="space-y-6">
        <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)] p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-[var(--navy-50)] rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-[var(--navy)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Meu Perfil</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[var(--text-muted)]">Nome</p>
              <p className="font-medium text-[var(--text-primary)]">{session.name}</p>
            </div>
            <div>
              <p className="text-[var(--text-muted)]">E-mail</p>
              <p className="font-medium text-[var(--text-primary)]">{session.email}</p>
            </div>
            <div>
              <p className="text-[var(--text-muted)]">Perfil</p>
              <p className="font-medium text-[var(--text-primary)] capitalize">{session.role === 'manager' ? 'Gestor' : session.role}</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)] p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-[var(--navy-50)] rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[var(--navy)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Empresa</h3>
          </div>
          <div className="text-sm">
            <p className="text-[var(--text-muted)]">Nome</p>
            <p className="font-medium text-[var(--text-primary)]">{session.tenantName}</p>
          </div>
        </div>

        <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)] p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-[var(--olive-50)] rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-[var(--olive)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Segurança</h3>
          </div>
          <p className="text-sm text-[var(--text-tertiary)]">Seus dados são protegidos com criptografia SSL e isolamento por empresa conforme LGPD.</p>
        </div>
      </div>
    </div>
  )
}
