'use client'

import Tooltip from '@/components/Tooltip'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Lock,
  BarChart3,
  Wallet,
  PiggyBank,
  CreditCard,
  Eye,
  Briefcase,
  Factory,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'

/* ─── Dados mockados (futuramente virão da API) ─── */

const kpis = [
  {
    label: 'Receita total',
    valor: 2100000,
    variacao: 6,
    icon: DollarSign,
    tooltip: 'Receita total consolidada de todos os segmentos',
    cor: 'var(--olive)',
    detalhe: '+6% vs mês anterior',
  },
  {
    label: 'Resultado operacional',
    valor: 945000,
    variacao: 0,
    icon: TrendingUp,
    tooltip: 'Receita menos custos e despesas operacionais',
    cor: 'var(--olive)',
    detalhe: 'Margem operacional 45%',
  },
  {
    label: 'Comprometimento financeiro',
    valor: 210000,
    variacao: 0,
    icon: CreditCard,
    tooltip: 'Empréstimos, dívidas e investimentos que comprometem a receita',
    cor: 'var(--navy)',
    detalhe: '10% da receita',
    extra: 'Empréstimos, dívidas e invest.',
  },
  {
    label: 'Fluxo líquido',
    valor: 735000,
    variacao: 0,
    icon: Activity,
    tooltip: 'Diferença entre entradas e saídas no período',
    cor: 'var(--olive)',
    detalhe: 'Entradas menos saídas do período',
  },
  {
    label: 'Endividamento',
    valor: 38,
    variacao: 0,
    icon: AlertTriangle,
    tooltip: 'Percentual de endividamento em relação à receita',
    cor: '#e07a5f',
    detalhe: 'Atenção: meta 30%',
    sufixo: '%',
  },
]

const segmentos = [
  {
    nome: 'Serviços Financeiros',
    icon: Briefcase,
    unidades: 4,
    receita: 980000,
    resOperacional: 510000,
    resOperacionalPct: 52,
    resLiquido: 380000,
    resLiquidoPct: 39,
    fluxoLiquido: 420000,
    status: 'saudavel' as const,
    tendencia: 'alta' as const,
  },
  {
    nome: 'Varejo',
    icon: ShoppingBag,
    unidades: 5,
    receita: 720000,
    resOperacional: 223000,
    resOperacionalPct: 31,
    resLiquido: 144000,
    resLiquidoPct: 20,
    fluxoLiquido: 190000,
    status: 'atencao' as const,
    tendencia: 'estavel' as const,
  },
  {
    nome: 'Indústria',
    icon: Factory,
    unidades: 2,
    receita: 400000,
    resOperacional: 152000,
    resOperacionalPct: 38,
    resLiquido: 116000,
    resLiquidoPct: 29,
    fluxoLiquido: 125000,
    status: 'no_alvo' as const,
    tendencia: 'alta' as const,
  },
]

const modulos = [
  {
    nome: 'Vision Caixa',
    status: 'ativo' as const,
    descricao: 'Fluxo equilibrado no grupo. 5 contas a vencer esta semana.',
    statusLabel: 'Saudável',
    statusType: 'saudavel' as const,
    icon: Wallet,
    link: '/painel/caixa',
  },
  {
    nome: 'Vision Capital',
    status: 'ativo' as const,
    descricao: 'Endividamento acima da meta no Varejo. Demais segmentos dentro do limite.',
    statusLabel: 'Atenção',
    statusType: 'atencao' as const,
    icon: PiggyBank,
    link: null,
  },
  {
    nome: 'Vision Produção',
    status: 'ativo' as const,
    descricao: 'Margem positiva em todos os segmentos. Folha média em 27% da receita.',
    statusLabel: 'Saudável',
    statusType: 'saudavel' as const,
    icon: Factory,
    link: null,
  },
  {
    nome: 'Vision Decisão',
    status: 'ativo' as const,
    descricao: 'Margem líquida consolidada 40%. Projeção trimestral dentro da meta do grupo.',
    statusLabel: 'No alvo',
    statusType: 'no_alvo' as const,
    icon: BarChart3,
    link: null,
  },
]

/* ─── Helpers ─── */

