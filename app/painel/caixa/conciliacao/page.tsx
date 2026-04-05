'use client'

import { useState } from 'react'
import Link from 'next/link'
import Tooltip from '@/components/Tooltip'
import {
  ChevronLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Download,
  RefreshCw,
  Link2,
  Unlink,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
} from 'lucide-react'

/* ─── Dados mockados ─── */

interface ConciliacaoItem {
  id: string
  data: string
  descricao_sistema: string
  descricao_banco: string
  valor_sistema: number
  valor_banco: number
  status: 'conciliado' | 'divergente' | 'pendente'
  tipo: 'credito' | 'debito'
}

const mockConciliacao: ConciliacaoItem[] = [
  { id: '1', data: '2026-04-04', descricao_sistema: 'Recebimento Cliente XYZ S.A.', descricao_banco: 'TED REC CLI XYZ SA', valor_sistema: 28000, valor_banco: 28000, status: 'conciliado', tipo: 'credito' },
  { id: '2', data: '2026-04-04', descricao_sistema: 'Pagamento Fornecedor ABC', descricao_banco: 'PAG BOL FORN ABC LTDA', valor_sistema: 12500, valor_banco: 12500, status: 'conciliado', tipo: 'debito' },
  { id: '3', data: '2026-04-03', descricao_sistema: 'Recebível Cartão Visa', descricao_banco: 'CIELO VISA CREDITO', valor_sistema: 45000, valor_banco: 44850, status: 'divergente', tipo: 'credito' },
  { id: '4', data: '2026-04-03', descricao_sistema: 'Tarifa bancária', descricao_banco: 'TAR MANUT CTA', valor_sistema: 120, valor_banco: 150, status: 'divergente', tipo: 'debito' },
  { id: '5', data: '2026-04-02', descricao_sistema: 'Pagamento Aluguel', descricao_banco: 'PAG ALUGUEL', valor_sistema: 8500, valor_banco: 8500, status: 'conciliado', tipo: 'debito' },
  { id: '6', data: '2026-04-02', descricao_sistema: '—', descricao_banco: 'DEP DINHEIRO', valor_sistema: 0, valor_banco: 2500, status: 'pendente', tipo: 'credito' },
  { id: '7', data: '2026-04-01', descricao_sistema: 'TED Cliente DEF', descricao_banco: 'TED REC DEF LTDA', valor_sistema: 18500, valor_banco: 18500, status: 'conciliado', tipo: 'credito' },
  { id: '8', data: '2026-04-01', descricao_sistema: 'Pagamento Energia', descricao_banco: '—', valor_sistema: 4200, valor_banco: 0, status: 'pendente', tipo: 'debito' },
]

/* ─── Helpers ─── */

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('pt-BR')
}

/* ─── Componente ─── */

