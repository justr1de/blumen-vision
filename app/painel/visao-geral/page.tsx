'use client'

import Tooltip from '@/components/Tooltip'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
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
} from 'lucide-react'

/* ─── Dados mockados (futuramente virão da API) ─── */

const kpis = [
  {
    label: 'Receita Total',
    valor: 2847500.0,
    variacao: 12.4,
    icon: DollarSign,
    tooltip: 'Receita total consolidada de todos os segmentos',
    cor: 'var(--olive)',
  },
  {
    label: 'Resultado Operacional',
    valor: 485200.0,
    variacao: 8.2,
    icon: TrendingUp,
    tooltip: 'Resultado operacional líquido do período',
    cor: 'var(--olive)',
  },
  {
    label: 'Comprometimento Financeiro',
    valor: 67.3,
    variacao: -2.1,
    icon: AlertTriangle,
    tooltip: 'Percentual da receita comprometida com despesas fixas',
    cor: 'var(--navy)',
    sufixo: '%',
  },
  {
    label: 'Fluxo Líquido',
    valor: 312800.0,
    variacao: 15.7,
    icon: Activity,
    tooltip: 'Diferença entre entradas e saídas no período',
    cor: 'var(--olive)',
  },
  {
    label: 'Endividamento',
    valor: 1250000.0,
    variacao: -5.3,
    icon: CreditCard,
    tooltip: 'Total de dívidas e financiamentos ativos',
    cor: 'var(--navy)',
  },
]

const segmentos = [
  {
    nome: 'Serviços Financeiros',
    icon: Briefcase,
    receita: 1520000,
    resultado: 285000,
    margem: 18.75,
    status: 'saudavel' as const,
    tendencia: 'alta' as const,
  },
  {
    nome: 'Varejo',
    icon: ShoppingBag,
    receita: 890000,
    resultado: 142000,
    margem: 15.96,
    status: 'atencao' as const,
    tendencia: 'estavel' as const,
  },
  {
    nome: 'Indústria',
    icon: Factory,
    receita: 437500,
    resultado: 58200,
    margem: 13.3,
    status: 'saudavel' as const,
    tendencia: 'alta' as const,
  },
]

const modulos = [
  { nome: 'Vision Caixa', status: 'ativo' as const, descricao: 'Fluxo de caixa, lançamentos, conciliação e recebíveis', icon: Wallet, contratado: true },
  { nome: 'Vision Produção', status: 'nao_contratado' as const, descricao: 'Controle de produção, custos industriais e estoque', icon: Factory, contratado: false },
  { nome: 'Vision Capital', status: 'nao_contratado' as const, descricao: 'Gestão de investimentos, patrimônio e endividamento', icon: PiggyBank, contratado: false },
]

/* ─── Helpers ─── */

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function StatusBadge({ status }: { status: 'saudavel' | 'atencao' | 'critico' }) {
  const config = {
    saudavel: { label: 'Saudável', class: 'badge-olive', icon: CheckCircle2 },
    atencao: { label: 'Atenção', class: 'badge-warning', icon: AlertTriangle },
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

function ModuloStatusBadge({ status }: { status: 'ativo' | 'nao_contratado' }) {
  const config = {
    ativo: { label: 'Contratado', class: 'badge-olive', icon: CheckCircle2 },
    nao_contratado: { label: 'Não contratado', class: 'badge-warning', icon: Lock },
  }
  const c = config[status]
  return (
    <span className={`badge ${c.class} flex items-center gap-1`}>
      <c.icon className="w-3 h-3" />
      {c.label}
    </span>
  )
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
              Indicadores consolidados do Grupo Imediata — Período atual
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
              <div className="flex items-center gap-1 mt-2">
                {kpi.variacao >= 0 ? (
                  <TrendingUp className="w-3 h-3" style={{ color: 'var(--olive)' }} />
                ) : (
                  <TrendingDown className="w-3 h-3" style={{ color: '#dc2626' }} />
                )}
                <span
                  className="text-xs font-bold"
                  style={{ color: kpi.variacao >= 0 ? 'var(--olive)' : '#dc2626' }}
                >
                  {kpi.variacao > 0 ? '+' : ''}{kpi.variacao}%
                </span>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>vs mês anterior</span>
              </div>
            </div>
          </Tooltip>
        ))}
      </div>

      {/* Resultado por Segmento */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Resultado por Segmento
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
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    {seg.nome}
                  </h3>
                </div>
                <StatusBadge status={seg.status} />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Receita</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    {formatCurrency(seg.receita)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Resultado</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--olive)' }}>
                    {formatCurrency(seg.resultado)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Margem</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      {seg.margem}%
                    </span>
                    <TendenciaIcon tendencia={seg.tendencia} />
                  </div>
                </div>

                {/* Barra de margem */}
                <div className="mt-2">
                  <div className="w-full h-2 rounded-full" style={{ background: 'var(--border-primary)' }}>
                    <div
                      className="h-2 rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(seg.margem * 4, 100)}%`,
                        background: seg.status === 'saudavel'
                          ? 'linear-gradient(90deg, var(--olive), var(--olive-light))'
                          : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status dos Módulos */}
      <div>
        <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Suíte Blúmen Vision
        </h2>
        <h3 className="text-sm mb-4" style={{ color: 'var(--text-tertiary)' }}>
          Cada módulo é contratado individualmente. Entre em contato para ativar novos módulos.
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {modulos.map((mod) => (
            <Tooltip key={mod.nome} text={mod.descricao} position="bottom">
              <div
                className={`card-glass p-5 cursor-default ${mod.status === 'nao_contratado' ? 'opacity-60' : ''}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{
                      background: mod.status === 'ativo'
                        ? 'linear-gradient(135deg, var(--olive), var(--olive-light))'
                        : 'linear-gradient(135deg, #94a3b8, #64748b)',
                    }}
                  >
                    <mod.icon className="w-4 h-4 text-white" />
                  </div>
                  <ModuloStatusBadge status={mod.status} />
                </div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  {mod.nome}
                </h3>
                <p className="text-[11px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
                  {mod.descricao}
                </p>
              </div>
            </Tooltip>
          ))}
        </div>
      </div>
    </div>
  )
}
