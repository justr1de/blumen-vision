'use client'

import Tooltip from '@/components/Tooltip'
import {
  Wallet,
  FileText,
  ArrowLeftRight,
  Receipt,
  BarChart3,
  ChevronRight,
  Info,
  CheckCircle2,
  Pencil,
  Star,
  Copy,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

/* ─── Dados das telas ─── */

interface Tela {
  numero: number
  nome: string
  descricao: string
  badge: 'principal' | 'a_desenhar' | 'plano_basico'
  icon: any
  link: string | null
  detalhes: string[]
}

const telas: Tela[] = [
  {
    numero: 1,
    nome: 'Painel do Caixa',
    descricao: 'Visão geral do fluxo de caixa. KPIs de disponibilidades, projeção, fluxo líquido e necessidade de caixa. Gráfico de projeção, situação financeira (a receber/pagar) e agenda de vencimentos.',
    badge: 'principal',
    icon: Wallet,
    link: '/painel/caixa',
    detalhes: [
      '4 KPIs: Disponibilidades, Projeção 30 dias, Fluxo líquido, Necessidade de caixa',
      'Gráfico de projeção: Realizado vs Projetado',
      '4 cards de situação: A receber em aberto/atraso, A pagar em aberto/atraso',
      'Agenda de vencimentos com filtro por tipo',
      'Filtros: segmento, unidade, período',
    ],
  },
  {
    numero: 2,
    nome: 'Lançamentos',
    descricao: 'Listagem completa de lançamentos financeiros com filtros por tipo (entrada/saída), busca por descrição, e ações de edição/exclusão. Totalizadores de entradas, saídas e saldo.',
    badge: 'principal',
    icon: FileText,
    link: '/painel/caixa/lancamentos',
    detalhes: [
      'Tabela de lançamentos com data, descrição, categoria, tipo, valor, conta e status',
      'Filtros: tipo (todos/entradas/saídas), busca por texto',
      '3 totalizadores: entradas, saídas, saldo',
      'Ações por linha: editar, excluir',
      'Paginação para grandes volumes',
    ],
  },
  {
    numero: 3,
    nome: 'Extrato e Conciliação',
    descricao: 'Extrato bancário por conta com saldo e movimentações. Conciliação bancária comparando lançamentos do sistema com movimentações do banco, identificando divergências.',
    badge: 'principal',
    icon: ArrowLeftRight,
    link: '/painel/caixa/extrato',
    detalhes: [
      'Seleção de conta bancária com saldo individual',
      'Extrato com débitos e créditos e saldo acumulado',
      'Conciliação: sistema vs banco com status (conciliado/divergente/pendente)',
      'Taxa de conciliação e contadores',
      'Ação manual para itens divergentes',
    ],
  },
  {
    numero: 4,
    nome: 'Recebíveis e Antecipação',
    descricao: 'Gestão de recebíveis com visão de carteira, antecipações disponíveis, simulação de antecipação e acompanhamento de operações realizadas.',
    badge: 'a_desenhar',
    icon: Receipt,
    link: null,
    detalhes: [
      'Carteira de recebíveis por vencimento',
      'Simulação de antecipação com taxas',
      'Histórico de antecipações realizadas',
      'Integração com bancos para consulta de taxas',
    ],
  },
  {
    numero: 5,
    nome: 'DRE Simplificado',
    descricao: 'Demonstrativo de Resultado do Exercício simplificado, com receitas, custos, despesas e resultado operacional. Visão mensal e acumulada.',
    badge: 'plano_basico',
    icon: BarChart3,
    link: null,
    detalhes: [
      'Receita bruta e deduções',
      'Custos diretos e margem bruta',
      'Despesas operacionais detalhadas',
      'Resultado operacional e líquido',
      'Comparativo mensal e acumulado',
    ],
  },
]

/* ─── Helpers ─── */

function BadgeStatus({ badge }: { badge: 'principal' | 'a_desenhar' | 'plano_basico' }) {
  const config = {
    principal: { label: 'Principal', class: 'badge-olive', icon: Star },
    a_desenhar: { label: 'A desenhar', class: 'badge-warning', icon: Pencil },
    plano_basico: { label: 'Plano básico', class: 'badge-navy', icon: CheckCircle2 },
  }
  const c = config[badge]
  return (
    <span className={`badge ${c.class} flex items-center gap-1`}>
      <c.icon className="w-3 h-3" />
      {c.label}
    </span>
  )
}

function CopyButton({ sectionId }: { sectionId: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    const el = document.getElementById(sectionId)
    if (el) {
      navigator.clipboard.writeText(el.innerText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }
  return (
    <Tooltip text={copied ? 'Copiado!' : 'Copiar conteúdo'} position="left">
      <button onClick={handleCopy} className="btn-glass btn-glass-sm flex items-center gap-1.5">
        {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        <span className="text-xs">{copied ? 'Copiado' : 'Copiar'}</span>
      </button>
    </Tooltip>
  )
}

/* ─── Componente ─── */

export default function VisionTelasCaixaPage() {
  const [expandedTela, setExpandedTela] = useState<number | null>(null)

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
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
              Vision Caixa — Telas
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              Documentação das telas do módulo Vision Caixa
            </p>
          </div>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card-glass p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Total de telas</span>
            <FileText className="w-4 h-4" style={{ color: 'var(--navy)' }} />
          </div>
          <p className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            {telas.length}
          </p>
        </div>
        <div className="card-glass p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Implementadas</span>
            <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--olive)' }} />
          </div>
          <p className="text-3xl font-extrabold" style={{ color: 'var(--olive)', fontFamily: 'var(--font-display)' }}>
            {telas.filter((t) => t.badge === 'principal').length}
          </p>
        </div>
        <div className="card-glass p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>A desenhar</span>
            <Pencil className="w-4 h-4" style={{ color: '#f59e0b' }} />
          </div>
          <p className="text-3xl font-extrabold" style={{ color: '#f59e0b', fontFamily: 'var(--font-display)' }}>
            {telas.filter((t) => t.badge === 'a_desenhar').length}
          </p>
        </div>
      </div>

      {/* Lista de telas */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Telas do módulo
        </h2>
        <CopyButton sectionId="sec-telas" />
      </div>

      <div id="sec-telas" className="space-y-4">
        {telas.map((tela) => (
          <div key={tela.numero} className="card-glass overflow-hidden">
            <button
              onClick={() => setExpandedTela(expandedTela === tela.numero ? null : tela.numero)}
              className="w-full p-5 flex items-start gap-4 text-left transition-colors duration-200"
            >
              {/* Número */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: tela.badge === 'principal'
                    ? 'linear-gradient(135deg, var(--olive), var(--olive-light))'
                    : tela.badge === 'a_desenhar'
                      ? 'linear-gradient(135deg, #f59e0b, #fbbf24)'
                      : 'linear-gradient(135deg, var(--navy), var(--navy-light))',
                }}
              >
                <span className="text-sm font-bold text-white">{tela.numero}</span>
              </div>

              {/* Conteúdo */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <tela.icon className="w-4 h-4" style={{ color: 'var(--navy)' }} />
                  <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                    {tela.nome}
                  </h3>
                  <BadgeStatus badge={tela.badge} />
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                  {tela.descricao}
                </p>
              </div>

              {/* Ação */}
              <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                {tela.link && (
                  <Link
                    href={tela.link}
                    onClick={(e) => e.stopPropagation()}
                    className="btn-glass btn-glass-navy btn-glass-sm flex items-center gap-1"
                  >
                    Acessar
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                )}
                <ChevronRight
                  className={`w-5 h-5 transition-transform duration-200 ${expandedTela === tela.numero ? 'rotate-90' : ''}`}
                  style={{ color: 'var(--text-muted)' }}
                />
              </div>
            </button>

            {/* Detalhes expandidos */}
            {expandedTela === tela.numero && (
              <div className="px-5 pb-5 pt-0 ml-14">
                <div className="p-4 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
                    Funcionalidades
                  </p>
                  <ul className="space-y-2">
                    {tela.detalhes.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--olive)' }} />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Nota */}
      <div
        className="p-4 rounded-lg mt-6 flex items-start gap-3"
        style={{ background: 'var(--olive-50)', border: '1px solid var(--olive-200)' }}
      >
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--olive)' }} />
        <div>
          <p className="text-xs font-bold" style={{ color: 'var(--olive-dark)' }}>Nota sobre contas a pagar</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--olive-dark)' }}>
            Contas a pagar não tem tela própria. Os lançamentos de saída são registrados na tela de Lançamentos
            e aparecem na Agenda de Vencimentos do Painel do Caixa.
          </p>
        </div>
      </div>
    </div>
  )
}