export default function ConciliacaoPage() {
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'conciliado' | 'divergente' | 'pendente'>('todos')
  const [busca, setBusca] = useState('')

  const filtrados = mockConciliacao.filter((item) => {
    if (filtroStatus !== 'todos' && item.status !== filtroStatus) return false
    if (busca) {
      const q = busca.toLowerCase()
      return item.descricao_sistema.toLowerCase().includes(q) || item.descricao_banco.toLowerCase().includes(q)
    }
    return true
  })

  const totalConciliados = mockConciliacao.filter((i) => i.status === 'conciliado').length
  const totalDivergentes = mockConciliacao.filter((i) => i.status === 'divergente').length
  const totalPendentes = mockConciliacao.filter((i) => i.status === 'pendente').length
  const taxaConciliacao = Math.round((totalConciliados / mockConciliacao.length) * 100)

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Tooltip text="Voltar ao painel do caixa" position="right">
            <Link href="/painel/caixa" className="btn-glass btn-glass-sm">
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </Tooltip>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Conciliação Bancária
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              Comparação entre lançamentos do sistema e extrato bancário
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip text="Reprocessar conciliação automática" position="bottom">
            <button className="btn-glass btn-glass-sm flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Reprocessar
            </button>
          </Tooltip>
          <Tooltip text="Exportar relatório de conciliação" position="bottom">
            <button className="btn-glass btn-glass-sm flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </Tooltip>
        </div>
      </div>

      {/* KPIs de Conciliação */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="card-glass p-4" style={{ borderLeft: '3px solid var(--olive)' }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Taxa de Conciliação</span>
            <ShieldCheck className="w-4 h-4" style={{ color: 'var(--olive)' }} />
          </div>
          <p className="text-2xl font-extrabold" style={{ color: 'var(--olive)', fontFamily: 'var(--font-display)' }}>
            {taxaConciliacao}%
          </p>
        </div>
        <div className="card-glass p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Conciliados</span>
            <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--olive)' }} />
          </div>
          <p className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            {totalConciliados}
          </p>
        </div>
        <div className="card-glass p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Divergentes</span>
            <AlertTriangle className="w-4 h-4" style={{ color: '#f59e0b' }} />
          </div>
          <p className="text-2xl font-extrabold" style={{ color: '#f59e0b', fontFamily: 'var(--font-display)' }}>
            {totalDivergentes}
          </p>
        </div>
        <div className="card-glass p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Pendentes</span>
            <XCircle className="w-4 h-4" style={{ color: '#dc2626' }} />
          </div>
          <p className="text-2xl font-extrabold" style={{ color: '#dc2626', fontFamily: 'var(--font-display)' }}>
            {totalPendentes}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Buscar lançamento..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
          {(['todos', 'conciliado', 'divergente', 'pendente'] as const).map((status) => {
            const labels = { todos: 'Todos', conciliado: 'Conciliados', divergente: 'Divergentes', pendente: 'Pendentes' }
            const cores = { todos: 'var(--navy)', conciliado: 'var(--olive)', divergente: '#f59e0b', pendente: '#dc2626' }
            return (
              <button
                key={status}
                onClick={() => setFiltroStatus(status)}
                className="px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200"
                style={{
                  background: filtroStatus === status ? cores[status] : 'transparent',
                  color: filtroStatus === status ? '#ffffff' : 'var(--text-tertiary)',
                }}
              >
                {labels[status]}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tabela de Conciliação */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Lançamento (Sistema)</th>
              <th>Lançamento (Banco)</th>
              <th className="text-right">Valor Sistema</th>
              <th className="text-right">Valor Banco</th>
              <th className="text-right">Diferença</th>
              <th className="text-center">Status</th>
              <th className="text-center">Ação</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((item) => {
              const diff = item.valor_sistema - item.valor_banco
              return (
                <tr key={item.id}>
                  <td className="text-xs font-mono whitespace-nowrap">{formatDate(item.data)}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                        style={{
                          background: item.tipo === 'credito'
                            ? 'linear-gradient(135deg, var(--olive), var(--olive-light))'
                            : 'linear-gradient(135deg, #dc2626, #ef4444)',
                        }}
                      >
                        {item.tipo === 'credito' ? <ArrowUpRight className="w-3 h-3 text-white" /> : <ArrowDownRight className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-xs font-semibold truncate max-w-[160px]" style={{ color: 'var(--text-primary)' }}>
                        {item.descricao_sistema}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="text-xs truncate max-w-[160px] block" style={{ color: 'var(--text-secondary)' }}>
                      {item.descricao_banco}
                    </span>
                  </td>
                  <td className="text-right text-xs font-mono" style={{ color: 'var(--text-primary)' }}>
                    {item.valor_sistema > 0 ? formatCurrency(item.valor_sistema) : '—'}
                  </td>
                  <td className="text-right text-xs font-mono" style={{ color: 'var(--text-primary)' }}>
                    {item.valor_banco > 0 ? formatCurrency(item.valor_banco) : '—'}
                  </td>
                  <td className="text-right">
                    {diff !== 0 ? (
                      <span className="text-xs font-bold font-mono" style={{ color: '#dc2626' }}>
                        {formatCurrency(Math.abs(diff))}
                      </span>
                    ) : (
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                  <td className="text-center">
                    <span className={`badge ${
                      item.status === 'conciliado' ? 'badge-olive' :
                      item.status === 'divergente' ? 'badge-warning' :
                      'badge-danger'
                    }`}>
                      {item.status === 'conciliado' ? (
                        <><CheckCircle2 className="w-3 h-3 inline mr-1" />OK</>
                      ) : item.status === 'divergente' ? (
                        <><AlertTriangle className="w-3 h-3 inline mr-1" />Divergente</>
                      ) : (
                        <><XCircle className="w-3 h-3 inline mr-1" />Pendente</>
                      )}
                    </span>
                  </td>
                  <td className="text-center">
                    {item.status !== 'conciliado' && (
                      <Tooltip text={item.status === 'divergente' ? 'Conciliar manualmente' : 'Vincular lançamento'} position="top">
                        <button className="p-1.5 rounded-lg transition-colors duration-200 hover:bg-[var(--bg-hover)]">
                          {item.status === 'divergente' ? (
                            <Link2 className="w-4 h-4" style={{ color: 'var(--navy)' }} />
                          ) : (
                            <Unlink className="w-4 h-4" style={{ color: '#f59e0b' }} />
                          )}
                        </button>
                      </Tooltip>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
