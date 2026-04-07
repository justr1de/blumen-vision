export const dynamic = 'force-dynamic'
import pool from '@/lib/db'
import { formatCurrency } from '@/lib/utils'

async function getGlobalStats() {
  const client = await pool.connect()
  try {
    const totalRows = await client.query('SELECT COUNT(*) as count FROM report_data')
    const totalValue = await client.query('SELECT COALESCE(SUM(valor_principal), 0) as total FROM report_data')
    const byTenant = await client.query(`
      SELECT t.name, COUNT(rd.id) as rows, COALESCE(SUM(rd.valor_principal), 0) as total
      FROM report_data rd
      JOIN tenants t ON rd.tenant_id = t.id
      GROUP BY t.name ORDER BY rows DESC
    `)
    return {
      totalRows: parseInt(totalRows.rows[0].count),
      totalValue: parseFloat(totalValue.rows[0].total),
      byTenant: byTenant.rows,
    }
  } catch (err) {
    console.error('[Admin Relatórios] Erro ao buscar stats:', err instanceof Error ? err.message : err)
    return {
      totalRows: 0,
      totalValue: 0,
      byTenant: [],
    }
  } finally {
    client.release()
  }
}

export default async function AdminRelatoriosPage() {
  const stats = await getGlobalStats()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Relatórios Globais</h1>
        <p className="text-[var(--text-tertiary)] text-sm mt-1">Visão consolidada de todos os clientes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)] p-6 shadow-sm">
          <p className="text-sm text-[var(--text-tertiary)] mb-1">Total de Registros (todos os clientes)</p>
          <p className="text-3xl font-bold text-[var(--text-primary)]">{stats.totalRows.toLocaleString('pt-BR')}</p>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)] p-6 shadow-sm">
          <p className="text-sm text-[var(--text-tertiary)] mb-1">Volume Financeiro Total</p>
          <p className="text-3xl font-bold text-[var(--text-primary)]">{formatCurrency(stats.totalValue)}</p>
        </div>
      </div>

      {stats.byTenant.length > 0 && (
        <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)] p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Volume por Cliente</h3>
          <div className="space-y-3">
            {stats.byTenant.map((t: Record<string, string | number>) => (
              <div key={String(t.name)} className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded-xl">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{t.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{t.rows} registros</p>
                </div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{formatCurrency(Number(t.total))}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
