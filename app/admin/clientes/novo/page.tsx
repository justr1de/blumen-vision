'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Building2, UserPlus, MapPin, Plus, Trash2, GitBranch } from 'lucide-react'
import Link from 'next/link'

interface Filial {
  razao_social: string
  nome_fantasia: string
  cnpj: string
  responsavel: string
  email: string
  phone: string
  endereco_logradouro: string
  endereco_numero: string
  endereco_complemento: string
  endereco_bairro: string
  endereco_cidade: string
  endereco_uf: string
  endereco_cep: string
}

const emptyFilial: Filial = {
  razao_social: '',
  nome_fantasia: '',
  cnpj: '',
  responsavel: '',
  email: '',
  phone: '',
  endereco_logradouro: '',
  endereco_numero: '',
  endereco_complemento: '',
  endereco_bairro: '',
  endereco_cidade: '',
  endereco_uf: '',
  endereco_cep: '',
}

const UF_OPTIONS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA',
  'PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
]

function formatCNPJ(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14)
  if (digits.length <= 2) return digits
  if (digits.length <= 5) return `${digits.slice(0,2)}.${digits.slice(2)}`
  if (digits.length <= 8) return `${digits.slice(0,2)}.${digits.slice(2,5)}.${digits.slice(5)}`
  if (digits.length <= 12) return `${digits.slice(0,2)}.${digits.slice(2,5)}.${digits.slice(5,8)}/${digits.slice(8)}`
  return `${digits.slice(0,2)}.${digits.slice(2,5)}.${digits.slice(5,8)}/${digits.slice(8,12)}-${digits.slice(12)}`
}

