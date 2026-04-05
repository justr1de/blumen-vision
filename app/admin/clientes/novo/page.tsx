'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Building2, UserPlus } from 'lucide-react'
import Link from 'next/link'

export default function NovoClientePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = new FormData(e.currentTarget)
    const data = {
      name: form.get('name'),
      email: form.get('email'),
      cnpj: form.get('cnpj'),
      phone: form.get('phone'),
      userName: form.get('userName'),
      userEmail: form.get('userEmail'),
      userPassword: form.get('userPassword'),
    }

    try {
      const res = await fetch('/api/admin/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error || 'Erro ao criar cliente')
        setLoading(false)
        return
      }
      router.push('/admin/clientes')
    } catch {
      setError('Erro de conexão')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/clientes"
        className="btn-glass btn-glass-sm inline-flex mb-6"
        title="Voltar para a lista de clientes"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para Clientes
      </Link>

      <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--text-primary)' }}>Novo Cliente</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--text-tertiary)' }}>Cadastre uma nova empresa e seu primeiro usuário</p>

      {error && (
        <div className="mb-6 p-3 rounded-lg text-sm font-semibold" style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.15)' }}>{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card-glass p-6">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, var(--navy), var(--navy-light))',
                boxShadow: '0 4px 12px rgba(29, 59, 95, 0.25)',
              }}
            >
              <Building2 className="w-[18px] h-[18px] text-white" />
            </div>
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Dados da Empresa</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Nome da Empresa *</label>
              <input name="name" required className="input" title="Nome completo da empresa cliente" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>CNPJ</label>
              <input name="cnpj" className="input" title="CNPJ da empresa (opcional)" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Telefone</label>
              <input name="phone" className="input" title="Telefone de contato da empresa" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>E-mail da Empresa</label>
              <input name="email" type="email" className="input" title="E-mail corporativo da empresa" />
            </div>
          </div>
        </div>

        <div className="card-glass p-6">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, var(--olive), var(--olive-light))',
                boxShadow: '0 4px 12px rgba(111, 150, 62, 0.25)',
              }}
            >
              <UserPlus className="w-[18px] h-[18px] text-white" />
            </div>
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Primeiro Usuário</h3>
          </div>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
            Este usuário será vinculado automaticamente à empresa acima.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Nome Completo *</label>
              <input name="userName" required className="input" title="Nome completo do primeiro usuário" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>E-mail de Acesso *</label>
              <input name="userEmail" type="email" required className="input" title="E-mail que será usado para login" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Senha Inicial *</label>
              <input name="userPassword" type="password" required minLength={6} className="input" title="Senha inicial (mínimo 6 caracteres)" />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-glass btn-glass-navy btn-glass-lg disabled:opacity-50"
          title="Salvar e cadastrar o novo cliente"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Salvando...
            </span>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Cadastrar Cliente
            </>
          )}
        </button>
      </form>
    </div>
  )
}
