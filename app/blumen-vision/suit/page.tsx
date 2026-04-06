'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import DarkLogo from '@/components/DarkLogo'
import ThemeToggle from '@/components/ThemeToggle'

const modulos = [
  {
    id: 'vision-caixa',
    nome: 'Vision Caixa',
    subtitulo: 'Auditoria & Conciliação',
    descricao:
      'Auditoria e conciliação de repasses financeiros. Identifique divergências, cruze dados de produção e FLAT, e tenha controle total sobre comissões e valores.',
    destaques: [
      'Cruzamento automático por contrato, CPF e ADE',
      'Identificação de divergências de valores',
      'Relatórios gerenciais personalizados',
      'Processamento em menos de 3 segundos',
    ],
    iconPath: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
    iconType: 'path-line' as const,
    cor: '#1D3B5F',
    corLight: 'rgba(29, 59, 95, 0.08)',
    badge: 'Ativo',
    badgeStyle: 'navy' as const,
    href: '/login',
  },
  {
    id: 'vision-capital',
    nome: 'Vision Capital',
    subtitulo: 'Gestão de Capital',
    descricao:
      'Endividamento, investimentos e comprometimento financeiro. Controle de capital de giro, análise de dívidas e planejamento de investimentos estratégicos.',
    destaques: [
      'Controle de endividamento e capital de giro',
      'Análise de investimentos e retornos',
      'Comprometimento financeiro consolidado',
      'Planejamento estratégico de capital',
    ],
    iconPath: 'piggybank',
    iconType: 'piggybank' as const,
    cor: '#6B8F71',
    corLight: 'rgba(107, 143, 113, 0.08)',
    badge: 'Em breve',
    badgeStyle: 'olive' as const,
    href: null,
  },
  {
    id: 'vision-producao',
    nome: 'Vision Produção',
    subtitulo: 'Controle Operacional & Pessoas',
    descricao:
      'Margem, folha de pagamento, custos operacionais e gestão de pessoas. Acompanhe o ciclo de vida das operações, colaboradores e indicadores de desempenho em tempo real.',
    destaques: [
      'Margem e custos operacionais',
      'Gestão de folha de pagamento',
      'Monitoramento de status em tempo real',
      'Indicadores de desempenho operacional',
    ],
    iconPath: 'gear',
    iconType: 'gear' as const,
    cor: '#8B6914',
    corLight: 'rgba(139, 105, 20, 0.08)',
    badge: 'Em breve',
    badgeStyle: 'olive' as const,
    href: null,
  },

]

