'use client'

import { useState } from 'react'
import Link from 'next/link'
import Tooltip from '@/components/Tooltip'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  Clock,
  ArrowRight,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  RefreshCw,
  Filter,
  ChevronRight,
} from 'lucide-react'

/* ─── Dados mockados (futuramente virão da API) ─── */

const kpis = [
  {
    label: 'Disponibilidades',
    valor: 487350.0,
    icon: Wallet,
    tooltip: 'Saldo total disponível em todas as contas bancárias',
    cor: 'var(--olive)',
    variacao: 5.2,
  },
  {
    label: 'Projeção 30 dias',
    valor: 312800.0,
    icon: TrendingUp,
    tooltip: 'Projeção do saldo líquido para os próximos 30 dias',
    cor: 'var(--navy)',
    variacao: -2.1,
  },
  {
    label: 'Fluxo Líquido',
    valor: 174550.0,
    icon: Activity,
    tooltip: 'Diferença entre entradas e saídas no período atual',
    cor: 'var(--olive)',
    variacao: 8.7,
  },
  {
    label: 'Necessidade de Caixa',
    valor: 95200.0,
    icon: AlertTriangle,
    tooltip: 'Valor necessário para cobrir compromissos dos próximos 7 dias',
    cor: '#e07a5f',
    variacao: -12.3,
  },
]

const situacao = [
  { label: 'A receber em aberto', valor: 328500, count: 47, cor: 'var(--olive)', icon: ArrowUpRight },
  { label: 'A receber em atraso', valor: 42300, count: 8, cor: '#dc2626', icon: AlertTriangle },
  { label: 'A pagar em aberto', valor: 195700, count: 32, cor: 'var(--navy)', icon: ArrowDownRight },
  { label: 'A pagar em atraso', valor: 18900, count: 3, cor: '#dc2626', icon: AlertTriangle },
]

const projecaoMensal = [
  { mes: 'Jan', realizado: 285000, projetado: null },
  { mes: 'Fev', realizado: 312000, projetado: null },
  { mes: 'Mar', realizado: 298000, projetado: null },
  { mes: 'Abr', realizado: 345000, projetado: null },
  { mes: 'Mai', realizado: null, projetado: 360000 },
  { mes: 'Jun', realizado: null, projetado: 385000 },
  { mes: 'Jul', realizado: null, projetado: 372000 },
]

const agenda = [
  { data: '2026-04-05', descricao: 'Fornecedor ABC Ltda', tipo: 'pagar' as const, valor: 12500 },
  { data: '2026-04-05', descricao: 'Cliente XYZ S.A.', tipo: 'receber' as const, valor: 28000 },
  { data: '2026-04-06', descricao: 'Aluguel Loja Centro', tipo: 'pagar' as const, valor: 8500 },
  { data: '2026-04-07', descricao: 'Parcela Financiamento', tipo: 'pagar' as const, valor: 15200 },
  { data: '2026-04-07', descricao: 'Recebível Cartão', tipo: 'receber' as const, valor: 45000 },
  { data: '2026-04-08', descricao: 'Folha de Pagamento', tipo: 'pagar' as const, valor: 67800 },
  { data: '2026-04-09', descricao: 'Cliente DEF Ltda', tipo: 'receber' as const, valor: 18500 },
  { data: '2026-04-10', descricao: 'Energia Elétrica', tipo: 'pagar' as const, valor: 4200 },
]

/* ─── Helpers ─── */

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

/* ─── Componente do Gráfico Simples (barras) ─── */

function ProjecaoChart() {
  const maxVal = Math.max(...projecaoMensal.map((p) => p.realizado || p.projetado || 0))

  return (
    <div className="flex items-end gap-3 h-48 px-2">
      {projecaoMensal.map((item, i) => {
        const val = item.realizado || item.projetado || 0
        const height = (val / maxVal) * 100
        const isProjetado = item.projetado !== null

        return (
          <Tooltip key={i} text={`${item.mes}: ${formatCurrency(val)}${isProjetado ? ' (projetado)' : ' (realizado)'}`} position="top">
            <div className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t-md transition-all duration-500"
                style={{
                  height: `${height}%`,
                  background: isProjetado
                    ? 'repeating-linear-gradient(45deg, var(--navy-200), var(--navy-200) 2px, var(--navy-100) 2px, var(--navy-100) 4px)'
                    : 'linear-gradient(180deg, var(--olive), var(--olive-light))',
                  opacity: isProjetado ? 0.7 : 1,
                  minHeight: '8px',
                }}
              />
              <span className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>
                {item.mes}
              </span>
            </div>
          </Tooltip>
        )
      })}
    </div>
  )
}

/* ─── Componente Principal ─── */

