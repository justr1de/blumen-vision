export const dynamic = 'force-dynamic'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import pool from '@/lib/db'
import { BarChart3 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

async function getReportData(tenantId: string) {
  const client = await pool.connect()
  try {
    const totalRows = await client.query(
      'SELECT COUNT(*) as count FROM report_data WHERE tenant_id = $1',
      [tenantId]
    )
    const totalValue = await client.query(
      'SELECT COALESCE(SUM(valor_principal), 0) as total FROM report_data WHERE tenant_id = $1',
      [tenantId]
    )
    const byProduct = await client.query(
      `SELECT produto, COUNT(*) as count, COALESCE(SUM(valor_principal), 0) as total
       FROM report_data WHERE tenant_id = $1 AND produto IS NOT NULL
       GROUP BY produto ORDER BY count DESC LIMIT 10`,
      [tenantId]
    )
    const byStatus = await client.query(
      `SELECT status_operacao, COUNT(*) as count
       FROM report_data WHERE tenant_id = $1 AND status_operacao IS NOT NULL
       GROUP BY status_operacao ORDER BY count DESC`,
      [tenantId]
    )
    return {
      totalRows: parseInt(totalRows.rows[0].count),
      totalValue: parseFloat(totalValue.rows[0].total),
      byProduct: byProduct.rows,
      byStatus: byStatus.rows,
    }
  } finally {
    client.release()
  }
}

export default async function RelatoriosPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const report = await getReportData(session.tenantId)

  const maxProdCount = Math.max(...report.byProduct.map((p: Record<string, number>) => Number(p.count)), 1)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Relatórios</h1>
        <p className="text-[var(--text-tertiary)] text-sm mt-1">Visão gerencial dos dados processados</p>
      </div>

      {report.totalRows === 0 ? (
        <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)] p-12 text-center shadow-sm">
          <BarChart3 className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Sem dados para relatório</h3>
          <p className="text-sm text-[var(--text-tertiary)]">Envie planilhas para gerar relatórios gerenciais.</p>
        </div>
      ) : (
        <>
          {/* Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)] p-6 shadow-sm">
              <p className="text-sm text-[var(--text-tertiary)] mb-1">Total de Registros</p>
              <p className="text-3xl font-bold text-[var(--text-primary)]">{report.totalRows.toLocaleString('pt-BR')}</p>
            </div>
            <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)] p-6 shadow-sm">
              <p className="text-sm text-[var(--text-tertiary)] mb-1">Volume Financeiro Total</p>
              <p className="text-3xl font-bold text-[var(--text-primary)]">{formatCurrency(report.totalValue)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Por Produto */}
            <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)] p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Volume por Produto</h3>
              <div className="space-y-3">
                {report.byProduct.map((p: Record<string, string | number>) => (
                  <div key={String(p.produto)}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-[var(--text-secondary)] truncate max-w-[200px]">{p.produto}</span>
                      <span className="text-sm font-medium text-[var(--text-primary)]">{formatCurrency(Number(p.total))}</span>
                    </div>
                    <div className="w-full bg-[var(--bg-hover)] rounded-full h-2">
                      <div
                        className="bg-[var(--navy-50)]0 h-2 rounded-full"
                        style={{ width: `${(Number(p.count) / maxProdCount) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{p.count} operações</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Por Status */}
            <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)] p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Distribuição por Status</h3>
              <div className="space-y-2">
                {report.byStatus.map((s: Record<string, string | number>, i: number) => {
                  const colors = ['bg-[var(--navy-50)]0', 'bg-[var(--navy-50)]0', 'bg-[#fef3c7]0', 'bg-[#fee2e2]0', 'bg-[var(--navy-50)]0', 'bg-[var(--olive-50)]0']
                  const pct = report.totalRows > 0 ? (Number(s.count) / report.totalRows * 100).toFixed(1) : '0'
                  return (
                    <div key={String(s.status_operacao)} className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded-xl">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${colors[i % colors.length]}`} />
                        <span className="text-sm text-[var(--text-secondary)]">{s.status_operacao}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-[var(--text-primary)]">{s.count}</span>
                        <span className="text-xs text-[var(--text-muted)] ml-1">({pct}%)</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
