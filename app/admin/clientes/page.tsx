export const dynamic = 'force-dynamic'
import pool from '@/lib/db'
import { Building2, Plus } from 'lucide-react'
import Link from 'next/link'

async function getTenants() {
  const result = await pool.query(`
    SELECT t.*,
           (SELECT COUNT(*) FROM users WHERE tenant_id = t.id) as user_count,
           (SELECT COUNT(*) FROM uploads WHERE tenant_id = t.id) as upload_count
    FROM tenants t
    WHERE t.slug != 'blumen-biz' AND t.slug != 'blumen-biz-admin'
    ORDER BY t.created_at DESC
  `)
  return result.rows
}

export default async function ClientesPage() {
  const tenants = await getTenants()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Clientes</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>Gerencie as empresas cadastradas na plataforma</p>
        </div>
        <Link href="/admin/clientes/novo" className="btn-glass btn-glass-navy" title="Cadastrar uma nova empresa cliente">
          <Plus className="w-4 h-4" />
          Novo Cliente
        </Link>
      </div>

      {tenants.length === 0 ? (
        <div className="card-glass p-12 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: 'linear-gradient(135deg, var(--navy), var(--navy-light))',
              boxShadow: '0 4px 16px rgba(29, 59, 95, 0.25)',
            }}
          >
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Nenhum cliente cadastrado</h3>
          <p className="text-sm mb-6" style={{ color: 'var(--text-tertiary)' }}>Comece adicionando o primeiro cliente da plataforma.</p>
          <Link href="/admin/clientes/novo" className="btn-glass btn-glass-navy inline-flex" title="Cadastrar o primeiro cliente">
            <Plus className="w-4 h-4" />
            Adicionar Cliente
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Empresa</th>
                <th className="text-center">Usuários</th>
                <th className="text-center">Uploads</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t: Record<string, string | number | boolean>) => (
                <tr key={String(t.id)}>
                  <td>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.email || t.slug}</p>
                  </td>
                  <td className="text-center">{t.user_count}</td>
                  <td className="text-center">{t.upload_count}</td>
                  <td className="text-center">
                    <span className={`badge ${t.is_active ? 'badge-olive' : 'badge-danger'}`}>
                      {t.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