function ModuleIcon({ type, path }: { type: string; path: string }) {
  const props = {
    xmlns: 'http://www.w3.org/2000/svg',
    width: 32,
    height: 32,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  if (type === 'path-line') {
    return (
      <svg {...props}>
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    )
  }
  if (type === 'users') {
    return (
      <svg {...props}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  }
  if (type === 'gear') {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    )
  }
  if (type === 'piggybank') {
    return (
      <svg {...props}>
        <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2" />
        <path d="M2 9.5a2.5 2.5 0 0 1 0 5" />
        <circle cx="15.5" cy="9.5" r="1" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg {...props}>
      <polyline points={path} />
    </svg>
  )
}

export default function BlumenVisionSuitPage() {
  const [mounted, setMounted] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navSolid = scrollY > 40

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* ===== NAVBAR ===== */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          navSolid ? 'backdrop-blur-xl shadow-sm' : ''
        }`}
        style={{
          background: navSolid
            ? 'color-mix(in srgb, var(--bg-primary) 90%, transparent)'
            : 'transparent',
          borderBottom: navSolid
            ? '1px solid var(--border-primary)'
            : '1px solid transparent',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <DarkLogo
              lightSrc="/logo-blumen-biz.png"
              darkSrc="/logo-blumen-biz-white.png"
              alt="Blúmen Biz"
              width={140}
              height={40}
              className="h-9 w-auto"
            />
          </Link>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-5">
              <Link
                href="/#solucao"
                className="text-xs tracking-[0.12em] uppercase transition-colors duration-300"
                style={{
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--olive)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }}
              >
                Solução
              </Link>
              <span
                className="text-xs tracking-[0.12em] uppercase"
                style={{
                  color: 'var(--olive)',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 700,
                }}
              >
                Blúmen Vision
              </span>
              <Link
                href="/#contato"
                className="text-xs tracking-[0.12em] uppercase transition-colors duration-300"
                style={{
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--olive)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }}
              >
                Contato
              </Link>
            </div>

            <div
              className="w-px h-5 hidden md:block"
              style={{ background: 'var(--border-secondary)' }}
            />

            <DarkLogo
              lightSrc="/logo-camila-arnuti.png"
              darkSrc="/logo-camila-arnuti-white.png"
              alt="Camila Arnuti"
              width={110}
              height={32}
              className="h-7 w-auto hidden sm:block"
            />

            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="pt-32 pb-16 sm:pt-40 sm:pb-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
              <div className="opacity-0 animate-fade-in-up">
                <p
                  className="text-[11px] tracking-[0.35em] uppercase mb-6"
                  style={{
                    color: 'var(--olive)',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 700,
                  }}
                >
                  Ecossistema de Gestão
                </p>
              </div>

              <h1
                className="opacity-0 animate-fade-in-up"
                style={{ animationDelay: '100ms' }}
              >
                <span
                  className="block text-4xl sm:text-5xl lg:text-6xl leading-[1.1] tracking-tight"
                  style={{
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 300,
                  }}
                >
                  Blúmen{' '}
                  <span style={{ color: 'var(--olive)', fontWeight: 500 }}>
                    Vision
                  </span>
                </span>
                <span
                  className="block text-lg sm:text-xl mt-3"
                  style={{
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 300,
                    letterSpacing: '0.08em',
                  }}
                >
                  Suite
                </span>
              </h1>

              <p
                className="opacity-0 animate-fade-in-up mt-8 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
                style={{
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 300,
                  animationDelay: '300ms',
                }}
              >
                Três módulos integrados que transformam dados brutos em
                decisões estratégicas. Da auditoria financeira à gestão de
                capital, cada módulo foi desenhado para oferecer clareza e
                precisão.
              </p>
        </div>
      </section>

      {/* ===== GRID DE MÓDULOS ===== */}
      <section className="pb-20 sm:pb-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid gap-8">
            {modulos.map((modulo, i) => {
              const isActive = modulo.badge === 'Ativo'
              return (
                <div
                  key={modulo.id}
                  className="opacity-0 animate-fade-in-up rounded-2xl border transition-all duration-500"
                  style={{
                    background: 'var(--bg-secondary)',
                    borderColor: 'var(--border-primary)',
                    animationDelay: `${(i + 2) * 150}ms`,
                    animationFillMode: 'forwards',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget
                    el.style.borderColor = modulo.cor
                    el.style.transform = 'translateY(-4px)'
                    el.style.boxShadow = `0 16px 48px ${modulo.cor}15`
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget
                    el.style.borderColor = 'var(--border-primary)'
                    el.style.transform = 'translateY(0)'
                    el.style.boxShadow = 'none'
                  }}
                >
                  <div className="p-8 sm:p-10">
                    <div className="flex flex-col sm:flex-row gap-8">
                      {/* Lado esquerdo: ícone + info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div
                              className="w-16 h-16 rounded-xl flex items-center justify-center"
                              style={{
                                background: modulo.corLight,
                                color: modulo.cor,
                              }}
                            >
                              <ModuleIcon
                                type={modulo.iconType}
                                path={modulo.iconPath}
                              />
                            </div>
                            <div>
                              <p
                                className="text-[10px] tracking-[0.2em] uppercase mb-1"
                                style={{
                                  color: modulo.cor,
                                  fontFamily: 'var(--font-body)',
                                  fontWeight: 700,
                                }}
                              >
                                {modulo.subtitulo}
                              </p>
                              <h3
                                className="text-xl sm:text-2xl"
                                style={{
                                  fontFamily: 'var(--font-display)',
                                  fontWeight: 500,
                                  color: 'var(--text-primary)',
                                }}
                              >
                                {modulo.nome}
                              </h3>
                            </div>
                          </div>
                          <span
                            className="text-[10px] tracking-[0.15em] uppercase px-3 py-1 rounded-full shrink-0"
                            style={{
                              fontFamily: 'var(--font-body)',
                              fontWeight: 700,
                              background:
                                modulo.badgeStyle === 'navy'
                                  ? 'var(--navy)'
                                  : 'var(--olive)',
                              color: '#ffffff',
                            }}
                          >
                            {modulo.badge}
                          </span>
                        </div>

                        <p
                          className="text-sm leading-relaxed mb-6"
                          style={{
                            color: 'var(--text-secondary)',
                            fontFamily: 'var(--font-body)',
                            fontWeight: 300,
                            lineHeight: 1.8,
                          }}
                        >
                          {modulo.descricao}
                        </p>

                        {/* Destaques */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {modulo.destaques.map((destaque, j) => (
                            <div
                              key={j}
                              className="flex items-start gap-2"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke={modulo.cor}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="mt-0.5 shrink-0"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              <span
                                className="text-xs leading-relaxed"
                                style={{
                                  color: 'var(--text-secondary)',
                                  fontFamily: 'var(--font-body)',
                                  fontWeight: 400,
                                }}
                              >
                                {destaque}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Botão de ação */}
                    <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--border-primary)' }}>
                      {isActive ? (
                        <Link
                          href={modulo.href!}
                          className="inline-flex items-center gap-3 transition-all duration-300"
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontWeight: 500,
                            letterSpacing: '0.04em',
                            fontSize: '0.875rem',
                            padding: '10px 28px',
                            borderRadius: '8px',
                            border: `1.5px solid ${modulo.cor}`,
                            color: modulo.cor,
                            background: 'transparent',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = modulo.cor
                            e.currentTarget.style.color = '#ffffff'
                            e.currentTarget.style.transform = 'translateY(-2px)'
                            e.currentTarget.style.boxShadow = `0 4px 16px ${modulo.cor}40`
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent'
                            e.currentTarget.style.color = modulo.cor
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = 'none'
                          }}
                        >
                          Acessar módulo
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
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
                      ) : (
                        <span
                          className="inline-flex items-center gap-2 text-sm"
                          style={{
                            color: 'var(--text-muted)',
                            fontFamily: 'var(--font-body)',
                            fontWeight: 500,
                            letterSpacing: '0.02em',
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          Disponível em breve
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Linha decorativa inferior */}
                  <div
                    className="h-[3px] rounded-b-2xl transition-all duration-500"
                    style={{
                      background: `linear-gradient(90deg, ${modulo.cor}00, ${modulo.cor}, ${modulo.cor}00)`,
                      opacity: 0.3,
                    }}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="pb-12">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div
            className="h-px max-w-xs mx-auto mb-8"
            style={{ background: 'var(--border-primary)' }}
          />
          <DarkLogo
            lightSrc="/logo-camila-arnuti.png"
            darkSrc="/logo-camila-arnuti-white.png"
            alt="Camila Arnuti"
            width={100}
            height={30}
            className="h-5 w-auto mx-auto opacity-30"
          />
          <p
            className="text-xs mt-3"
            style={{
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-body)',
              opacity: 0.5,
            }}
          >
            Blúmen Vision Suite — Plataforma Integrada de Gestão
          </p>
          <Link
            href="/"
            className="inline-block mt-4 text-xs transition-colors duration-300"
            style={{
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--olive)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)'
            }}
          >
            ← Voltar para a página inicial
          </Link>
        </div>
      </footer>
    </div>
  )
}
