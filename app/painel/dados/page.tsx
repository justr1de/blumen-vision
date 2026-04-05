export const dynamic = 'force-dynamic'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import pool from '@/lib/db'
import { FileText } from 'lucide-react'
import { formatCurrency, maskCpf } from '@/lib/utils'

async function getData(tenantId: string) {
  const uploads = await pool.query(
    `SELECT id, original_filename, row_count, created_at
     FROM uploads WHERE tenant_id = $1 AND status = 'completed'
     ORDER BY created_at DESC`,
    [tenantId]
  )

  const data = await pool.query(
    `SELECT rd.*, u.original_filename
     FROM report_data rd
     JOIN uploads u ON rd.upload_id = u.id
     WHERE rd.tenant_id = $1
     ORDER BY u.created_at DESC, rd.row_number ASC
     LIMIT 500`,
    [tenantId]
  )

  return { uploads: uploads.rows, data: data.rows }
}

export default async function DadosPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const { uploads, data } = await getData(session.tenantId)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Meus Dados</h1>
        <p className="text-[var(--text-tertiary)] text-sm mt-1">Dados processados das suas planilhas ({data.length} registros)</p>
      </div>

      {/* Resumo de uploads */}
      {uploads.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-6">
          {uploads.map((u: Record<string, string | number>) => (
            <div key={String(u.id)} className="px-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-xs text-[var(--text-secondary)]">
              <span className="font-medium text-[var(--text-primary)]">{u.original_filename}</span>
              <span className="ml-2 text-[var(--text-muted)]">{u.row_count} registros</span>
            </div>
          ))}
        </div>
      )}

      {data.length === 0 ? (
        <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)] p-12 text-center shadow-sm">
          <FileText className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Nenhum dado disponível</h3>
          <p className="text-sm text-[var(--text-tertiary)]">Envie uma planilha para ver os dados processados aqui.</p>
        </div>
      ) : (
        <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-primary)]">
                  <th className="text-left text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider px-4 py-3">#</th>
                  <th className="text-left text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider px-4 py-3">Cliente</th>
                  <th className="text-left text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider px-4 py-3">CPF</th>
                  <th className="text-left text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider px-4 py-3">Contrato</th>
                  <th className="text-left text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider px-4 py-3">Produto</th>
                  <th className="text-right text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider px-4 py-3">Valor</th>
                  <th className="text-center text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider px-4 py-3">Arquivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-primary)]">
                {data.map((row: Record<string, string | number | boolean | null>, i: number) => (
                  <tr key={String(row.id)} className="hover:bg-[var(--bg-tertiary)] transition-colors text-sm">
                    <td className="px-4 py-3 text-[var(--text-muted)]">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-[var(--text-primary)] max-w-[200px] truncate">{row.nome_cliente || '—'}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)] font-mono text-xs">{row.cpf ? maskCpf(String(row.cpf)) : '—'}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{row.contrato || '—'}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)] max-w-[150px] truncate">{row.produto || '—'}</td>
                    <td className="px-4 py-3 text-right text-[var(--text-primary)] font-medium">
                      {row.valor_principal ? formatCurrency(Number(row.valor_principal)) : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.status_operacao ? (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[var(--bg-hover)] text-[var(--text-secondary)]">
                          {row.status_operacao}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)] text-xs max-w-[120px] truncate">{row.original_filename}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
