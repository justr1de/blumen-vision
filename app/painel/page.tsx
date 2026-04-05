export const dynamic = 'force-dynamic'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import pool from '@/lib/db'
import { FileUp, FileText, BarChart3, Clock, ArrowRight, Upload } from 'lucide-react'
import Link from 'next/link'

async function getClientStats(tenantId: string) {
  const client = await pool.connect()
  try {
    const uploads = await client.query(
      'SELECT COUNT(*) as count FROM uploads WHERE tenant_id = $1',
      [tenantId]
    )
    const completed = await client.query(
      "SELECT COUNT(*) as count FROM uploads WHERE tenant_id = $1 AND status = 'completed'",
      [tenantId]
    )
    const pending = await client.query(
      "SELECT COUNT(*) as count FROM uploads WHERE tenant_id = $1 AND status = 'pending'",
      [tenantId]
    )
    const rows = await client.query(
      'SELECT COALESCE(SUM(row_count), 0) as total FROM uploads WHERE tenant_id = $1',
      [tenantId]
    )

    const recentUploads = await client.query(
      `SELECT id, original_filename, status, row_count, created_at
       FROM uploads WHERE tenant_id = $1
       ORDER BY created_at DESC LIMIT 5`,
      [tenantId]
    )

    return {
      totalUploads: parseInt(uploads.rows[0].count),
      completedUploads: parseInt(completed.rows[0].count),
      pendingUploads: parseInt(pending.rows[0].count),
      totalRows: parseInt(rows.rows[0].total),
      recentUploads: recentUploads.rows,
    }
  } finally {
    client.release()
  }
}

export default async function PainelPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const stats = await getClientStats(session.tenantId)

  const metrics = [
    { label: 'Planilhas Enviadas', value: stats.totalUploads, icon: FileUp, tooltip: 'Total de planilhas que você enviou', href: '/painel/upload' },
    { label: 'Processadas', value: stats.completedUploads, icon: FileText, tooltip: 'Planilhas já processadas com sucesso', href: '/painel/dados' },
    { label: 'Pendentes', value: stats.pendingUploads, icon: Clock, tooltip: 'Planilhas aguardando processamento', href: '/painel/upload' },
    { label: 'Total de Registros', value: stats.totalRows.toLocaleString('pt-BR'), icon: BarChart3, tooltip: 'Total de registros em todas as planilhas', href: '/painel/relatorios' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Olá, {session.name.split(' ')[0]}!</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>Bem-vindo ao painel da {session.tenantName}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {metrics.map((m) => (
          <Link key={m.label} href={m.href} title={m.tooltip}>
            <div className="card-glass p-5 cursor-pointer group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{m.label}</span>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: 'linear-gradient(135deg, var(--navy), var(--navy-light))',
                    boxShadow: '0 4px 12px rgba(29, 59, 95, 0.25)',
                  }}
                >
                  <m.icon className="w-[18px] h-[18px] text-white" />
                </div>
              </div>
              <p className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{m.value}</p>
              <div className="mt-3 flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: 'var(--navy)' }}>
                Ver detalhes <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ação rápida */}
        <div className="card-glass p-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--navy), var(--navy-dark))' }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: 'var(--olive)', transform: 'translate(30%, -30%)' }} />
          <h3 className="text-lg font-semibold mb-2 text-white" style={{ fontFamily: 'var(--font-display)' }}>Enviar nova planilha</h3>
          <p className="text-sm mb-5 text-white/70">
            Faça upload da sua planilha financeira e o sistema organizará os dados automaticamente.
          </p>
          <Link
            href="/painel/upload"
            className="btn-glass btn-glass-sm inline-flex"
            title="Enviar uma nova planilha para processamento"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.08))',
              color: '#ffffff',
              borderColor: 'rgba(255,255,255,0.25)',
            }}
          >
            <Upload className="w-4 h-4" />
            Enviar Planilha
          </Link>
        </div>

        {/* Uploads recentes */}
        <div className="card-glass p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Uploads Recentes</h3>
            <Link href="/painel/dados" className="btn-glass btn-glass-sm" title="Ver todos os seus dados processados">
              Ver todos
            </Link>
          </div>
          {stats.recentUploads.length === 0 ? (
            <div className="text-center py-8">
              <FileUp className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Nenhum upload realizado ainda</p>
              <Link href="/painel/upload" className="btn-glass btn-glass-navy btn-glass-sm mt-4 inline-flex" title="Enviar sua primeira planilha">
                <FileUp className="w-4 h-4" />
                Enviar Planilha
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {stats.recentUploads.map((u: Record<string, string | number | null>) => (
                <div key={String(u.id)} className="flex items-center justify-between p-3 rounded-xl transition-all duration-300 hover:translate-x-1" style={{ background: 'var(--bg-tertiary)' }}>
                  <div>
                    <p className="text-sm font-semibold truncate max-w-[200px]" style={{ color: 'var(--text-primary)' }}>{u.original_filename}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(u.created_at as string).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <span className={`badge ${
                    u.status === 'completed' ? 'badge-olive' :
                    u.status === 'error' ? 'badge-danger' :
                    'badge-warning'
                  }`}>
                    {u.status === 'completed' ? 'Processado' : u.status === 'error' ? 'Erro' : 'Pendente'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
