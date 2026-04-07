'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import DarkLogo from '@/components/DarkLogo'
import ThemeToggle from '@/components/ThemeToggle'
import DataRoFooter from '@/components/DataRoFooter'

const modulos = [
  {
    id: 'vision-caixa',
    nome: 'Vision Caixa',
    subtitulo: 'Fluxo de Caixa & Controle Financeiro',
    headline: 'O caixa de hoje você já sabe. O problema é o de amanhã.',
    descricao:
      'Entrada, saída, parcela a vencer, conta a pagar — tudo acontece ao mesmo tempo e a sensação é de que você está sempre um passo atrás. O Vision Caixa transforma o fluxo de caixa num instrumento de decisão: acompanhe todas as contas do grupo numa visão consolidada, antecipe vencimentos antes que virem problema e saiba com clareza se o caixa cobre os próximos dias — ou não.',
    destaques: [
      'Visão consolidada de todas as contas do grupo',
      'Antecipação de vencimentos e alertas',
      'Projeção de fluxo de caixa',
      'Clareza sobre cobertura dos próximos dias',
    ],
    iconPath: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
    iconType: 'path-line' as const,
    cor: '#1D3B5F',
    corLight: 'rgba(29, 59, 95, 0.08)',
    badge: 'Em breve',
    badgeStyle: 'olive' as const,
    href: null,
  },
  {
    id: 'vision-producao',
    nome: 'Vision Produção',
    subtitulo: 'Margem, Custos & Equipe',
    headline: 'Você sabe qual produto do seu negócio realmente dá lucro? Não receita — lucro.',
    descricao:
      'A maioria dos empresários conhece o faturamento mas não conhece a margem real de cada produto, serviço ou unidade. Vende muito o que sobra pouco, mantém o que come o resultado e corta o que sustenta o negócio — sem perceber. O Vision Produção conecta vendas, custos, precificação e equipe numa visão integrada, para que você saiba exatamente onde o negócio ganha, onde perde e o que vale a pena escalar.',
    destaques: [
      'Margem real por produto, serviço ou unidade',
      'Conexão entre vendas, custos e precificação',
      'Visão integrada de equipe e operação',
      'Identificação do que vale a pena escalar',
    ],
    iconPath: 'gear',
    iconType: 'gear' as const,
    cor: '#8B6914',
    corLight: 'rgba(139, 105, 20, 0.08)',
    badge: 'Em breve',
    badgeStyle: 'olive' as const,
    href: null,
  },
  {
    id: 'vision-capital',
    nome: 'Vision Capital',
    subtitulo: 'Patrimônio, Dívidas & Investimentos',
    headline: 'Você sabe quanto o seu negócio vale? Não o faturamento — o que ele realmente vale.',
    descricao:
      'Patrimônio parado, dívidas que crescem sem que ninguém acompanhe e investimentos tomados mais por intuição do que por critério. O Vision Capital organiza o que você possui, o que deve e o que está comprometido — para que cada decisão de investimento, financiamento ou crescimento seja tomada com a mesma clareza que um gestor de grandes empresas tem à disposição.',
    destaques: [
      'Organização de patrimônio e dívidas',
      'Acompanhamento de investimentos',
      'Comprometimento financeiro consolidado',
      'Clareza para decisões de crescimento',
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
    id: 'vision-decisao',
    nome: 'Vision Decisão',
    subtitulo: 'Visão Gerencial Completa',
    headline: 'Ter informação não é o mesmo que ter visão. E decidir sem visão é uma aposta.',
    descricao:
      'Caixa num lugar, resultado noutro, patrimônio na memória — cada parte do negócio conta uma história diferente e você fica tentando montar o quadro sozinho. O Vision Decisão integra todos os módulos numa visão gerencial completa: resultado, margem e fluxo lado a lado, com projeções e simulação de cenários para que você não fique só olhando o que já aconteceu — mas antecipe o que pode acontecer e decida antes que o problema chegue.',
    destaques: [
      'Integração de todos os módulos',
      'Resultado, margem e fluxo lado a lado',
      'Projeções e simulação de cenários',
      'Antecipação de problemas e oportunidades',
    ],
    iconPath: 'compass',
    iconType: 'compass' as const,
    cor: '#4A6FA5',
    corLight: 'rgba(74, 111, 165, 0.08)',
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
  if (type === 'compass') {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" stroke="none" />
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
                  Plataforma de Inteligência Empresarial
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
                  className="block text-lg sm:text-xl mt-3 italic"
                  style={{
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 300,
                    letterSpacing: '0.08em',
                  }}
                >
                  Ver. Entender. Decidir.
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
                Você cuida do negócio todo dia. Mas quem te dá a visão de como ele realmente funciona?
              </p>

              <p
                className="opacity-0 animate-fade-in-up mt-4 text-sm max-w-2xl mx-auto leading-relaxed"
                style={{
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 300,
                  animationDelay: '450ms',
                }}
              >
                Todo empresário assume dois papéis: o de diretor — que opera, resolve, aprova e apaga incêndio — e o de presidente, que precisa enxergar o todo e decidir o futuro. O problema é que um consome o tempo do outro. O Blúmen Vision foi construído para os dois momentos: para o diretor que precisa controlar o presente e para o presidente que precisa decidir o futuro.
              </p>
        </div>
      </section>

      {/* ===== DESTAQUE ===== */}
      <section className="pb-12 sm:pb-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div
            className="opacity-0 animate-fade-in-up py-6 rounded-xl"
            style={{
              background: 'var(--navy, #1D3B5F)',
              animationDelay: '500ms',
              animationFillMode: 'forwards',
            }}
          >
            <p
              className="text-lg sm:text-xl tracking-[0.15em] uppercase font-semibold"
              style={{
                color: '#ffffff',
                fontFamily: 'var(--font-display)',
              }}
            >
              Ver. Entender. Decidir.
            </p>
          </div>
        </div>
      </section>

      {/* ===== SEÇÃO "OS MÓDULOS" ===== */}
      <section className="pb-8 sm:pb-12">
        <div className="max-w-5xl mx-auto px-6">
          <p
            className="text-[11px] tracking-[0.35em] uppercase mb-2"
            style={{
              color: 'var(--olive)',
              fontFamily: 'var(--font-body)',
              fontWeight: 700,
            }}
          >
            Os Módulos
          </p>
          <div className="h-px" style={{ background: 'var(--border-primary)' }} />
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
                    animationDelay: `${(i + 3) * 150}ms`,
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
                              background: 'var(--olive)',
                              color: '#ffffff',
                            }}
                          >
                            {modulo.badge}
                          </span>
                        </div>

                        {/* Headline do módulo */}
                        <h4
                          className="text-base sm:text-lg font-semibold mb-4"
                          style={{
                            color: 'var(--olive)',
                            fontFamily: 'var(--font-display)',
                          }}
                        >
                          {modulo.headline}
                        </h4>

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
            className="rounded-xl py-8 px-6 mb-8"
            style={{
              background: 'linear-gradient(135deg, rgba(29,59,95,0.85) 0%, rgba(29,59,95,0.95) 40%, rgba(22,48,78,0.9) 100%)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 4px 24px rgba(29,59,95,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            <p
              className="text-base sm:text-lg font-semibold"
              style={{
                color: '#ffffff',
                fontFamily: 'var(--font-display)',
              }}
            >
              Blúmen Vision · Plataforma de Inteligência Empresarial
            </p>
            <p
              className="text-sm mt-2 italic"
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontFamily: 'var(--font-display)',
              }}
            >
              Ver. Entender. <span style={{ color: 'var(--olive, #6F963E)', fontWeight: 600 }}>Decidir.</span> · Blúmen Biz © 2026
            </p>
          </div>

          <DarkLogo
            lightSrc="/logo-camila-arnuti.png"
            darkSrc="/logo-camila-arnuti-white.png"
            alt="Camila Arnuti"
            width={100}
            height={30}
            className="h-5 w-auto mx-auto opacity-30"
          />
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
          <div className="mt-6">
            <DataRoFooter />
          </div>
        </div>
      </footer>
    </div>
  )
}