function formatCurrency(value: number): string {
  if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatCurrencyFull(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function StatusBadge({ status }: { status: 'saudavel' | 'atencao' | 'no_alvo' | 'critico' }) {
  const config = {
    saudavel: { label: 'Saudável', class: 'badge-olive', icon: CheckCircle2 },
    atencao: { label: 'Atenção', class: 'badge-warning', icon: AlertTriangle },
    no_alvo: { label: 'No alvo', class: 'badge-navy', icon: CheckCircle2 },
    critico: { label: 'Crítico', class: 'badge-danger', icon: AlertTriangle },
  }
  const c = config[status]
  return (
    <span className={`badge ${c.class} flex items-center gap-1`}>
      <c.icon className="w-3 h-3" />
      {c.label}
    </span>
  )
}

function TendenciaIcon({ tendencia }: { tendencia: 'alta' | 'estavel' | 'baixa' }) {
  if (tendencia === 'alta') return <ArrowUpRight className="w-4 h-4" style={{ color: 'var(--olive)' }} />
  if (tendencia === 'baixa') return <ArrowDownRight className="w-4 h-4" style={{ color: '#dc2626' }} />
  return <Minus className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
}

/* ─── Componente ─── */

export default function VisaoGeralPage() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--navy), var(--navy-light))',
              boxShadow: '0 4px 12px rgba(29, 59, 95, 0.25)',
            }}
          >
            <Eye className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Visão Geral
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              Grupo Imediata — todos os segmentos · Período atual
            </p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {kpis.map((kpi) => (
          <Tooltip key={kpi.label} text={kpi.tooltip} position="bottom">
            <div className="card-glass p-5 cursor-default">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  {kpi.label}
                </span>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${kpi.cor}, ${kpi.cor}dd)`,
                    boxShadow: `0 3px 10px ${kpi.cor}40`,
                  }}
                >
                  <kpi.icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-xl font-extrabold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                {kpi.sufixo ? `${kpi.valor}${kpi.sufixo}` : formatCurrency(kpi.valor)}
              </p>
              <p className="text-[10px] mt-1" style={{ color: kpi.cor }}>
                {kpi.detalhe}
              </p>
              {kpi.extra && (
                <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {kpi.extra}
                </p>
              )}
            </div>
          </Tooltip>
        ))}
      </div>

      {/* Resultado por Segmento */}
      <div className="mb-8">
        <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
          Resultado por segmento
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {segmentos.map((seg) => (
            <div key={seg.nome} className="card-glass p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, var(--navy), var(--navy-light))' }}
                  >
                    <seg.icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      {seg.nome}
                    </h3>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{seg.unidades} unidades</p>
                  </div>
                </div>
                <StatusBadge status={seg.status} />
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Receita</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    {formatCurrency(seg.receita)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Res. operacional</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    {formatCurrency(seg.resOperacional)}{' '}
                    <span style={{ color: 'var(--olive)' }}>{seg.resOperacionalPct}%</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Res. líquido</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    {formatCurrency(seg.resLiquido)}{' '}
                    <span style={{ color: seg.status === 'atencao' ? '#e07a5f' : 'var(--olive)' }}>{seg.resLiquidoPct}%</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Fluxo líquido</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    {formatCurrency(seg.fluxoLiquido)}
                  </span>
                </div>

                {/* Barra de margem */}
                <div className="mt-2">
                  <div className="w-full h-2 rounded-full" style={{ background: 'var(--border-primary)' }}>
                    <div
                      className="h-2 rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(seg.resOperacionalPct * 1.5, 100)}%`,
                        background: seg.status === 'atencao'
                          ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                          : seg.status === 'no_alvo'
                            ? 'linear-gradient(90deg, var(--navy), var(--navy-light))'
                            : 'linear-gradient(90deg, var(--olive), var(--olive-light))',
                      }}
                    />
                  </div>
                </div>
              </div>

              <p className="text-[8px] mt-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Res. operacional = receita − custos e despesas operacionais · Res. líquido = após comprometimento financeiro · Fluxo líquido = entradas − saídas do período
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Status dos Módulos */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
          Status dos módulos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {modulos.map((mod) => (
            <div key={mod.nome} className="card-glass p-5">
              <div className="flex items-start gap-3">
                <div
                  className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                  style={{
                    background: mod.statusType === 'saudavel' ? 'var(--olive)'
                      : mod.statusType === 'atencao' ? '#e07a5f'
                      : 'var(--navy)',
                  }}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <mod.icon className="w-4 h-4" style={{ color: 'var(--navy)' }} />
                      <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                        {mod.nome}
                      </h3>
                    </div>
                    <StatusBadge status={mod.statusType} />
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {mod.descricao}
                  </p>
                  {mod.link && (
                    <Link
                      href={mod.link}
                      className="inline-flex items-center gap-1 mt-2 text-xs font-semibold transition-colors"
                      style={{ color: 'var(--navy)' }}
                    >
                      Acessar módulo
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