function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0,3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6)}`
  return `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6,9)}-${digits.slice(9)}`
}

function formatCEP(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 5) return digits
  return `${digits.slice(0,5)}-${digits.slice(5)}`
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0,2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`
  return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`
}

export default function NovoClientePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [hasFiliais, setHasFiliais] = useState(false)
  const [filiais, setFiliais] = useState<Filial[]>([])

  // Formatação de campos
  const [cnpj, setCnpj] = useState('')
  const [cpf, setCpf] = useState('')
  const [cep, setCep] = useState('')
  const [phone, setPhone] = useState('')

  function addFilial() {
    setFiliais([...filiais, { ...emptyFilial }])
  }

  function removeFilial(index: number) {
    setFiliais(filiais.filter((_, i) => i !== index))
  }

  function updateFilial(index: number, field: keyof Filial, value: string) {
    const updated = [...filiais]
    updated[index] = { ...updated[index], [field]: value }
    setFiliais(updated)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = new FormData(e.currentTarget)
    const data = {
      name: form.get('name'),
      razao_social: form.get('razao_social'),
      nome_fantasia: form.get('nome_fantasia'),
      cnpj: form.get('cnpj'),
      proprietario: form.get('proprietario'),
      proprietario_cpf: form.get('proprietario_cpf'),
      email: form.get('email'),
      phone: form.get('phone'),
      endereco_logradouro: form.get('endereco_logradouro'),
      endereco_numero: form.get('endereco_numero'),
      endereco_complemento: form.get('endereco_complemento'),
      endereco_bairro: form.get('endereco_bairro'),
      endereco_cidade: form.get('endereco_cidade'),
      endereco_uf: form.get('endereco_uf'),
      endereco_cep: form.get('endereco_cep'),
      observacoes: form.get('observacoes'),
      has_filiais: hasFiliais,
      filiais: hasFiliais ? filiais : [],
      // Primeiro usuário
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
      setSuccess(true)
      setTimeout(() => router.push('/admin/clientes'), 1500)
    } catch {
      setError('Erro de conexão')
      setLoading(false)
    }
  }

  const inputClass = "input"
  const labelClass = "block text-xs font-bold mb-1.5"

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/clientes"
        className="btn-glass btn-glass-sm inline-flex mb-6"
        title="Voltar para a lista de clientes"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para Clientes
      </Link>

      <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--text-primary)' }}>
        Cadastro de Empresa
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--text-tertiary)' }}>
        Cadastre uma nova empresa (tenant) com todos os dados e seu primeiro usuário
      </p>

      {error && (
        <div className="mb-6 p-3 rounded-lg text-sm font-semibold" style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.15)' }}>
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-3 rounded-lg text-sm font-semibold" style={{ background: 'rgba(111,150,62,0.08)', color: '#6F963E', border: '1px solid rgba(111,150,62,0.15)' }}>
          Empresa cadastrada com sucesso! Redirecionando...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* === DADOS DA EMPRESA === */}
        <div className="card-glass p-6">
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, var(--navy), var(--navy-light))',
                boxShadow: '0 4px 12px rgba(29, 59, 95, 0.25)',
              }}
            >
              <Building2 className="w-[18px] h-[18px] text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Dados da Empresa</h3>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Informações jurídicas e de identificação</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>Razão Social *</label>
              <input name="razao_social" required className={inputClass} placeholder="Ex: Arnuti Consultoria Contábil LTDA" title="Razão social da empresa" />
            </div>
            <div>
              <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>Nome Fantasia</label>
              <input name="nome_fantasia" className={inputClass} placeholder="Ex: Arnuti Contabilidade" title="Nome fantasia da empresa" />
            </div>
            <div>
              <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>Nome de Exibição *</label>
              <input name="name" required className={inputClass} placeholder="Nome que aparecerá no sistema" title="Nome que será exibido no sistema" />
            </div>
            <div>
              <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>CNPJ *</label>
              <input
                name="cnpj"
                required
                className={inputClass}
                placeholder="00.000.000/0000-00"
                title="CNPJ da empresa"
                value={cnpj}
                onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
              />
            </div>
            <div>
              <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>Proprietário / Responsável *</label>
              <input name="proprietario" required className={inputClass} placeholder="Nome completo" title="Nome do proprietário ou responsável legal" />
            </div>
            <div>
              <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>CPF do Proprietário</label>
              <input
                name="proprietario_cpf"
                className={inputClass}
                placeholder="000.000.000-00"
                title="CPF do proprietário"
                value={cpf}
                onChange={(e) => setCpf(formatCPF(e.target.value))}
              />
            </div>
            <div>
              <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>E-mail da Empresa *</label>
              <input name="email" type="email" required className={inputClass} placeholder="contato@empresa.com.br" title="E-mail corporativo principal" />
            </div>
            <div>
              <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>Telefone</label>
              <input
                name="phone"
                className={inputClass}
                placeholder="(00) 00000-0000"
                title="Telefone de contato"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* === ENDEREÇO === */}
        <div className="card-glass p-6">
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #4A6FA5, #6B8FBB)',
                boxShadow: '0 4px 12px rgba(74, 111, 165, 0.25)',
              }}
            >
              <MapPin className="w-[18px] h-[18px] text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Endereço</h3>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Endereço da sede principal</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>Logradouro</label>
              <input name="endereco_logradouro" className={inputClass} placeholder="Rua, Avenida, etc." title="Logradouro" />
            </div>
            <div>
              <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>Número</label>
              <input name="endereco_numero" className={inputClass} placeholder="Nº" title="Número" />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>Complemento</label>
              <input name="endereco_complemento" className={inputClass} placeholder="Sala, Andar, etc." title="Complemento" />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>Bairro</label>
              <input name="endereco_bairro" className={inputClass} placeholder="Bairro" title="Bairro" />
            </div>
            <div>
              <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>Cidade</label>
              <input name="endereco_cidade" className={inputClass} placeholder="Cidade" title="Cidade" />
            </div>
            <div>
              <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>UF</label>
              <select name="endereco_uf" className={inputClass} title="Estado">
                <option value="">Selecione</option>
                {UF_OPTIONS.map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>CEP</label>
              <input
                name="endereco_cep"
                className={inputClass}
                placeholder="00000-000"
                title="CEP"
                value={cep}
                onChange={(e) => setCep(formatCEP(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* === FILIAIS === */}
        <div className="card-glass p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #8B6914, #A88A3D)',
                  boxShadow: '0 4px 12px rgba(139, 105, 20, 0.25)',
                }}
              >
                <GitBranch className="w-[18px] h-[18px] text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Filiais</h3>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>A empresa possui filiais?</p>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                {hasFiliais ? 'Sim' : 'Não'}
              </span>
              <div
                className="relative w-10 h-5 rounded-full transition-colors duration-300 cursor-pointer"
                style={{
                  background: hasFiliais ? 'var(--olive)' : 'var(--border-secondary)',
                }}
                onClick={() => {
                  setHasFiliais(!hasFiliais)
                  if (!hasFiliais && filiais.length === 0) {
                    setFiliais([{ ...emptyFilial }])
                  }
                }}
              >
                <div
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300"
                  style={{
                    transform: hasFiliais ? 'translateX(22px)' : 'translateX(2px)',
                  }}
                />
              </div>
            </label>
          </div>

          {hasFiliais && (
            <div className="space-y-6">
              {filiais.map((filial, idx) => (
                <div
                  key={idx}
                  className="rounded-xl p-5 relative"
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-primary)',
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      Filial {idx + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => removeFilial(idx)}
                      className="p-1.5 rounded-lg transition-colors duration-200 hover:bg-red-500/10"
                      title="Remover esta filial"
                    >
                      <Trash2 className="w-4 h-4" style={{ color: '#dc2626' }} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>Razão Social *</label>
                      <input
                        required
                        className={inputClass}
                        value={filial.razao_social}
                        onChange={(e) => updateFilial(idx, 'razao_social', e.target.value)}
                        placeholder="Razão social da filial"
                        title="Razão social da filial"
                      />
                    </div>
                    <div>
                      <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>Nome Fantasia</label>
                      <input
                        className={inputClass}
                        value={filial.nome_fantasia}
                        onChange={(e) => updateFilial(idx, 'nome_fantasia', e.target.value)}
                        placeholder="Nome fantasia"
                        title="Nome fantasia da filial"
                      />
                    </div>
                    <div>
                      <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>CNPJ</label>
                      <input
                        className={inputClass}
                        value={filial.cnpj}
                        onChange={(e) => updateFilial(idx, 'cnpj', formatCNPJ(e.target.value))}
                        placeholder="00.000.000/0000-00"
                        title="CNPJ da filial"
                      />
                    </div>
                    <div>
                      <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>Responsável</label>
                      <input
                        className={inputClass}
                        value={filial.responsavel}
                        onChange={(e) => updateFilial(idx, 'responsavel', e.target.value)}
                        placeholder="Nome do responsável"
                        title="Responsável pela filial"
                      />
                    </div>
                    <div>
                      <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>E-mail</label>
                      <input
                        type="email"
                        className={inputClass}
                        value={filial.email}
                        onChange={(e) => updateFilial(idx, 'email', e.target.value)}
                        placeholder="email@filial.com"
                        title="E-mail da filial"
                      />
                    </div>
                    <div>
                      <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>Telefone</label>
                      <input
                        className={inputClass}
                        value={filial.phone}
                        onChange={(e) => updateFilial(idx, 'phone', formatPhone(e.target.value))}
                        placeholder="(00) 00000-0000"
                        title="Telefone da filial"
                      />
                    </div>

                    {/* Endereço da filial */}
                    <div className="md:col-span-2 mt-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                        Endereço da Filial
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>Logradouro</label>
                      <input
                        className={inputClass}
                        value={filial.endereco_logradouro}
                        onChange={(e) => updateFilial(idx, 'endereco_logradouro', e.target.value)}
                        placeholder="Rua, Avenida, etc."
                        title="Logradouro da filial"
                      />
                    </div>
                    <div>
                      <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>Número</label>
                      <input
                        className={inputClass}
                        value={filial.endereco_numero}
                        onChange={(e) => updateFilial(idx, 'endereco_numero', e.target.value)}
                        placeholder="Nº"
                        title="Número"
                      />
                    </div>
                    <div>
                      <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>Bairro</label>
                      <input
                        className={inputClass}
                        value={filial.endereco_bairro}
                        onChange={(e) => updateFilial(idx, 'endereco_bairro', e.target.value)}
                        placeholder="Bairro"
                        title="Bairro"
                      />
                    </div>
                    <div>
                      <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>Cidade</label>
                      <input
                        className={inputClass}
                        value={filial.endereco_cidade}
                        onChange={(e) => updateFilial(idx, 'endereco_cidade', e.target.value)}
                        placeholder="Cidade"
                        title="Cidade"
                      />
                    </div>
                    <div>
                      <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>UF</label>
                      <select
                        className={inputClass}
                        value={filial.endereco_uf}
                        onChange={(e) => updateFilial(idx, 'endereco_uf', e.target.value)}
                        title="Estado"
                      >
                        <option value="">UF</option>
                        {UF_OPTIONS.map(uf => (
                          <option key={uf} value={uf}>{uf}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>CEP</label>
                      <input
                        className={inputClass}
                        value={filial.endereco_cep}
                        onChange={(e) => updateFilial(idx, 'endereco_cep', formatCEP(e.target.value))}
                        placeholder="00000-000"
                        title="CEP da filial"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addFilial}
                className="btn-glass btn-glass-sm w-full justify-center"
                title="Adicionar mais uma filial"
              >
                <Plus className="w-4 h-4" />
                Adicionar Filial
              </button>
            </div>
          )}
        </div>

        {/* === OBSERVAÇÕES === */}
        <div className="card-glass p-6">
          <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>Observações</label>
          <textarea
            name="observacoes"
            rows={3}
            className={inputClass}
            placeholder="Informações adicionais sobre a empresa..."
            title="Observações gerais sobre a empresa"
            style={{ resize: 'vertical', minHeight: '80px' }}
          />
        </div>

        {/* === PRIMEIRO USUÁRIO === */}
        <div className="card-glass p-6">
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, var(--olive), var(--olive-light))',
                boxShadow: '0 4px 12px rgba(111, 150, 62, 0.25)',
              }}
            >
              <UserPlus className="w-[18px] h-[18px] text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Primeiro Usuário</h3>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Será vinculado automaticamente à empresa como gestor</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>Nome Completo *</label>
              <input name="userName" required className={inputClass} placeholder="Nome completo do primeiro usuário" title="Nome completo do primeiro usuário" />
            </div>
            <div>
              <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>E-mail de Acesso *</label>
              <input name="userEmail" type="email" required className={inputClass} placeholder="usuario@empresa.com.br" title="E-mail que será usado para login" />
            </div>
            <div>
              <label className={labelClass} style={{ color: 'var(--text-secondary)' }}>Senha Inicial *</label>
              <input name="userPassword" type="password" required minLength={6} className={inputClass} placeholder="Mínimo 6 caracteres" title="Senha inicial (mínimo 6 caracteres)" />
            </div>
          </div>
        </div>

        {/* === BOTÃO SALVAR === */}
        <button
          type="submit"
          disabled={loading || success}
          className="btn-glass btn-glass-navy btn-glass-lg disabled:opacity-50 w-full justify-center"
          title="Salvar e cadastrar a nova empresa"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Salvando...
            </span>
          ) : success ? (
            <span className="flex items-center gap-2">
              ✓ Cadastrado com sucesso!
            </span>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Cadastrar Empresa
            </>
          )}
        </button>
      </form>
    </div>
  )
}
