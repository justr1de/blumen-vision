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
        { id: 'u3', nome: 'Imediata Filial Sul', cnpj: '12.345.678/0003-63', cidade: 'Uberlândia', uf: 'MG', status: 'inativo', responsavel: 'Pedro Santos' },
      ],
    },
    {
      id: 's2',
      nome: 'Varejo',
      descricao: 'Lojas de varejo e comércio',
      unidades: [
        { id: 'u4', nome: 'Loja Centro', cnpj: '98.765.432/0001-10', cidade: 'Goiânia', uf: 'GO', status: 'ativo', responsavel: 'Maria Oliveira' },
        { id: 'u5', nome: 'Loja Shopping', cnpj: '98.765.432/0002-00', cidade: 'Anápolis', uf: 'GO', status: 'ativo', responsavel: 'João Ferreira' },
      ],
    },
    {
      id: 's3',
      nome: 'Indústria',
      descricao: 'Produção e manufatura',
      unidades: [
        { id: 'u6', nome: 'Fábrica Central', cnpj: '11.222.333/0001-44', cidade: 'Aparecida de Goiânia', uf: 'GO', status: 'ativo', responsavel: 'Roberto Lima' },
      ],
    },
  ],
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

  const expandAll = () => {
    setExpandedSegmentos(new Set(mockData.segmentos.map((s) => s.id)))
  }

  const collapseAll = () => {
    setExpandedSegmentos(new Set())
  }

  const totalUnidades = mockData.segmentos.reduce((acc, s) => acc + s.unidades.length, 0)
  const totalAtivas = mockData.segmentos.reduce((acc, s) => acc + s.unidades.filter((u) => u.status === 'ativo').length, 0)

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
            <Network className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Arquitetura Organizacional
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              Hierarquia de negócios: Grupo → Segmento → Unidade
            </p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div
        className="card-glass p-4 mb-6 flex items-start gap-3"
        style={{ borderLeft: '3px solid var(--olive)' }}
      >
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--olive)' }} />
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Duas visões disponíveis
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
            <strong>Visão Gerencial:</strong> organizada pelo empresário (Grupo → Segmento → Unidade), independente de CNPJ.{' '}
            <strong>Visão por CNPJ:</strong> agrupa por empresa jurídica, útil para planejamento tributário e exportação contábil.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        {/* Visão Toggle */}
        <div className="flex items-center gap-2">
          <Tooltip text="Alternar entre visão gerencial e visão por CNPJ" position="bottom">
            <button
              onClick={() => setVisaoAtiva(visaoAtiva === 'gerencial' ? 'cnpj' : 'gerencial')}
              className="btn-glass btn-glass-sm flex items-center gap-2"
            >
              <ArrowLeftRight className="w-4 h-4" />
              {visaoAtiva === 'gerencial' ? 'Visão Gerencial' : 'Visão por CNPJ'}
            </button>
          </Tooltip>
        </div>

        {/* Expand/Collapse */}
        <div className="flex items-center gap-2">
          <Tooltip text="Expandir todos os segmentos" position="bottom">
            <button onClick={expandAll} className="btn-glass btn-glass-sm flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Expandir
            </button>
          </Tooltip>
          <Tooltip text="Recolher todos os segmentos" position="bottom">
            <button onClick={collapseAll} className="btn-glass btn-glass-sm flex items-center gap-2">
              <EyeOff className="w-4 h-4" />
              Recolher
            </button>
          </Tooltip>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card-glass p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Segmentos
            </span>
            <Layers className="w-4 h-4" style={{ color: 'var(--navy)' }} />
          </div>
          <p className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            {mockData.segmentos.length}
          </p>
        </div>
        <div className="card-glass p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Unidades
            </span>
            <Store className="w-4 h-4" style={{ color: 'var(--navy)' }} />
          </div>
          <p className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            {totalUnidades}
          </p>
        </div>
        <div className="card-glass p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Unidades Ativas
            </span>
            <Building2 className="w-4 h-4" style={{ color: 'var(--olive)' }} />
          </div>
          <p className="text-3xl font-extrabold" style={{ color: 'var(--olive)', fontFamily: 'var(--font-display)' }}>
            {totalAtivas}
          </p>
        </div>
      </div>

      {/* Nível 3 — Grupo */}
      <div className="card-glass p-6 mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--navy), var(--navy-light))' }}
          >
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Nível 3 — Grupo
            </span>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {mockData.nome}
            </h2>
          </div>
        </div>
        <p className="text-xs ml-11" style={{ color: 'var(--text-tertiary)' }}>
          Visão consolidada de todas as operações do grupo empresarial
        </p>
      </div>

      {/* Nível 2 — Segmentos */}
      <div className="space-y-4">
        {mockData.segmentos.map((segmento) => {
          const isExpanded = expandedSegmentos.has(segmento.id)
          const ativas = segmento.unidades.filter((u) => u.status === 'ativo').length

          return (
            <div key={segmento.id} className="card-glass overflow-hidden">
              {/* Segmento Header */}
              <button
                onClick={() => toggleSegmento(segmento.id)}
                className="w-full p-5 flex items-center justify-between text-left transition-colors duration-200"
                style={{ borderBottom: isExpanded ? '1px solid var(--border-primary)' : 'none' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, var(--olive), var(--olive-light))' }}
                  >
                    <Layers className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                      Nível 2 — Segmento
                    </span>
                    <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                      {segmento.nome}
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      {segmento.descricao}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="badge badge-olive">{ativas}/{segmento.unidades.length} ativas</span>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                  ) : (
                    <ChevronRight className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                  )}
                </div>
              </button>

              {/* Nível 1 — Unidades */}
              {isExpanded && (
                <div className="p-5 space-y-3">
                  {segmento.unidades.map((unidade) => (
                    <div
                      key={unidade.id}
                      className="p-4 rounded-xl transition-all duration-300 hover:translate-x-1"
                      style={{
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-primary)',
                      }}
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
                            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                              Nível 1 — Unidade
                            </span>
                            <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                              {unidade.nome}
                            </h4>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                              <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                <Hash className="w-3 h-3" />
                                {unidade.cnpj}
                              </span>
                              <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                <MapPin className="w-3 h-3" />
                                {unidade.cidade}/{unidade.uf}
                              </span>
                              <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                <Users className="w-3 h-3" />
                                {unidade.responsavel}
                              </span>
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

      {/* Legenda */}
      <div className="card-glass p-5 mt-8">
        <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
          <FileText className="w-4 h-4 inline mr-2" style={{ color: 'var(--navy)' }} />
          Legenda da Hierarquia
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--navy), var(--navy-light))' }}
            >
              <Building2 className="w-3 h-3 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Nível 3 — Grupo</p>
              <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>O empresário como um todo. Visão consolidada, independente de CNPJ.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--olive), var(--olive-light))' }}
            >
              <Layers className="w-3 h-3 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Nível 2 — Segmento</p>
              <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Definido livremente. Pode cruzar CNPJs ou ter CNPJs próprios.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--navy-400), var(--navy-500))' }}
            >
              <Store className="w-3 h-3 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Nível 1 — Unidade</p>
              <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Onde os dados são lançados. Tem CNPJ vinculado para view tributária.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
