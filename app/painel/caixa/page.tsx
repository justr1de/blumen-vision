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
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  RefreshCw,
  ChevronRight,
  Clock,
  Tag,
  CheckCircle2,
  XCircle,
  LayoutList,
} from 'lucide-react'

/* ─── Dados mockados (futuramente virão da API) ─── */

const kpis = [
  {
    label: 'Disponibilidades',
    valor: 1300000,
    icon: Wallet,
    tooltip: 'Saldo total disponível em todas as contas bancárias',
    cor: 'var(--olive)',
    detalhe: 'Saldo em todas as contas',
  },
  {
    label: 'Projeção 30 dias',
    valor: 1080000,
    icon: TrendingUp,
    tooltip: 'Projeção do saldo líquido para os próximos 30 dias',
    cor: 'var(--navy)',
    detalhe: 'Saldo projetado em 30 dias',
  },
  {
    label: 'Fluxo líquido',
    valor: 735000,
    icon: Activity,
    tooltip: 'Diferença entre entradas e saídas no período atual',
    cor: 'var(--olive)',
    detalhe: 'Entradas menos saídas',
  },
  {
    label: 'Necessidade de caixa',
    valor: 85000,
    icon: AlertTriangle,
    tooltip: 'Valor necessário para cobrir compromissos dos próximos 7 dias',
    cor: '#e07a5f',
    detalhe: 'Compromissos próximos 7 dias',
  },
]

