'use client'

import Link from 'next/link'

const modulos = [
  {
    nome: 'Blúmen Financeiro',
    descricao:
      'Auditoria, conciliação de empréstimos e identificação automática de divergências nos lançamentos.',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    cor: '#1D3B5F',
    badge: 'Ativo',
    badgeStyle: 'navy',
  },
  {
    nome: 'Blúmen Pessoas',
    descricao:
      'Gestão de pessoas, colaboradores e estrutura organizacional com visão estratégica.',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    cor: '#6B8F71',
    badge: 'Em breve',
    badgeStyle: 'olive',
  },
  {
    nome: 'Blúmen Operação',
    descricao:
      'Controle operacional de processos, fluxos de trabalho e indicadores de desempenho.',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    cor: '#8B6914',
    badge: 'Em breve',
    badgeStyle: 'olive',
  },
  {
    nome: 'Blúmen Fluxo de Receita',
    descricao:
      'Controle de receitas, projeções financeiras e análise de fluxo de caixa em tempo real.',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    cor: '#4A6FA5',
    badge: 'Em breve',
    badgeStyle: 'olive',
  },
]

export default function BlumenVisionSection() {
  return (
    <section
      id="blumen-vision"
      className="relative py-28 sm:py-36"
      style={{
        zIndex: 1,
        background: 'var(--section-gradient-2)',
      }}
    >
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <p
            className="text-[11px] tracking-[0.3em] uppercase mb-6"
            style={{
              color: 'var(--olive)',
              fontFamily: 'var(--font-body)',
              fontWeight: 700,
            }}
          >
            Ecossistema
          </p>
          <h2
            className="text-3xl sm:text-4xl leading-tight mb-4"
            style={{
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-display)',
              fontWeight: 400,
            }}
          >
            Bl&uacute;men{' '}
            <span style={{ color: 'var(--olive)', fontWeight: 500 }}>
              Vision
            </span>
          </h2>
          <p
            className="text-base max-w-2xl mx-auto leading-relaxed"
            style={{
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-body)',
              fontWeight: 300,
            }}
          >
            Plataforma integrada de gest&atilde;o. Quatro m&oacute;dulos que
            transformam dados em decis&otilde;es estrat&eacute;gicas para o seu
            neg&oacute;cio.
          </p>
        </div>

        {/* Grid de módulos */}
        <div className="grid sm:grid-cols-2 gap-8 mb-16">
          {modulos.map((modulo, i) => (
            <div
              key={i}
              className="group relative rounded-2xl border p-8 transition-all duration-500 cursor-default"
              style={{
                background: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget
                el.style.borderColor = modulo.cor
                el.style.transform = 'translateY(-4px)'
                el.style.boxShadow = `0 12px 40px ${modulo.cor}18`
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget
                el.style.borderColor = 'var(--border-primary)'
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = 'none'
              }}
            >
              {/* Badge */}
              <div className="flex items-start justify-between mb-6">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{
                    background: `${modulo.cor}12`,
                    color: modulo.cor,
                  }}
                >
                  {modulo.icon}
                </div>
                <span
                  className="text-[10px] tracking-[0.15em] uppercase px-3 py-1 rounded-full"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontWeight: 700,
                    background:
                      modulo.badgeStyle === 'navy'
                        ? 'var(--navy)'
                        : `var(--olive)`,
                    color: '#ffffff',
                  }}
                >
                  {modulo.badge}
                </span>
              </div>

              {/* Conteúdo */}
              <h3
                className="text-xl mb-3"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                }}
              >
                {modulo.nome}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 300,
                }}
              >
                {modulo.descricao}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/blumen-vision/suit"
            className="inline-flex items-center justify-center gap-3 transition-all duration-400"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 500,
              letterSpacing: '0.04em',
              fontSize: '0.9375rem',
              padding: '14px 40px',
              borderRadius: '8px',
              border: '1.5px solid var(--navy)',
              color: 'var(--text-primary)',
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--navy)'
              e.currentTarget.style.color = '#ffffff'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow =
                '0 4px 16px rgba(29,59,95,0.25)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--text-primary)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            Acessar Bl&uacute;men Vision
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