export default function PainelCaixaPage() {
  const [filtroAgenda, setFiltroAgenda] = useState<'todos' | 'receber' | 'pagar'>('todos')

  const agendaFiltrada = agenda.filter((item) => {
    if (filtroAgenda === 'todos') return true
    return item.tipo === filtroAgenda
  })

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--olive), var(--olive-light))',
              boxShadow: '0 4px 12px rgba(111, 150, 62, 0.25)',
            }}
          >
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Vision Caixa
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              Painel de controle do fluxo de caixa
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip text="Atualizar dados do painel" position="bottom">
            <button className="btn-glass btn-glass-sm">
              <RefreshCw className="w-4 h-4" />
            </button>
          </Tooltip>
          <Tooltip text="Acessar lançamentos" position="bottom">
            <Link href="/painel/caixa/lancamentos" className="btn-glass btn-glass-navy btn-glass-sm flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Lançamentos
            </Link>
          </Tooltip>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => (
          <Tooltip key={kpi.label} text={kpi.tooltip} position="bottom">
            <div className="card-glass p-5 cursor-default">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  {kpi.label}
                </span>
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${kpi.cor}, ${kpi.cor}dd)`,
                    boxShadow: `0 3px 10px ${kpi.cor}40`,
                  }}
                >
                  <kpi.icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                {formatCurrency(kpi.valor)}
              </p>
              <div className="flex items-center gap-1 mt-2">
                {kpi.variacao >= 0 ? (
                  <TrendingUp className="w-3 h-3" style={{ color: 'var(--olive)' }} />
                ) : (
                  <TrendingDown className="w-3 h-3" style={{ color: '#dc2626' }} />
                )}
                <span className="text-xs font-bold" style={{ color: kpi.variacao >= 0 ? 'var(--olive)' : '#dc2626' }}>
                  {kpi.variacao > 0 ? '+' : ''}{kpi.variacao}%
                </span>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>vs mês anterior</span>
              </div>
            </div>
          </Tooltip>
        ))}
      </div>

      {/* Gráfico de Projeção + Cards Situação */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Gráfico */}
        <div className="lg:col-span-2 card-glass p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                Projeção do Fluxo de Caixa
              </h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                Realizado vs Projetado — 2026
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ background: 'var(--olive)' }} />
                <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>Realizado</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ background: 'var(--navy-200)', opacity: 0.7 }} />
                <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>Projetado</span>
              </div>
            </div>
          </div>
          <ProjecaoChart />
        </div>

        {/* Cards de Situação */}
        <div className="space-y-3">
          <h2 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Situação Financeira
          </h2>
          {situacao.map((item) => (
            <Tooltip key={item.label} text={`${item.count} títulos — ${formatCurrency(item.valor)}`} position="left">
              <div
                className="card-glass p-4 cursor-default"
                style={{ borderLeft: `3px solid ${item.cor}` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <item.icon className="w-4 h-4" style={{ color: item.cor }} />
                    <div>
                      <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{item.count} títulos</p>
                    </div>
                  </div>
                  <p className="text-sm font-extrabold" style={{ color: item.cor, fontFamily: 'var(--font-display)' }}>
                    {formatCurrency(item.valor)}
                  </p>
                </div>
              </div>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Agenda de Vencimentos */}
      <div className="card-glass p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" style={{ color: 'var(--navy)' }} />
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              Agenda de Vencimentos
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip text="Filtrar por tipo de lançamento" position="bottom">
              <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
                <button
                  onClick={() => setFiltroAgenda('todos')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 ${
                    filtroAgenda === 'todos' ? 'text-white' : ''
                  }`}
                  style={{
                    background: filtroAgenda === 'todos' ? 'var(--navy)' : 'transparent',
                    color: filtroAgenda === 'todos' ? '#ffffff' : 'var(--text-tertiary)',
                  }}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFiltroAgenda('receber')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200`}
                  style={{
                    background: filtroAgenda === 'receber' ? 'var(--olive)' : 'transparent',
                    color: filtroAgenda === 'receber' ? '#ffffff' : 'var(--text-tertiary)',
                  }}
                >
                  A receber
                </button>
                <button
                  onClick={() => setFiltroAgenda('pagar')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200`}
                  style={{
                    background: filtroAgenda === 'pagar' ? '#dc2626' : 'transparent',
                    color: filtroAgenda === 'pagar' ? '#ffffff' : 'var(--text-tertiary)',
                  }}
                >
                  A pagar
                </button>
              </div>
            </Tooltip>
          </div>
        </div>

        <div className="space-y-2">
          {agendaFiltrada.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-xl transition-all duration-300 hover:translate-x-1"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: item.tipo === 'receber'
                      ? 'linear-gradient(135deg, var(--olive), var(--olive-light))'
                      : 'linear-gradient(135deg, #dc2626, #ef4444)',
                  }}
                >
                  {item.tipo === 'receber' ? (
                    <ArrowUpRight className="w-4 h-4 text-white" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-white" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {item.descricao}
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    {formatDate(item.data)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className="text-sm font-extrabold"
                  style={{
                    color: item.tipo === 'receber' ? 'var(--olive)' : '#dc2626',
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  {item.tipo === 'receber' ? '+' : '-'} {formatCurrency(item.valor)}
                </p>
                <span className={`badge ${item.tipo === 'receber' ? 'badge-olive' : 'badge-danger'}`}>
                  {item.tipo === 'receber' ? 'Entrada' : 'Saída'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Link para mais */}
        <div className="mt-4 flex justify-center">
          <Tooltip text="Ver todos os lançamentos agendados" position="top">
            <Link href="/painel/caixa/lancamentos" className="btn-glass btn-glass-sm flex items-center gap-2">
              Ver todos os lançamentos
              <ChevronRight className="w-4 h-4" />
            </Link>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}
