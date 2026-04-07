export const dynamic = 'force-dynamic'
import pool from '@/lib/db'
import { FileUp } from 'lucide-react'

async function getUploads() {
  try {
    const result = await pool.query(`
      SELECT u.*, t.name as tenant_name, us.name as user_name
      FROM uploads u
      JOIN tenants t ON u.tenant_id = t.id
      JOIN users us ON u.user_id = us.id
      ORDER BY u.created_at DESC
    `)
    return result.rows
  } catch (err) {
    console.error('[Admin Uploads] Erro ao buscar uploads:', err instanceof Error ? err.message : err)
    return []
  }
}

export default async function AdminUploadsPage() {
  const uploads = await getUploads()

  const statusLabel: Record<string, { text: string; cls: string }> = {
    pending: { text: 'Pendente', cls: 'bg-[#fef3c7] text-[#92400e]' },
    processing: { text: 'Processando', cls: 'bg-[var(--navy-50)] text-[var(--navy)]' },
    completed: { text: 'Processado', cls: 'bg-[var(--olive-50)] text-[var(--olive)]' },
    error: { text: 'Erro', cls: 'bg-[#fee2e2] text-[#dc2626]' },
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Uploads</h1>
        <p className="text-[var(--text-tertiary)] text-sm mt-1">Todas as planilhas enviadas pelos clientes</p>
      </div>

      {uploads.length === 0 ? (
        <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)] p-12 text-center shadow-sm">
          <FileUp className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Nenhum upload realizado</h3>
          <p className="text-sm text-[var(--text-tertiary)]">Os uploads dos clientes aparecerão aqui.</p>
        </div>
      ) : (
        <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)] shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-primary)]">
                <th className="text-left text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider px-6 py-4">Arquivo</th>
                <th className="text-left text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider px-6 py-4">Cliente</th>
                <th className="text-left text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider px-6 py-4">Usuário</th>
                <th className="text-center text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider px-6 py-4">Linhas</th>
                <th className="text-center text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider px-6 py-4">Status</th>
                <th className="text-right text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider px-6 py-4">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)]">
              {uploads.map((u: Record<string, string | number | null>) => {
                const st = statusLabel[u.status as string] || statusLabel.pending
                return (
                  <tr key={String(u.id)} className="hover:bg-[var(--bg-tertiary)] transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate max-w-[250px]">{u.original_filename}</p>
                      <p className="text-xs text-[var(--text-muted)]">{u.file_type}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{u.tenant_name}</td>
                    <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{u.user_name}</td>
                    <td className="px-6 py-4 text-center text-sm text-[var(--text-secondary)]">{u.row_count ?? '—'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${st.cls}`}>{st.text}</span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-[var(--text-muted)]">
                      {new Date(u.created_at as string).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
