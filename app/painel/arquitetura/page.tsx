'use client'

import { useState } from 'react'
import Tooltip from '@/components/Tooltip'
import {
  Building2,
  Layers,
  Store,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Info,
  Network,
  FileText,
  Hash,
  MapPin,
  Users,
  ArrowLeftRight,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Wallet,
  PiggyBank,
  Factory,
  BarChart3,
  Briefcase,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react'

/* ─── Dados mockados (futuramente virão da API) ─── */

interface Unidade {
  id: string
  nome: string
  cnpj: string
  cidade: string
  uf: string
  status: 'ativo' | 'inativo'
  responsavel: string
}

interface Segmento {
  id: string
  nome: string
  descricao: string
  unidades: Unidade[]
}

interface Grupo {
  id: string
  nome: string
  segmentos: Segmento[]
}

const mockData: Grupo = {
  id: '1',
  nome: 'Grupo Imediata',
  segmentos: [
    {
      id: 's1',
      nome: 'Serviços Financeiros',
      descricao: 'Operações de crédito, empréstimos e financiamentos',
      unidades: [
        { id: 'u1', nome: 'Imediata Matriz', cnpj: '12.345.678/0001-01', cidade: 'Goiânia', uf: 'GO', status: 'ativo', responsavel: 'Carlos Silva' },
        { id: 'u2', nome: 'Imediata Filial Norte', cnpj: '12.345.678/0002-82', cidade: 'Palmas', uf: 'TO', status: 'ativo', responsavel: 'Ana Costa' },
        { id: 'u3', nome: 'Imediata Filial Sul', cnpj: '12.345.678/0003-63', cidade: 'Uberlândia', uf: 'MG', status: 'ativo', responsavel: 'Pedro Santos' },
        { id: 'u4', nome: 'Imediata Filial Leste', cnpj: '12.345.678/0004-44', cidade: 'Brasília', uf: 'DF', status: 'ativo', responsavel: 'Lucia Mendes' },
      ],
    },
    {
      id: 's2',
      nome: 'Varejo',
      descricao: 'Lojas de varejo e comércio',
      unidades: [
        { id: 'u5', nome: 'Loja Centro', cnpj: '98.765.432/0001-10', cidade: 'Goiânia', uf: 'GO', status: 'ativo', responsavel: 'Maria Oliveira' },
        { id: 'u6', nome: 'Loja Norte', cnpj: '98.765.432/0002-00', cidade: 'Anápolis', uf: 'GO', status: 'ativo', responsavel: 'João Ferreira' },
        { id: 'u7', nome: 'Loja Shopping', cnpj: '98.765.432/0003-81', cidade: 'Goiânia', uf: 'GO', status: 'ativo', responsavel: 'Ana Paula' },
        { id: 'u8', nome: 'Loja Sul', cnpj: '98.765.432/0004-62', cidade: 'Rio Verde', uf: 'GO', status: 'ativo', responsavel: 'Roberto Lima' },
        { id: 'u9', nome: 'Loja Oeste', cnpj: '98.765.432/0005-43', cidade: 'Jataí', uf: 'GO', status: 'ativo', responsavel: 'Carla Santos' },
      ],
    },
    {
      id: 's3',
      nome: 'Indústria',
      descricao: 'Produção e manufatura',
      unidades: [
        { id: 'u10', nome: 'Fábrica Central', cnpj: '11.222.333/0001-44', cidade: 'Aparecida de Goiânia', uf: 'GO', status: 'ativo', responsavel: 'Roberto Lima' },
        { id: 'u11', nome: 'Fábrica Norte', cnpj: '11.222.333/0002-25', cidade: 'Palmas', uf: 'TO', status: 'ativo', responsavel: 'Fernando Costa' },
      ],
    },
  ],
}

/* ─── Dados do mockup de navegação ─── */

const kpisMockup = [
  { label: 'Receita total', valor: 'R$ 2,1M', detalhe: '+6% vs mês anterior', cor: 'var(--olive)' },
  { label: 'Resultado operacional', valor: 'R$ 945k', detalhe: 'Margem operacional 45%', cor: 'var(--olive)' },
  { label: 'Comprometimento financeiro', valor: 'R$ 210k', detalhe: '10% da receita', cor: 'var(--navy)', extra: 'Empréstimos, dívidas e invest.' },
  { label: 'Fluxo líquido', valor: 'R$ 735k', detalhe: 'Entradas menos saídas do período', cor: 'var(--olive)' },
  { label: 'Endividamento', valor: '38%', detalhe: 'Atenção: meta 30%', cor: '#e07a5f' },
]

const segmentosMockup = [
  {
    nome: 'Serviços Financeiros', unidades: 4, receita: 'R$ 980k',
    resOp: 'R$ 510k', resOpPct: '52%', resLiq: 'R$ 380k', resLiqPct: '39%',
    fluxo: 'R$ 420k', status: 'Saudável' as const,
  },
  {
    nome: 'Varejo', unidades: 5, receita: 'R$ 720k',
    resOp: 'R$ 223k', resOpPct: '31%', resLiq: 'R$ 144k', resLiqPct: '20%',
    fluxo: 'R$ 190k', status: 'Atenção' as const,
  },
  {
    nome: 'Indústria', unidades: 2, receita: 'R$ 400k',
    resOp: 'R$ 152k', resOpPct: '38%', resLiq: 'R$ 116k', resLiqPct: '29%',
    fluxo: 'R$ 125k', status: 'No alvo' as const,
  },
]

const modulosMockup = [
  { nome: 'Vision Caixa', descricao: 'Fluxo equilibrado no grupo. 5 contas a vencer esta semana.', status: 'Saudável' as const, icon: Wallet },
  { nome: 'Vision Capital', descricao: 'Endividamento acima da meta no Varejo. Demais segmentos dentro do limite.', status: 'Atenção' as const, icon: PiggyBank },
  { nome: 'Vision Produção', descricao: 'Margem positiva em todos os segmentos. Folha média em 27% da receita.', status: 'Saudável' as const, icon: Factory },
  { nome: 'Vision Decisão', descricao: 'Margem líquida consolidada 40%. Projeção trimestral dentro da meta do grupo.', status: 'No alvo' as const, icon: BarChart3 },
]

/* ─── Helpers ─── */

function StatusBadge({ status }: { status: 'Saudável' | 'Atenção' | 'No alvo' }) {
  const config = {
    'Saudável': { class: 'badge-olive', icon: CheckCircle2 },
    'Atenção': { class: 'badge-warning', icon: AlertTriangle },
    'No alvo': { class: 'badge-navy', icon: CheckCircle2 },
  }
  const c = config[status]
  return (
    <span className={`badge ${c.class} flex items-center gap-1`}>
      <c.icon className="w-3 h-3" />
      {status}
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
    <Tooltip text={copied ? 'Copiado!' : 'Copiar conteúdo da seção'} position="left">
      <button onClick={handleCopy} className="btn-glass btn-glass-sm flex items-center gap-1.5">
        {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        <span className="text-xs">{copied ? 'Copiado' : 'Copiar'}</span>
      </button>
    </Tooltip>
  )
}

/* ─── Componente ─── */

export default function ArquiteturaPage() {
  const [expandedSegmentos, setExpandedSegmentos] = useState<Set<string>>(new Set(['s1', 's2', 's3']))
  const [visaoAtiva, setVisaoAtiva] = useState<'gerencial' | 'cnpj'>('gerencial')

  const toggleSegmento = (id: string) => {
    setExpandedSegmentos((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const expandAll = () => setExpandedSegmentos(new Set(mockData.segmentos.map((s) => s.id)))
  const collapseAll = () => setExpandedSegmentos(new Set())

  const totalUnidades = mockData.segmentos.reduce((acc, s) => acc + s.unidades.length, 0)
  const totalAtivas = mockData.segmentos.reduce((acc, s) => acc + s.unidades.filter((u) => u.status === 'ativo').length, 0)

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--navy), var(--navy-light))',
              boxShadow: '0 4px 12px rgba(29, 59, 95, 0.25)',
            }}
          >
            <Network className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Blúmen Vision — Arquitetura
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              Hierarquia de negócios: Grupo → Segmento → Unidade
            </p>
          </div>
        </div>
      </div>

      {/* ═══════ SEÇÃO 1: DUAS LÓGICAS ═══════ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Duas lógicas no mesmo sistema
          </h2>
          <CopyButton sectionId="sec-logicas" />
        </div>
        <div id="sec-logicas" className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Visão Gerencial */}
          <div className="card-glass p-6" style={{ borderTop: '3px solid var(--olive)' }}>
            <span className="badge badge-olive mb-3">Visão gerencial</span>
            <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              Organizada pelo empresário
            </h3>
            <p className="text-xs mb-4" style={{ color: 'var(--text-tertiary)' }}>
              Grupo → Segmento → Unidade. Definido livremente. O CNPJ não determina como a informação é agrupada.
            </p>
            <ul className="space-y-1.5">
              {[
                'Decisão de negócio no dia a dia',
                'Acompanhamento de resultado por segmento',
                'Comparativo entre operações e unidades',
                'Um CNPJ pode ter unidades em segmentos diferentes',
                'Dois CNPJs podem estar no mesmo segmento',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--olive)' }} />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          {/* Visão por CNPJ */}
          <div className="card-glass p-6" style={{ borderTop: '3px solid var(--navy)' }}>
            <span className="badge badge-navy mb-3">Visão por CNPJ</span>
            <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              Organizada pela empresa jurídica
            </h3>
            <p className="text-xs mb-4" style={{ color: 'var(--text-tertiary)' }}>
              Agrupa receita, custo e resultado por CNPJ. View específica — não é o modo padrão do sistema.
            </p>
            <ul className="space-y-1.5">
              {[
                'Planejamento tributário',
                'Cálculo de carga por regime (Simples / Lucro Presumido)',
                'Exportação de informações para o contador',
                'Conciliação bancária por CNPJ',
                'Base para o Vision Caixa identificar origem dos recebíveis',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--navy)' }} />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ═══════ SEÇÃO 2: HIERARQUIA ═══════ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Hierarquia gerencial — 3 níveis livres
          </h2>
          <CopyButton sectionId="sec-hierarquia" />
        </div>
        <div id="sec-hierarquia" className="space-y-4">
          {/* Nível 3 */}
          <div className="card-glass p-5" style={{ borderLeft: '4px solid var(--navy)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="badge badge-navy">Nível 3</span>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Grupo</h3>
                  <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Consolidado de todas as operações</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3 ml-14">
              {['Visão total do empresário', 'Independente de CNPJ', 'Comparativo entre segmentos'].map((t) => (
                <span key={t} className="px-2.5 py-1 rounded-full text-[10px] font-medium" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>{t}</span>
              ))}
              <span className="text-[10px] italic" style={{ color: 'var(--text-muted)' }}>Ex: Grupo Imediata</span>
            </div>
          </div>

          {/* Seta */}
          <div className="flex justify-center">
            <ChevronDown className="w-6 h-6" style={{ color: 'var(--text-muted)' }} />
          </div>

          {/* Nível 2 */}
          <div className="card-glass p-5" style={{ borderLeft: '4px solid var(--olive)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="badge badge-olive">Nível 2</span>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Segmento de negócio</h3>
                  <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Definido livremente pelo empresário</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3 ml-14">
              {['Nome e agrupamento livres', 'Pode cruzar CNPJs', 'Resultado consolidado do segmento', 'Comparativo entre unidades do segmento'].map((t) => (
                <span key={t} className="px-2.5 py-1 rounded-full text-[10px] font-medium" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>{t}</span>
              ))}
              <span className="text-[10px] italic" style={{ color: 'var(--text-muted)' }}>Ex: Serviços Financeiros / Varejo / Indústria</span>
            </div>
          </div>

          {/* Seta */}
          <div className="flex justify-center">
            <ChevronDown className="w-6 h-6" style={{ color: 'var(--text-muted)' }} />
          </div>

          {/* Nível 1 */}
          <div className="card-glass p-5" style={{ borderLeft: '4px solid var(--navy-400)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="badge badge-navy">Nível 1</span>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Unidade / Loja</h3>
                  <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Onde os dados são lançados</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3 ml-14">
              {['Lançamentos próprios', 'KPIs da unidade', 'Comparativo com outras unidades do segmento'].map((t) => (
                <span key={t} className="px-2.5 py-1 rounded-full text-[10px] font-medium" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>{t}</span>
              ))}
              <span className="px-2.5 py-1 rounded-full text-[10px] font-medium" style={{ background: 'var(--olive-50)', color: 'var(--olive)' }}>CNPJ vinculado no cadastro</span>
              <span className="text-[10px] italic" style={{ color: 'var(--text-muted)' }}>Ex: Loja Centro / Loja Norte / Loja Sul</span>
            </div>
          </div>

          {/* Nota CNPJ */}
          <div
            className="p-3 rounded-lg text-xs text-center"
            style={{ background: 'var(--olive-50)', color: 'var(--olive-dark)', border: '1px solid var(--olive-200)' }}
          >
            O CNPJ fica registrado no cadastro de cada unidade e alimenta a view tributária — mas não aparece nem interfere na navegação gerencial.
          </div>
        </div>
      </section>

      {/* ═══════ SEÇÃO 3: VISÕES DISPONÍVEIS ═══════ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Visões disponíveis
          </h2>
          <CopyButton sectionId="sec-visoes" />
        </div>
        <div id="sec-visoes" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Visões Gerenciais */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
              Visões gerenciais
            </h3>
            <div className="space-y-2">
              {[
                { titulo: 'Consolidada do grupo', desc: 'Resultado total — todos os segmentos e unidades somados.' },
                { titulo: 'Por segmento', desc: 'Performance de um segmento específico definido pelo empresário.' },
                { titulo: 'Comparativo entre segmentos', desc: 'Side-by-side de rentabilidade, caixa e margem entre os negócios.' },
                { titulo: 'Por unidade', desc: 'Visão operacional individual de uma loja ou filial.' },
                { titulo: 'Comparativo entre unidades', desc: 'Qual unidade performa melhor dentro do mesmo segmento.' },
              ].map((v) => (
                <div key={v.titulo} className="card-glass p-4">
                  <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{v.titulo}</h4>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Visão Tributária */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
              Visão tributária — view específica
            </h3>
            <div className="card-glass p-5" style={{ borderLeft: '3px solid var(--navy)' }}>
              <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Por CNPJ</h4>
              <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                Receita, custo e resultado agrupados pela empresa jurídica. Base para planejamento tributário,
                cálculo de carga por regime (Simples / Lucro Presumido) e exportação para o contador.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ SEÇÃO 4: MOCKUP DE NAVEGAÇÃO ═══════ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Estrutura de navegação — mockup
          </h2>
          <CopyButton sectionId="sec-mockup" />
        </div>
        <div id="sec-mockup" className="card-glass p-0 overflow-hidden">
          <div className="flex">
            {/* Mini Sidebar */}
            <div className="w-52 p-4 flex-shrink-0" style={{ background: 'var(--navy-900)', color: '#ffffff' }}>
              <div className="mb-4">
                <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>Grupo ativo</p>
                <p className="text-sm font-bold mt-0.5">Grupo Imediata</p>
                <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.5)' }}>Visão gerencial consolidada</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Painel</p>
                <p className="text-xs font-semibold py-1 px-2 rounded" style={{ background: 'rgba(255,255,255,0.1)' }}>● Visão geral</p>
                <p className="text-[9px] font-bold uppercase tracking-widest mt-3 mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Módulos</p>
                <p className="text-xs py-1 px-2" style={{ color: 'rgba(255,255,255,0.7)' }}>● Vision Caixa</p>
                <p className="text-xs py-1 px-2" style={{ color: 'rgba(255,255,255,0.7)' }}>● Vision Capital</p>
                <p className="text-xs py-1 px-2" style={{ color: 'rgba(255,255,255,0.7)' }}>● Vision Produção</p>
                <p className="text-xs py-1 px-2" style={{ color: 'rgba(255,255,255,0.7)' }}>● Vision Decisão</p>
                <p className="text-[9px] font-bold uppercase tracking-widest mt-3 mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Tributário</p>
                <p className="text-xs py-1 px-2" style={{ color: '#e07a5f' }}>● Visão por CNPJ</p>
              </div>
            </div>

            {/* Área principal */}
            <div className="flex-1 p-6" style={{ background: 'var(--bg-primary)' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Visão geral</h3>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Grupo Imediata — todos os segmentos</p>
                </div>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-5 gap-3 mb-6">
                {kpisMockup.map((k) => (
                  <div key={k.label} className="p-3 rounded-lg" style={{ border: '1px solid var(--border-primary)' }}>
                    <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{k.label}</p>
                    <p className="text-lg font-extrabold mt-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{k.valor}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: k.cor }}>{k.detalhe}</p>
                    {k.extra && <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{k.extra}</p>}
                  </div>
                ))}
              </div>

              {/* Resultado por segmento */}
              <p className="text-[9px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Resultado por segmento</p>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {segmentosMockup.map((s) => (
                  <div key={s.nome} className="p-3 rounded-lg" style={{ border: '1px solid var(--border-primary)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{s.nome}</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{s.unidades} unidades</p>
                      </div>
                      <StatusBadge status={s.status} />
                    </div>
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between"><span style={{ color: 'var(--text-tertiary)' }}>Receita</span><span className="font-bold" style={{ color: 'var(--text-primary)' }}>{s.receita}</span></div>
                      <div className="flex justify-between"><span style={{ color: 'var(--text-tertiary)' }}>Res. operacional</span><span className="font-bold" style={{ color: 'var(--text-primary)' }}>{s.resOp} <span style={{ color: 'var(--olive)' }}>{s.resOpPct}</span></span></div>
                      <div className="flex justify-between"><span style={{ color: 'var(--text-tertiary)' }}>Res. líquido</span><span className="font-bold" style={{ color: 'var(--text-primary)' }}>{s.resLiq} <span style={{ color: s.status === 'Atenção' ? '#e07a5f' : 'var(--olive)' }}>{s.resLiqPct}</span></span></div>
                      <div className="flex justify-between"><span style={{ color: 'var(--text-tertiary)' }}>Fluxo líquido</span><span className="font-bold" style={{ color: 'var(--text-primary)' }}>{s.fluxo}</span></div>
                    </div>
                    <p className="text-[8px] mt-2" style={{ color: 'var(--text-muted)' }}>
                      Res. operacional = receita − custos e despesas operacionais · Res. líquido = após comprometimento financeiro · Fluxo líquido = entradas − saídas do período
                    </p>
                  </div>
                ))}
              </div>

              {/* Status dos módulos */}
              <p className="text-[9px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Status dos módulos</p>
              <div className="grid grid-cols-2 gap-3">
                {modulosMockup.map((m) => (
                  <div key={m.nome} className="p-3 rounded-lg flex items-start gap-3" style={{ border: '1px solid var(--border-primary)' }}>
                    <div
                      className="w-2 h-2 rounded-full mt-1 flex-shrink-0"
                      style={{
                        background: m.status === 'Saudável' ? 'var(--olive)' : m.status === 'Atenção' ? '#e07a5f' : 'var(--navy)',
                      }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{m.nome}</p>
                        <StatusBadge status={m.status} />
                      </div>
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{m.descricao}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rodapé do mockup */}
          <div className="px-6 py-3 flex items-center gap-4" style={{ background: 'var(--bg-tertiary)', borderTop: '1px solid var(--border-primary)' }}>
            {['Vision Caixa', 'Vision Capital', 'Vision Produção', 'Vision Decisão', 'Visão por CNPJ (tributária)'].map((m, i) => (
              <span key={m} className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                <span className="w-2 h-2 rounded-full" style={{ background: i === 4 ? '#e07a5f' : ['var(--olive)', '#e07a5f', 'var(--olive)', 'var(--navy)'][i] }} />
                {m}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ SEÇÃO INTERATIVA: HIERARQUIA REAL ═══════ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Hierarquia atual — {mockData.nome}
          </h2>
          <div className="flex items-center gap-2">
            <Tooltip text="Alternar visão" position="bottom">
              <button
                onClick={() => setVisaoAtiva(visaoAtiva === 'gerencial' ? 'cnpj' : 'gerencial')}
                className="btn-glass btn-glass-sm flex items-center gap-2"
              >
                <ArrowLeftRight className="w-4 h-4" />
                {visaoAtiva === 'gerencial' ? 'Visão Gerencial' : 'Visão por CNPJ'}
              </button>
            </Tooltip>
            <Tooltip text="Expandir todos" position="bottom">
              <button onClick={expandAll} className="btn-glass btn-glass-sm flex items-center gap-2">
                <Eye className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip text="Recolher todos" position="bottom">
              <button onClick={collapseAll} className="btn-glass btn-glass-sm flex items-center gap-2">
                <EyeOff className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="card-glass p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Segmentos</span>
              <Layers className="w-4 h-4" style={{ color: 'var(--navy)' }} />
            </div>
            <p className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{mockData.segmentos.length}</p>
          </div>
          <div className="card-glass p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Unidades</span>
              <Store className="w-4 h-4" style={{ color: 'var(--navy)' }} />
            </div>
            <p className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{totalUnidades}</p>
          </div>
          <div className="card-glass p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Ativas</span>
              <Building2 className="w-4 h-4" style={{ color: 'var(--olive)' }} />
            </div>
            <p className="text-3xl font-extrabold" style={{ color: 'var(--olive)', fontFamily: 'var(--font-display)' }}>{totalAtivas}</p>
          </div>
        </div>

        {/* Grupo */}
        <div className="card-glass p-6 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--navy), var(--navy-light))' }}>
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Nível 3 — Grupo</span>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{mockData.nome}</h2>
            </div>
          </div>
        </div>

        {/* Segmentos */}
        <div className="space-y-4">
          {mockData.segmentos.map((segmento) => {
            const isExpanded = expandedSegmentos.has(segmento.id)
            const ativas = segmento.unidades.filter((u) => u.status === 'ativo').length
            return (
              <div key={segmento.id} className="card-glass overflow-hidden">
                <button
                  onClick={() => toggleSegmento(segmento.id)}
                  className="w-full p-5 flex items-center justify-between text-left transition-colors duration-200"
                  style={{ borderBottom: isExpanded ? '1px solid var(--border-primary)' : 'none' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--olive), var(--olive-light))' }}>
                      <Layers className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Nível 2 — Segmento</span>
                      <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{segmento.nome}</h3>
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{segmento.descricao}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="badge badge-olive">{ativas}/{segmento.unidades.length} ativas</span>
                    {isExpanded ? <ChevronDown className="w-5 h-5" style={{ color: 'var(--text-muted)' }} /> : <ChevronRight className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />}
                  </div>
                </button>
                {isExpanded && (
                  <div className="p-5 space-y-3">
                    {segmento.unidades.map((unidade) => (
                      <div
                        key={unidade.id}
                        className="p-4 rounded-xl transition-all duration-300 hover:translate-x-1"
                        style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                              style={{
                                background: unidade.status === 'ativo'
                                  ? 'linear-gradient(135deg, var(--navy-400), var(--navy-500))'
                                  : 'linear-gradient(135deg, #94a3b8, #64748b)',
                              }}
                            >
                              <Store className="w-3.5 h-3.5 text-white" />
                            </div>
                            <div>
                              <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Nível 1 — Unidade</span>
                              <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{unidade.nome}</h4>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                                <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-tertiary)' }}><Hash className="w-3 h-3" />{unidade.cnpj}</span>
                                <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-tertiary)' }}><MapPin className="w-3 h-3" />{unidade.cidade}/{unidade.uf}</span>
                                <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-tertiary)' }}><Users className="w-3 h-3" />{unidade.responsavel}</span>
                              </div>
                            </div>
                          </div>
                          <span className={`badge ${unidade.status === 'ativo' ? 'badge-olive' : 'badge-warning'}`}>
                            {unidade.status === 'ativo' ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
