export const dynamic = 'force-dynamic'
import pool from '@/lib/db'
import { Building2, Users, FileUp, AlertTriangle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

async function getAdminStats() {
  const client = await pool.connect()
  try {
    const tenants = await client.query("SELECT COUNT(*) as count FROM tenants WHERE slug != 'blumen-biz' AND slug != 'blumen-biz-admin'")
    const users = await client.query("SELECT COUNT(*) as count FROM users")
    const uploads = await client.query("SELECT COUNT(*) as count FROM uploads")
    const pendingUploads = await client.query("SELECT COUNT(*) as count FROM uploads WHERE status = 'pending'")

    const recentUploads = await client.query(`
      SELECT u.id, u.original_filename, u.status, u.created_at, u.row_count,
             t.name as tenant_name, us.name as user_name
      FROM uploads u
      JOIN tenants t ON u.tenant_id = t.id
      JOIN users us ON u.user_id = us.id
      ORDER BY u.created_at DESC
      LIMIT 10
    `)

    const recentTenants = await client.query(`
      SELECT t.id, t.name, t.slug, t.is_active, t.created_at,
             (SELECT COUNT(*) FROM users WHERE tenant_id = t.id) as user_count,
             (SELECT COUNT(*) FROM uploads WHERE tenant_id = t.id) as upload_count
      FROM tenants t
      WHERE t.slug != 'blumen-biz' AND t.slug != 'blumen-biz-admin'
      ORDER BY t.created_at DESC
      LIMIT 10
    `)

    return {
      totalTenants: parseInt(tenants.rows[0].count),
      totalUsers: parseInt(users.rows[0].count),
      totalUploads: parseInt(uploads.rows[0].count),
      pendingUploads: parseInt(pendingUploads.rows[0].count),
      recentUploads: recentUploads.rows,
      recentTenants: recentTenants.rows,
    }
  } finally {
    client.release()
  }
}

export default async function AdminDashboard() {
  const stats = await getAdminStats()

  const metrics = [
    { label: 'Clientes', value: stats.totalTenants, sub: 'Empresas ativas', icon: Building2, tooltip: 'Total de empresas clientes cadastradas', href: '/admin/clientes' },
    { label: 'Usuários', value: stats.totalUsers, sub: 'Cadastrados', icon: Users, tooltip: 'Total de usuários no sistema', href: '/admin/usuarios' },
    { label: 'Uploads', value: stats.totalUploads, sub: 'Planilhas enviadas', icon: FileUp, tooltip: 'Total de planilhas enviadas', href: '/admin/uploads' },
    { label: 'Pendentes', value: stats.pendingUploads, sub: 'Aguardando processamento', icon: AlertTriangle, tooltip: 'Planilhas aguardando processamento', href: '/admin/uploads' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Painel Administrativo</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>Visão geral da plataforma Blúmen Biz</p>
      </div>

      {/* Métricas com cards vitrificados */}
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
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{m.sub}</p>
              <div className="mt-3 flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: 'var(--navy)' }}>
                Ver detalhes <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Clientes Recentes */}
        <div className="card-glass p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Clientes Recentes</h3>
            <Link href="/admin/clientes" className="btn-glass btn-glass-sm" title="Ver todos os clientes">
              Ver todos
            </Link>
          </div>
          {stats.recentTenants.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Nenhum cliente cadastrado ainda</p>
              <Link href="/admin/clientes/novo" className="btn-glass btn-glass-navy btn-glass-sm mt-4 inline-flex" title="Cadastrar novo cliente">
                <Building2 className="w-4 h-4" />
                Novo Cliente
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {stats.recentTenants.map((t: Record<string, string | number | boolean>) => (
                <div key={String(t.id)} className="flex items-center justify-between p-3 rounded-xl transition-all duration-300 hover:translate-x-1" style={{ background: 'var(--bg-tertiary)' }}>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.user_count} usuários | {t.upload_count} uploads</p>
                  </div>
                  <span className={`badge ${t.is_active ? 'badge-olive' : 'badge-danger'}`}>
                    {t.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Uploads Recentes */}
        <div className="card-glass p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Uploads Recentes</h3>
            <Link href="/admin/uploads" className="btn-glass btn-glass-sm" title="Ver todos os uploads">
              Ver todos
            </Link>
          </div>
          {stats.recentUploads.length === 0 ? (
            <div className="text-center py-8">
              <FileUp className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Nenhum upload realizado ainda</p>
            </div>
          ) : (
            <div className="space-y-2">
              {stats.recentUploads.map((u: Record<string, string | number>) => (
                <div key={String(u.id)} className="flex items-center justify-between p-3 rounded-xl transition-all duration-300 hover:translate-x-1" style={{ background: 'var(--bg-tertiary)' }}>
                  <div>
                    <p className="text-sm font-semibold truncate max-w-[200px]" style={{ color: 'var(--text-primary)' }}>{u.original_filename}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.tenant_name} | {u.user_name}</p>
                  </div>
                  <span className={`badge ${
                    u.status === 'completed' ? 'badge-olive' :
                    u.status === 'processing' ? 'badge-navy' :
                    u.status === 'error' ? 'badge-danger' :
                    'badge-warning'
                  }`}>
                    {u.status === 'completed' ? 'Processado' :
                     u.status === 'processing' ? 'Processando' :
                     u.status === 'error' ? 'Erro' : 'Pendente'}
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
