'use client'

import { useState } from 'react'
import Link from 'next/link'
import Tooltip from '@/components/Tooltip'
import {
  Plus,
  Search,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  Calendar,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileText,
} from 'lucide-react'

/* ─── Dados mockados ─── */

interface Lancamento {
  id: string
  data: string
  descricao: string
  categoria: string
  tipo: 'entrada' | 'saida' | 'transferencia'
  valor: number
  conta: string
  status: 'efetivado' | 'agendado' | 'cancelado'
}

const mockLancamentos: Lancamento[] = [
  { id: '1', data: '2026-04-04', descricao: 'Recebimento Cliente XYZ S.A.', categoria: 'Receita Operacional', tipo: 'entrada', valor: 28000, conta: 'Banco do Brasil', status: 'efetivado' },
  { id: '2', data: '2026-04-04', descricao: 'Pagamento Fornecedor ABC Ltda', categoria: 'Fornecedores', tipo: 'saida', valor: 12500, conta: 'Itaú', status: 'efetivado' },
  { id: '3', data: '2026-04-03', descricao: 'Transferência entre contas', categoria: 'Transferência', tipo: 'transferencia', valor: 50000, conta: 'BB → Itaú', status: 'efetivado' },
  { id: '4', data: '2026-04-03', descricao: 'Recebível Cartão Visa', categoria: 'Cartões', tipo: 'entrada', valor: 45000, conta: 'Cielo', status: 'efetivado' },
  { id: '5', data: '2026-04-02', descricao: 'Aluguel Loja Centro', categoria: 'Despesas Fixas', tipo: 'saida', valor: 8500, conta: 'Itaú', status: 'efetivado' },
  { id: '6', data: '2026-04-02', descricao: 'Energia Elétrica', categoria: 'Utilidades', tipo: 'saida', valor: 4200, conta: 'Banco do Brasil', status: 'efetivado' },
  { id: '7', data: '2026-04-05', descricao: 'Parcela Financiamento', categoria: 'Financiamentos', tipo: 'saida', valor: 15200, conta: 'Caixa', status: 'agendado' },
  { id: '8', data: '2026-04-06', descricao: 'Folha de Pagamento', categoria: 'Pessoal', tipo: 'saida', valor: 67800, conta: 'Banco do Brasil', status: 'agendado' },
  { id: '9', data: '2026-04-07', descricao: 'Recebimento Cliente DEF Ltda', categoria: 'Receita Operacional', tipo: 'entrada', valor: 18500, conta: 'Itaú', status: 'agendado' },
  { id: '10', data: '2026-04-01', descricao: 'Devolução de mercadoria', categoria: 'Devoluções', tipo: 'saida', valor: 3200, conta: 'Banco do Brasil', status: 'cancelado' },
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

export default function LancamentosPage() {
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'entrada' | 'saida' | 'transferencia'>('todos')
  const [busca, setBusca] = useState('')

  const filtrados = mockLancamentos.filter((l) => {
    if (filtroTipo !== 'todos' && l.tipo !== filtroTipo) return false
    if (busca && !l.descricao.toLowerCase().includes(busca.toLowerCase())) return false
    return true
  })

  const totalEntradas = filtrados.filter((l) => l.tipo === 'entrada').reduce((acc, l) => acc + l.valor, 0)
  const totalSaidas = filtrados.filter((l) => l.tipo === 'saida').reduce((acc, l) => acc + l.valor, 0)

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
              Lançamentos
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              Entradas, saídas e transferências
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip text="Exportar lançamentos em CSV" position="bottom">
            <button className="btn-glass btn-glass-sm">
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </Tooltip>
          <Tooltip text="Adicionar novo lançamento" position="bottom">
            <button className="btn-glass btn-glass-olive btn-glass-sm">
              <Plus className="w-4 h-4" />
              Novo Lançamento
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Resumo rápido */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card-glass p-4" style={{ borderLeft: '3px solid var(--olive)' }}>
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Total Entradas</span>
          <p className="text-xl font-extrabold mt-1" style={{ color: 'var(--olive)', fontFamily: 'var(--font-display)' }}>
            {formatCurrency(totalEntradas)}
          </p>
        </div>
        <div className="card-glass p-4" style={{ borderLeft: '3px solid #dc2626' }}>
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Total Saídas</span>
          <p className="text-xl font-extrabold mt-1" style={{ color: '#dc2626', fontFamily: 'var(--font-display)' }}>
            {formatCurrency(totalSaidas)}
          </p>
        </div>
        <div className="card-glass p-4" style={{ borderLeft: '3px solid var(--navy)' }}>
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Saldo</span>
          <p className="text-xl font-extrabold mt-1" style={{ color: totalEntradas - totalSaidas >= 0 ? 'var(--olive)' : '#dc2626', fontFamily: 'var(--font-display)' }}>
            {formatCurrency(totalEntradas - totalSaidas)}
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
          {(['todos', 'entrada', 'saida', 'transferencia'] as const).map((tipo) => {
            const labels = { todos: 'Todos', entrada: 'Entradas', saida: 'Saídas', transferencia: 'Transf.' }
            const cores = { todos: 'var(--navy)', entrada: 'var(--olive)', saida: '#dc2626', transferencia: 'var(--navy-400)' }
            return (
              <button
                key={tipo}
                onClick={() => setFiltroTipo(tipo)}
                className="px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200"
                style={{
                  background: filtroTipo === tipo ? cores[tipo] : 'transparent',
                  color: filtroTipo === tipo ? '#ffffff' : 'var(--text-tertiary)',
                }}
              >
                {labels[tipo]}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tabela */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Conta</th>
              <th>Tipo</th>
              <th>Status</th>
              <th className="text-right">Valor</th>
              <th className="text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((l) => (
              <tr key={l.id}>
                <td className="text-xs font-mono whitespace-nowrap">{formatDate(l.data)}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{
                        background: l.tipo === 'entrada'
                          ? 'linear-gradient(135deg, var(--olive), var(--olive-light))'
                          : l.tipo === 'saida'
                          ? 'linear-gradient(135deg, #dc2626, #ef4444)'
                          : 'linear-gradient(135deg, var(--navy-400), var(--navy-500))',
                      }}
                    >
                      {l.tipo === 'entrada' ? <ArrowUpRight className="w-3 h-3 text-white" /> :
                       l.tipo === 'saida' ? <ArrowDownRight className="w-3 h-3 text-white" /> :
                       <ArrowLeftRight className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm font-semibold truncate max-w-[200px]" style={{ color: 'var(--text-primary)' }}>
                      {l.descricao}
                    </span>
                  </div>
                </td>
                <td className="text-xs">{l.categoria}</td>
                <td className="text-xs">{l.conta}</td>
                <td>
                  <span className={`badge ${
                    l.tipo === 'entrada' ? 'badge-olive' :
                    l.tipo === 'saida' ? 'badge-danger' :
                    'badge-navy'
                  }`}>
                    {l.tipo === 'entrada' ? 'Entrada' : l.tipo === 'saida' ? 'Saída' : 'Transf.'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${
                    l.status === 'efetivado' ? 'badge-olive' :
                    l.status === 'agendado' ? 'badge-warning' :
                    'badge-danger'
                  }`}>
                    {l.status === 'efetivado' ? 'Efetivado' : l.status === 'agendado' ? 'Agendado' : 'Cancelado'}
                  </span>
                </td>
                <td className="text-right">
                  <span
                    className="text-sm font-bold font-mono"
                    style={{
                      color: l.tipo === 'entrada' ? 'var(--olive)' : l.tipo === 'saida' ? '#dc2626' : 'var(--text-primary)',
                    }}
                  >
                    {l.tipo === 'entrada' ? '+' : l.tipo === 'saida' ? '-' : ''} {formatCurrency(l.valor)}
                  </span>
                </td>
                <td>
                  <div className="flex items-center justify-center gap-1">
                    <Tooltip text="Editar lançamento" position="top">
                      <button className="p-1.5 rounded-lg transition-colors duration-200 hover:bg-[var(--bg-hover)]">
                        <Edit3 className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
                      </button>
                    </Tooltip>
                    <Tooltip text="Excluir lançamento" position="top">
                      <button className="p-1.5 rounded-lg transition-colors duration-200 hover:bg-[var(--bg-hover)]">
                        <Trash2 className="w-3.5 h-3.5" style={{ color: '#dc2626' }} />
                      </button>
                    </Tooltip>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação placeholder */}
      <div className="flex items-center justify-between mt-4">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Mostrando {filtrados.length} de {mockLancamentos.length} lançamentos
        </span>
        <div className="flex items-center gap-1">
          <button className="btn-glass btn-glass-sm" disabled><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-xs font-bold px-3" style={{ color: 'var(--text-primary)' }}>1</span>
          <button className="btn-glass btn-glass-sm" disabled><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  )
}