const situacao = [
  { label: 'A receber em aberto', valor: 485000, count: 67, cor: 'var(--olive)', icon: ArrowUpRight },
  { label: 'A receber em atraso', valor: 52300, count: 12, cor: '#dc2626', icon: AlertTriangle },
  { label: 'A pagar em aberto', valor: 295700, count: 48, cor: 'var(--navy)', icon: ArrowDownRight },
  { label: 'A pagar em atraso', valor: 28900, count: 5, cor: '#dc2626', icon: AlertTriangle },
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

interface AgendaItem {
  data: string
  descricao: string
  categoria: string
  tipo: 'receber' | 'pagar'
  valor: number
  status: 'pendente' | 'confirmado' | 'atrasado'
}

const agenda: AgendaItem[] = [
  { data: '2026-04-07', descricao: 'Cliente XYZ S.A.', categoria: 'Recebível Cartão', tipo: 'receber', valor: 45000, status: 'confirmado' },
  { data: '2026-04-07', descricao: 'Parcela Financiamento BRB', categoria: 'Financiamento', tipo: 'pagar', valor: 15200, status: 'pendente' },
  { data: '2026-04-08', descricao: 'Folha de Pagamento', categoria: 'Pessoal', tipo: 'pagar', valor: 67800, status: 'pendente' },
  { data: '2026-04-08', descricao: 'Fornecedor ABC Ltda', categoria: 'Fornecedores', tipo: 'pagar', valor: 12500, status: 'pendente' },
  { data: '2026-04-09', descricao: 'Cliente DEF Ltda', categoria: 'Recebível Boleto', tipo: 'receber', valor: 28000, status: 'pendente' },
  { data: '2026-04-09', descricao: 'Aluguel Loja Centro', categoria: 'Ocupação', tipo: 'pagar', valor: 8500, status: 'confirmado' },
  { data: '2026-04-10', descricao: 'Energia Elétrica', categoria: 'Utilidades', tipo: 'pagar', valor: 4200, status: 'pendente' },
  { data: '2026-04-10', descricao: 'Recebível Cartão Visa', categoria: 'Recebível Cartão', tipo: 'receber', valor: 32000, status: 'confirmado' },
  { data: '2026-04-11', descricao: 'Cliente GHI S.A.', categoria: 'Recebível Boleto', tipo: 'receber', valor: 18500, status: 'pendente' },
  { data: '2026-04-12', descricao: 'Internet e Telefonia', categoria: 'Utilidades', tipo: 'pagar', valor: 2800, status: 'atrasado' },
]

/* ─── Helpers ─── */

function formatCurrency(value: number): string {
  if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `R$ ${Math.round(value / 1000)}k`
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatCurrencyFull(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
}

/* ─── Componente do Gráfico ─── */

function ProjecaoChart() {
  const maxVal = Math.max(...projecaoMensal.map((p) => p.realizado || p.projetado || 0))

  return (
    <div className="flex items-end gap-3 h-52 px-2">
      {projecaoMensal.map((item, i) => {
        const val = item.realizado || item.projetado || 0
        const height = (val / maxVal) * 100
        const isProjetado = item.projetado !== null

        return (
          <Tooltip key={i} text={`${item.mes}: ${formatCurrencyFull(val)}${isProjetado ? ' (projetado)' : ' (realizado)'}`} position="top">
            <div className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>
                {formatCurrency(val)}
              </span>
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

/* ─── Status Badge ─── */

function StatusBadge({ status }: { status: 'pendente' | 'confirmado' | 'atrasado' }) {
  const config = {
    pendente: { label: 'Pendente', class: 'badge-warning', icon: Clock },
    confirmado: { label: 'Confirmado', class: 'badge-olive', icon: CheckCircle2 },
    atrasado: { label: 'Atrasado', class: 'badge-danger', icon: XCircle },
  }
  const c = config[status]
  return (
    <span className={`badge ${c.class} flex items-center gap-1`}>
      <c.icon className="w-3 h-3" />
      {c.label}
    </span>
  )
}

/* ─── Componente Principal ─── */

export default function PainelCaixaPage() {
  const [filtroAgenda, setFiltroAgenda] = useState<'todos' | 'receber' | 'pagar'>('todos')

  const agendaFiltrada = agenda.filter((item) => {
    if (filtroAgenda === 'todos') return true
    return item.tipo === filtroAgenda
  })

  // Agrupar agenda por data
  const agendaAgrupada = agendaFiltrada.reduce((acc, item) => {
    if (!acc[item.data]) acc[item.data] = []
    acc[item.data].push(item)
    return acc
  }, {} as Record<string, AgendaItem[]>)

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
              Painel do Caixa — Grupo Imediata
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip text="Atualizar dados do painel" position="bottom">
            <button className="btn-glass btn-glass-sm">
              <RefreshCw className="w-4 h-4" />
            </button>
          </Tooltip>
          <Tooltip text="Documentação das telas" position="bottom">
            <Link href="/painel/caixa/telas" className="btn-glass btn-glass-sm flex items-center gap-2">
              <LayoutList className="w-4 h-4" />
              Telas
            </Link>
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
              <p className="text-[10px] mt-1" style={{ color: kpi.cor }}>
                {kpi.detalhe}
              </p>
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
          <h2 className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
            Situação financeira
          </h2>
          {situacao.map((item) => (
            <Tooltip key={item.label} text={`${item.count} títulos — ${formatCurrencyFull(item.valor)}`} position="left">
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
            <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
              <button
                onClick={() => setFiltroAgenda('todos')}
                className="px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200"
                style={{
                  background: filtroAgenda === 'todos' ? 'var(--navy)' : 'transparent',
                  color: filtroAgenda === 'todos' ? '#ffffff' : 'var(--text-tertiary)',
                }}
              >
                Todos
              </button>
              <button
                onClick={() => setFiltroAgenda('receber')}
                className="px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200"
                style={{
                  background: filtroAgenda === 'receber' ? 'var(--olive)' : 'transparent',
                  color: filtroAgenda === 'receber' ? '#ffffff' : 'var(--text-tertiary)',
                }}
              >
                A receber
              </button>
              <button
                onClick={() => setFiltroAgenda('pagar')}
                className="px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200"
                style={{
                  background: filtroAgenda === 'pagar' ? '#dc2626' : 'transparent',
                  color: filtroAgenda === 'pagar' ? '#ffffff' : 'var(--text-tertiary)',
                }}
              >
                A pagar
              </button>
            </div>
          </div>
        </div>

        {/* Agenda agrupada por data */}
        <div className="space-y-4">
          {Object.entries(agendaAgrupada).map(([data, items]) => (
            <div key={data}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                {formatDateFull(data)}
              </p>
              <div className="space-y-2">
                {items.map((item, i) => (
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
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                            <Tag className="w-3 h-3" />
                            {item.categoria}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={item.status} />
                      <div className="text-right">
                        <p
                          className="text-sm font-extrabold"
                          style={{
                            color: item.tipo === 'receber' ? 'var(--olive)' : '#dc2626',
                            fontFamily: 'var(--font-display)',
                          }}
                        >
                          {item.tipo === 'receber' ? '+' : '-'} {formatCurrencyFull(item.valor)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Link para mais */}
        <div className="mt-5 flex justify-center">
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
