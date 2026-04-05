'use client'

import { useEffect, useState, useCallback } from 'react'
import { Users, Pencil, Trash2, UserX, UserCheck, Plus, X, Save, Building2, Shield, Eye, EyeOff } from 'lucide-react'

interface User {
  id: number
  name: string
  email: string
  role: string
  is_active: boolean
  last_login: string | null
  created_at: string
  tenant_id: number
  tenant_name: string
  tenant_slug: string
}

interface Tenant {
  id: number
  name: string
  slug: string
}

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<User | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  // Form state para edição
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formRole, setFormRole] = useState('client')
  const [formTenantId, setFormTenantId] = useState<number | ''>('')
  const [formPassword, setFormPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [usersRes, tenantsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/tenants'),
      ])
      const usersData = await usersRes.json()
      const tenantsData = await tenantsRes.json()
      setUsers(usersData.users || [])
      setTenants(tenantsData.tenants || [])
    } catch {
      setError('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  function clearMessages() {
    setError('')
    setSuccess('')
  }

  function openEdit(user: User) {
    clearMessages()
    setEditingUser(user)
    setFormName(user.name)
    setFormEmail(user.email)
    setFormRole(user.role)
    setFormTenantId(user.tenant_id)
    setFormPassword('')
    setShowPassword(false)
  }

  function openCreate() {
    clearMessages()
    setShowCreateModal(true)
    setFormName('')
    setFormEmail('')
    setFormRole('client')
    setFormTenantId('')
    setFormPassword('')
    setShowPassword(false)
  }

  function closeModals() {
    setEditingUser(null)
    setShowCreateModal(false)
    setShowDeleteConfirm(null)
    clearMessages()
  }

  async function handleSaveEdit() {
    if (!editingUser) return
    clearMessages()
    setSaving(true)

    try {
      const body: Record<string, unknown> = {
        id: editingUser.id,
        name: formName,
        email: formEmail,
        role: formRole,
        tenantId: formTenantId,
      }
      if (formPassword) {
        body.password = formPassword
      }

      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao salvar')
        return
      }

      setSuccess('Usuário atualizado com sucesso')
      await fetchData()
      setTimeout(() => closeModals(), 1000)
    } catch {
      setError('Erro de conexão')
    } finally {
      setSaving(false)
    }
  }

  async function handleCreate() {
    clearMessages()
    if (!formName || !formEmail || !formPassword || !formTenantId) {
      setError('Preencha todos os campos obrigatórios')
      return
    }
    setSaving(true)

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          password: formPassword,
          role: formRole,
          tenantId: formTenantId,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao criar usuário')
        return
      }

      setSuccess('Usuário criado com sucesso')
      await fetchData()
      setTimeout(() => closeModals(), 1000)
    } catch {
      setError('Erro de conexão')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(user: User) {
    clearMessages()
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, isActive: !user.is_active }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Erro ao alterar status')
        return
      }

      setSuccess(`Usuário ${user.is_active ? 'inativado' : 'reativado'} com sucesso`)
      await fetchData()
      setTimeout(() => clearMessages(), 3000)
    } catch {
      setError('Erro de conexão')
    }
  }

  async function handleDelete() {
    if (!showDeleteConfirm) return
    clearMessages()
    setSaving(true)

    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: showDeleteConfirm.id }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao excluir')
        return
      }

      setSuccess('Usuário excluído permanentemente')
      await fetchData()
      setTimeout(() => closeModals(), 1000)
    } catch {
      setError('Erro de conexão')
    } finally {
      setSaving(false)
    }
  }

  const roleLabel: Record<string, { text: string; cls: string }> = {
    admin: { text: 'Admin', cls: 'badge-navy' },
    manager: { text: 'Gestor', cls: 'badge-navy' },
    client: { text: 'Cliente', cls: 'badge-olive' },
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--navy)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Usuários</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>Gerencie todos os usuários cadastrados na plataforma</p>
        </div>
        <button onClick={openCreate} className="btn-glass btn-glass-navy" title="Criar um novo usuário">
          <Plus className="w-4 h-4" />
          Novo Usuário
        </button>
      </div>

      {/* Mensagens globais */}
      {error && !editingUser && !showCreateModal && (
        <div className="mb-4 p-3 rounded-xl text-sm font-medium" style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#dc2626', border: '1px solid rgba(220, 38, 38, 0.2)' }}>
          {error}
        </div>
      )}
      {success && !editingUser && !showCreateModal && (
        <div className="mb-4 p-3 rounded-xl text-sm font-medium" style={{ background: 'rgba(111, 150, 62, 0.1)', color: 'var(--olive)', border: '1px solid rgba(111, 150, 62, 0.2)' }}>
          {success}
        </div>
      )}

      {/* Tabela de Usuários */}
      {users.length === 0 ? (
        <div className="card-glass p-12 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, var(--navy), var(--navy-light))', boxShadow: '0 4px 16px rgba(29, 59, 95, 0.25)' }}
          >
            <Users className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Nenhum usuário cadastrado</h3>
          <p className="text-sm mb-6" style={{ color: 'var(--text-tertiary)' }}>Comece adicionando o primeiro usuário.</p>
          <button onClick={openCreate} className="btn-glass btn-glass-navy inline-flex" title="Criar o primeiro usuário">
            <Plus className="w-4 h-4" />
            Novo Usuário
          </button>
        </div>
      ) : (
        <div className="card-glass overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                <th className="text-left text-xs font-bold uppercase tracking-wider px-6 py-4" style={{ color: 'var(--text-tertiary)' }}>Usuário</th>
                <th className="text-left text-xs font-bold uppercase tracking-wider px-6 py-4" style={{ color: 'var(--text-tertiary)' }}>Empresa</th>
                <th className="text-center text-xs font-bold uppercase tracking-wider px-6 py-4" style={{ color: 'var(--text-tertiary)' }}>Perfil</th>
                <th className="text-center text-xs font-bold uppercase tracking-wider px-6 py-4" style={{ color: 'var(--text-tertiary)' }}>Status</th>
                <th className="text-center text-xs font-bold uppercase tracking-wider px-6 py-4" style={{ color: 'var(--text-tertiary)' }}>Último Acesso</th>
                <th className="text-center text-xs font-bold uppercase tracking-wider px-6 py-4" style={{ color: 'var(--text-tertiary)' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const rl = roleLabel[u.role] || roleLabel.client
                return (
                  <tr key={u.id} className="transition-colors hover:brightness-110" style={{ borderBottom: '1px solid var(--border-primary)' }}>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{u.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{u.tenant_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`badge ${rl.cls}`}>{rl.text}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`badge ${u.is_active ? 'badge-olive' : 'badge-danger'}`}>
                        {u.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                      {u.last_login ? new Date(u.last_login).toLocaleDateString('pt-BR') : 'Nunca'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(u)}
                          className="btn-glass btn-glass-sm"
                          title="Editar informações do usuário"
                          style={{ padding: '6px 10px' }}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(u)}
                          className={`btn-glass btn-glass-sm ${u.is_active ? '' : 'btn-glass-olive'}`}
                          title={u.is_active ? 'Inativar usuário' : 'Reativar usuário'}
                          style={{ padding: '6px 10px' }}
                        >
                          {u.is_active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => { clearMessages(); setShowDeleteConfirm(u) }}
                          className="btn-glass btn-glass-danger btn-glass-sm"
                          title="Excluir usuário permanentemente"
                          style={{ padding: '6px 10px' }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Edição */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="card-glass w-full max-w-lg mx-4 p-6" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, var(--navy), var(--navy-light))' }}
                >
                  <Pencil className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Editar Usuário</h2>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>ID: {editingUser.id}</p>
                </div>
              </div>
              <button onClick={closeModals} className="btn-glass btn-glass-sm" title="Fechar" style={{ padding: '6px' }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl text-sm font-medium" style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#dc2626', border: '1px solid rgba(220, 38, 38, 0.2)' }}>
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 rounded-xl text-sm font-medium" style={{ background: 'rgba(111, 150, 62, 0.1)', color: 'var(--olive)', border: '1px solid rgba(111, 150, 62, 0.2)' }}>
                {success}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-tertiary)' }}>Nome</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="form-input"
                  title="Nome completo do usuário"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-tertiary)' }}>E-mail</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="form-input"
                  title="Endereço de e-mail do usuário"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    Empresa (Tenant)
                  </div>
                </label>
                <select
                  value={formTenantId}
                  onChange={(e) => setFormTenantId(Number(e.target.value))}
                  className="form-input"
                  title="Empresa à qual o usuário está vinculado"
                >
                  <option value="">Selecione a empresa</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    Perfil de Acesso
                  </div>
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="form-input"
                  title="Nível de permissão do usuário"
                >
                  <option value="client">Cliente</option>
                  <option value="manager">Gestor</option>
                  <option value="admin">Administrador</option>
                </select>
                {formEmail.toLowerCase().endsWith('@dataro-it.com.br') && (
                  <p className="text-xs mt-1" style={{ color: 'var(--olive)' }}>
                    E-mails @dataro-it.com.br são automaticamente Administradores
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
                  Nova Senha (opcional)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="form-input pr-10"
                    placeholder="Deixe em branco para manter a atual"
                    title="Nova senha (deixe em branco para manter a senha atual)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-muted)' }}
                    title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={closeModals} className="btn-glass flex-1" title="Cancelar edição">
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="btn-glass btn-glass-navy flex-1"
                title="Salvar alterações do usuário"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criação */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="card-glass w-full max-w-lg mx-4 p-6" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, var(--olive), var(--olive-light))' }}
                >
                  <Plus className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Novo Usuário</h2>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Criar usuário vinculado a uma empresa</p>
                </div>
              </div>
              <button onClick={closeModals} className="btn-glass btn-glass-sm" title="Fechar" style={{ padding: '6px' }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl text-sm font-medium" style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#dc2626', border: '1px solid rgba(220, 38, 38, 0.2)' }}>
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 rounded-xl text-sm font-medium" style={{ background: 'rgba(111, 150, 62, 0.1)', color: 'var(--olive)', border: '1px solid rgba(111, 150, 62, 0.2)' }}>
                {success}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    Empresa (Tenant) *
                  </div>
                </label>
                <select
                  value={formTenantId}
                  onChange={(e) => setFormTenantId(Number(e.target.value))}
                  className="form-input"
                  title="Empresa à qual o usuário será vinculado"
                >
                  <option value="">Selecione a empresa</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-tertiary)' }}>Nome *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="form-input"
                  placeholder="Nome completo"
                  title="Nome completo do novo usuário"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-tertiary)' }}>E-mail *</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="form-input"
                  placeholder="usuario@empresa.com.br"
                  title="Endereço de e-mail do novo usuário"
                />
                {formEmail.toLowerCase().endsWith('@dataro-it.com.br') && (
                  <p className="text-xs mt-1" style={{ color: 'var(--olive)' }}>
                    E-mails @dataro-it.com.br são automaticamente Administradores
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-tertiary)' }}>Senha *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="form-input pr-10"
                    placeholder="Senha de acesso"
                    title="Senha de acesso do novo usuário"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-muted)' }}
                    title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    Perfil de Acesso
                  </div>
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="form-input"
                  title="Nível de permissão do novo usuário"
                >
                  <option value="client">Cliente</option>
                  <option value="manager">Gestor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={closeModals} className="btn-glass flex-1" title="Cancelar criação">
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={saving}
                className="btn-glass btn-glass-olive flex-1"
                title="Criar o novo usuário"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {saving ? 'Criando...' : 'Criar Usuário'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="card-glass w-full max-w-md mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}
              >
                <Trash2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Excluir Usuário</h2>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Esta ação é irreversível</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl text-sm font-medium" style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#dc2626', border: '1px solid rgba(220, 38, 38, 0.2)' }}>
                {error}
              </div>
            )}

            <div className="p-4 rounded-xl mb-4" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{showDeleteConfirm.name}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{showDeleteConfirm.email}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Empresa: {showDeleteConfirm.tenant_name}</p>
            </div>

            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              Tem certeza que deseja excluir permanentemente este usuário? Todos os dados associados (sessões, uploads) também serão removidos.
            </p>

            <div className="flex gap-3">
              <button onClick={closeModals} className="btn-glass flex-1" title="Cancelar exclusão">
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="btn-glass btn-glass-danger flex-1"
                title="Confirmar exclusão permanente"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {saving ? 'Excluindo...' : 'Excluir Permanentemente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
