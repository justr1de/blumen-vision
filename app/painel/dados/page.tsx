'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { FileText, AlertTriangle, Database, Loader2 } from 'lucide-react'

// Tipos
interface UploadRow {
  id: number
  filename: string
  mime_type: string
  size: number
  resultado: { row_count?: number; source?: string } | null
  created_at: string
}

interface DataRow {
  id: number
  row_number: number
  cpf: string | null
  nome_cliente: string | null
  contrato: string | null
  produto: string | null
  status_operacao: string | null
  valor_principal: number | null
  valor_parcela: number | null
  data_operacao: string | null
  data_pagamento: string | null
  filename: string
}

function formatCurrency(v: number | null): string {
  if (v == null) return '—'
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function maskCpf(cpf: string | null): string {
  if (!cpf) return '—'
  const clean = cpf.replace(/\D/g, '')
  if (clean.length === 11) {
    return `***${clean.substring(3, 6)}.${clean.substring(6, 9)}-**`
  }
  return cpf
}

export default function DadosPage() {
  const [uploads, setUploads] = useState<UploadRow[]>([])
  const [data, setData] = useState<DataRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/dados')
      .then(r => r.json())
      .then(res => {
        setUploads(res.uploads || [])
        setData(res.data || [])
        setError(res.error || null)
      })
      .catch(() => setError('Erro ao carregar dados'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--olive)]" />
      </div>
    )
  }

  if (error === 'tables_missing') {
    return (
      <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)] p-12 text-center shadow-sm">
        <Database className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Módulo em configuração</h3>
        <p className="text-sm text-[var(--text-tertiary)]">
          A tabela de dados processados está sendo configurada. Em breve seus dados estarão disponíveis aqui.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Meus Dados</h1>
        <p className="text-[var(--text-tertiary)] text-sm mt-1">Dados extraídos das planilhas e documentos enviados</p>
      </div>

      {/* Resumo de uploads */}
      {uploads.length > 0 && (
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {uploads.slice(0, 4).map((u) => (
            <div key={u.id} className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[var(--olive)]" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">{u.filename}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {u.resultado?.row_count ?? 0} registros · {new Date(u.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabela de dados */}
      {data.length === 0 ? (
        <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)] p-12 text-center shadow-sm">
          <AlertTriangle className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Nenhum dado encontrado</h3>
          <p className="text-sm text-[var(--text-tertiary)]">
            Faça upload de planilhas ou documentos na seção Upload para visualizar os dados aqui.
          </p>
        </div>
      ) : (
        <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-primary)]">
                  <th className="text-left text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider px-4 py-3">#</th>
                  <th className="text-left text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider px-4 py-3">CPF</th>
                  <th className="text-left text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider px-4 py-3">Cliente</th>
                  <th className="text-left text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider px-4 py-3">Contrato</th>
                  <th className="text-left text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider px-4 py-3">Produto</th>
                  <th className="text-left text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider px-4 py-3">Valor Principal</th>
                  <th className="text-right text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider px-4 py-3">Parcela</th>
                  <th className="text-left text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider px-4 py-3">Arquivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-primary)]">
                {data.map((row) => (
                  <tr key={row.id} className="hover:bg-[var(--bg-tertiary)] transition-colors">
                    <td className="px-4 py-3 text-sm text-[var(--text-muted)]">{row.row_number}</td>
                    <td className="px-4 py-3 text-sm font-mono text-[var(--text-secondary)]">{maskCpf(row.cpf)}</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-primary)]">{row.nome_cliente || '—'}</td>
                    <td className="px-4 py-3 text-sm font-mono text-[var(--text-secondary)]">{row.contrato || '—'}</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{row.produto || '—'}</td>
                    <td className="px-4 py-3">
                      {row.status_operacao ? (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[var(--olive-50)] text-[var(--olive)]">
                          {row.status_operacao}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-[var(--text-primary)]">{formatCurrency(row.valor_principal)}</td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-[var(--text-secondary)]">{formatCurrency(row.valor_parcela)}</td>
                    <td className="px-4 py-3 text-xs text-[var(--text-muted)] truncate max-w-[150px]">{row.filename}</td>
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
