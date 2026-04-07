'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import DarkLogo from '@/components/DarkLogo'
import ThemeToggle from '@/components/ThemeToggle'
import TypeWriter from '@/components/TypeWriter'
import ChatConversation from '@/components/ChatConversation'
import BlumenVisionSection from '@/components/BlumenVisionSection'
import DataRoFooter from '@/components/DataRoFooter'

const MatrixRain = dynamic(() => import('@/components/MatrixRain'), { ssr: false })

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })

    // Observar mudanças de tema para trocar a imagem do hero
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    checkTheme()
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      observer.disconnect()
    }
  }, [])

  const navSolid = scrollY > 60

  return (
    <div className="relative min-h-screen overflow-x-hidden">

      {/* ===== NÚMEROS CAINDO ===== */}
      <MatrixRain />

      {/* ===== NAVBAR ===== */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          navSolid ? 'backdrop-blur-xl shadow-sm' : ''
        }`}
        style={{
          background: navSolid
            ? 'color-mix(in srgb, var(--bg-primary) 90%, transparent)'
            : 'transparent',
          borderBottom: navSolid ? '1px solid var(--border-primary)' : '1px solid transparent',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo Blúmen Biz — esquerda */}
          <DarkLogo
            lightSrc="/logo-blumen-biz.png"
            darkSrc="/logo-blumen-biz-white.png"
            alt="Blúmen Biz"
            width={140}
            height={40}
            className="h-9 w-auto flex-shrink-0"
          />

          {/* Links de navegação — centralizados */}
          <div className="hidden md:flex items-center gap-5 absolute left-1/2 -translate-x-1/2">
            <a
              href="#solucao"
              className="text-xs tracking-[0.12em] uppercase transition-colors duration-300"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontWeight: 700, textShadow: '0 0 8px rgba(255,255,255,0.6)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--olive)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-primary)' }}
            >
              Solução
            </a>
            <a
              href="/blumen-vision/suit"
              className="text-xs tracking-[0.12em] uppercase transition-colors duration-300"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontWeight: 700, textShadow: '0 0 8px rgba(255,255,255,0.6)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--olive)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-primary)' }}
            >
              Blúmen Vision
            </a>
            <a
              href="#contato"
              className="text-xs tracking-[0.12em] uppercase transition-colors duration-300"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontWeight: 700, textShadow: '0 0 8px rgba(255,255,255,0.6)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--olive)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-primary)' }}
            >
              Contato
            </a>
          </div>

          {/* Logo Camila Arnuti + Toggle — direita */}
          <div className="flex items-center gap-4 flex-shrink-0">
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

      {/* ===== HERO COM IMAGEM DIA/NOITE ===== */}
      <section className="relative min-h-screen flex items-end overflow-hidden">
        {/* Imagem de fundo — DIA (modo claro) */}
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: isDark ? 0 : 1 }}
        >
          <Image
            src="/hero-office-day.jpg"
            alt="Escritório corporativo diurno"
            fill
            className="object-cover"
            priority
          />
          {/* Overlay claro — reduzido para preservar contraste da imagem */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to top, rgba(250,251,252,0.92) 0%, rgba(250,251,252,0.55) 30%, rgba(250,251,252,0.15) 55%, rgba(250,251,252,0.0) 100%)',
            }}
          />
        </div>

        {/* Imagem de fundo — NOITE (modo escuro) */}
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: isDark ? 1 : 0 }}
        >
          <Image
            src="/hero-office.jpg"
            alt="Escritório corporativo noturno"
            fill
            className="object-cover"
            priority
          />
          {/* Overlay escuro */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to top, rgba(12,18,32,0.97) 0%, rgba(12,18,32,0.75) 30%, rgba(12,18,32,0.4) 60%, rgba(12,18,32,0.2) 100%)',
            }}
          />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 pb-24 pt-32 w-full" style={{ zIndex: 2 }}>
          {mounted && (
            <>
              <div className="opacity-0 animate-fade-in-up">
                <p
                  className="text-[11px] tracking-[0.35em] uppercase mb-8"
                  style={{ color: 'var(--olive)', fontFamily: 'var(--font-body)', fontWeight: 700 }}
                >
                  Auditoria &amp; Concilia&ccedil;&atilde;o
                </p>
              </div>

              <h1 className="opacity-0 animate-fade-in-up animate-delay-100">
                <span
                  className="block text-4xl sm:text-5xl lg:text-6xl leading-[1.1] tracking-tight"
                  style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontWeight: 300 }}
                >
                  Auditoria financeira
                </span>
                <span
                  className="block text-4xl sm:text-5xl lg:text-6xl leading-[1.1] tracking-tight mt-1"
                  style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontWeight: 300 }}
                >
                  como voc&ecirc; <em style={{ fontWeight: 500, fontStyle: 'italic', color: 'var(--olive)' }}>nunca</em> viu.
                </span>
              </h1>

              <p
                className="opacity-0 animate-fade-in-up animate-delay-300 mt-8 text-base sm:text-lg max-w-xl leading-relaxed"
                style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontWeight: 300 }}
              >
                Concilia&ccedil;&atilde;o de lan&ccedil;amentos, identifica&ccedil;&atilde;o de diverg&ecirc;ncias
                e relat&oacute;rios gerenciais. Onde antes havia planilhas desorganizadas,
                agora h&aacute; clareza.
              </p>

              <div className="opacity-0 animate-fade-in-up animate-delay-500 mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center transition-all duration-400"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 500,
                    letterSpacing: '0.04em',
                    fontSize: '0.9375rem',
                    padding: '14px 36px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--navy)',
                    color: 'var(--text-primary)',
                    background: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--navy)'
                    e.currentTarget.style.color = '#ffffff'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(29,59,95,0.25)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'var(--text-primary)'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  Acessar plataforma
                </Link>
                <a
                  href="#solucao"
                  className="inline-flex items-center justify-center transition-all duration-400"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 500,
                    letterSpacing: '0.04em',
                    fontSize: '0.9375rem',
                    padding: '14px 36px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--border-secondary)',
                    color: 'var(--text-secondary)',
                    background: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--navy)'
                    e.currentTarget.style.color = 'var(--text-primary)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-secondary)'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  Conhecer a solu&ccedil;&atilde;o
                </a>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ===== SEÇÃO SOLUÇÃO ===== */}
      <section
        id="solucao"
        className="relative py-28 sm:py-36"
        style={{
          zIndex: 1,
          background: 'var(--section-gradient-1)',
        }}
      >
        <div className="max-w-5xl mx-auto px-6">
          {/* Label */}
          <p
            className="text-[11px] tracking-[0.3em] uppercase mb-6"
            style={{ color: 'var(--olive)', fontFamily: 'var(--font-body)', fontWeight: 700 }}
          >
            O problema
          </p>

          {/* Título com efeito máquina de escrever */}
          <TypeWriter
            text="Relatórios financeiros não deveriam exigir retrabalho."
            speed={80}
            className="text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.15] mb-20"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontWeight: 400, minHeight: '3em' }}
          />

          {/* Grid: Chat à esquerda, Motor à direita — MESMO TAMANHO */}
          <div className="grid lg:grid-cols-2 gap-10 items-stretch">
            {/* Conversa simulada */}
            <ChatConversation />

            {/* Painel visual de auditoria */}
            <div className="relative flex">
              <div
                className="rounded-2xl p-8 border flex-1 flex flex-col"
                style={{
                  background: 'var(--bg-secondary)',
                  borderColor: 'var(--border-primary)',
                  boxShadow: 'var(--shadow-lg)',
                }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: 'var(--olive)' }} />
                  <span
                    className="text-[11px] tracking-widest uppercase"
                    style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-body)', fontWeight: 700 }}
                  >
                    Motor de concilia&ccedil;&atilde;o
                  </span>
                </div>

                <div className="space-y-3 flex-1 flex flex-col justify-center">
                  {[
                    { label: 'Cruzamento por contrato', status: 'ok', val: '1.247 registros' },
                    { label: 'Validação CPF / ADE', status: 'ok', val: '1.247 validados' },
                    { label: 'Divergência de valores', status: 'warn', val: '23 encontradas' },
                    { label: 'Lançamentos duplicados', status: 'err', val: '7 identificados' },
                    { label: 'Relatório gerencial', status: 'ok', val: 'Gerado' },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-3.5 px-4 rounded-xl"
                      style={{ background: 'var(--bg-tertiary)' }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            background:
                              item.status === 'ok'
                                ? 'var(--olive)'
                                : item.status === 'warn'
                                ? '#d97706'
                                : '#dc2626',
                          }}
                        />
                        <span className="text-sm" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                          {item.label}
                        </span>
                      </div>
                      <span
                        className="text-xs tabular-nums"
                        style={{
                          fontWeight: 700,
                          color:
                            item.status === 'ok'
                              ? 'var(--olive)'
                              : item.status === 'warn'
                              ? '#d97706'
                              : '#dc2626',
                        }}
                      >
                        {item.val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SEÇÃO PROCESSO ===== */}
      <section
        id="processo"
        className="relative py-28 sm:py-36"
        style={{
          zIndex: 1,
          background: 'var(--section-gradient-2)',
        }}
      >
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-24">
            <p
              className="text-[11px] tracking-[0.3em] uppercase mb-6"
              style={{ color: 'var(--olive)', fontFamily: 'var(--font-body)', fontWeight: 700 }}
            >
              Processo
            </p>
            <h2
              className="text-3xl sm:text-4xl leading-tight"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontWeight: 400 }}
            >
              Tr&ecirc;s etapas. Nenhuma planilha manual.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-16 relative">
            {/* Linha conectora */}
            <div
              className="hidden md:block absolute top-10 left-[16.67%] right-[16.67%] h-px"
              style={{ background: 'var(--border-secondary)' }}
            />

            {[
              {
                step: '01',
                title: 'Importação',
                desc: 'O cliente sobe a planilha bruta extraída do sistema financeiro. O sistema reconhece a estrutura automaticamente.',
                greenTitle: false,
              },
              {
                step: '02',
                title: 'Conciliação',
                desc: 'O motor cruza lançamentos por contrato, CPF, ADE, valor ou campo que você precisar.',
                greenTitle: false,
              },
              {
                step: '03',
                title: 'Relatório',
                desc: 'Dados organizados em relatórios personalizados. Filtre por produto, status, período ou operação. Do seu jeito.',
                greenTitle: true,
              },
            ].map((item, i) => (
              <div key={i} className="text-center px-4 relative">
                <div
                  className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-8 relative z-10"
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-primary)',
                    boxShadow: 'var(--shadow-md)',
                  }}
                >
                  <span
                    className="text-xl"
                    style={{ color: 'var(--navy)', fontFamily: 'var(--font-display)', fontWeight: 500 }}
                  >
                    {item.step}
                  </span>
                </div>
                <h3
                  className="text-lg mb-4"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 500,
                    color: item.greenTitle ? 'var(--olive)' : 'var(--text-primary)',
                  }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SEÇÃO CAPACIDADE ===== */}
      <section
        className="relative py-28 sm:py-36"
        style={{
          zIndex: 1,
          background: 'var(--section-gradient-1)',
        }}
      >
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-20">
            <p
              className="text-[11px] tracking-[0.3em] uppercase mb-6"
              style={{ color: 'var(--olive)', fontFamily: 'var(--font-body)', fontWeight: 700 }}
            >
              Capacidade
            </p>
            <h2
              className="text-3xl sm:text-4xl leading-tight"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontWeight: 400 }}
            >
              Precis&atilde;o que o trabalho manual n&atilde;o alcança.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: '< 3s', label: 'Processamento por planilha' },
              { value: '100%', label: 'Cruzamento automatizado' },
              { value: '0', label: 'Intervenção manual' },
              { value: '24/7', label: 'Disponibilidade' },
            ].map((item, i) => (
              <div
                key={i}
                className="text-center py-14 px-6 rounded-2xl border"
                style={{
                  background: 'var(--bg-secondary)',
                  borderColor: 'var(--border-primary)',
                }}
              >
                <div
                  className="text-4xl mb-4"
                  style={{ color: 'var(--navy)', fontFamily: 'var(--font-display)', fontWeight: 300 }}
                >
                  {item.value}
                </div>
                <div
                  className="text-[10px] uppercase tracking-[0.2em]"
                  style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-body)', fontWeight: 700 }}
                >
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SEÇÃO BLÚMEN VISION ===== */}
      <BlumenVisionSection />

      {/* ===== SEÇÃO CONTATO ===== */}
      <section
        id="contato"
        className="relative py-28 sm:py-36"
        style={{
          zIndex: 1,
          background: 'var(--section-gradient-2)',
        }}
      >
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p
            className="text-[11px] tracking-[0.3em] uppercase mb-6"
            style={{ color: 'var(--olive)', fontFamily: 'var(--font-body)', fontWeight: 700 }}
          >
            Contato
          </p>
          <h2
            className="text-3xl sm:text-4xl leading-tight mb-8"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontWeight: 400 }}
          >
            Luz &agrave; decis&atilde;o, equil&iacute;brio ao pensamento
            <br className="hidden sm:block" />
            e dire&ccedil;&atilde;o aos neg&oacute;cios.
          </h2>
          <p
            className="text-base mb-14 leading-relaxed max-w-xl mx-auto"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontWeight: 400 }}
          >
            A Bl&uacute;men{' '}
            <span style={{ color: 'var(--olive)', fontWeight: 600 }}>Biz</span>{' '}
            &eacute; uma plataforma de estrat&eacute;gia e neg&oacute;cios fundada pela economista
            Camila Arnuti. Se a sua empresa precisa de clareza financeira, fale conosco.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Link href="/login" className="btn btn-primary btn-lg" style={{ borderRadius: '8px' }}>
              Acessar plataforma
            </Link>
            <a
              href="https://wa.me/5569981113859"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-accent btn-lg"
              style={{ borderRadius: '8px' }}
            >
              Falar pelo WhatsApp
            </a>
          </div>

          <div className="flex items-center justify-center gap-8 opacity-40">
            <DarkLogo
              lightSrc="/logo-blumen-biz.png"
              darkSrc="/logo-blumen-biz-white.png"
              alt="Blúmen Biz"
              width={100}
              height={30}
              className="h-5 w-auto"
            />
            <div className="w-px h-5" style={{ background: 'var(--border-secondary)' }} />
            <DarkLogo
              lightSrc="/logo-camila-arnuti.png"
              darkSrc="/logo-camila-arnuti-white.png"
              alt="Camila Arnuti"
              width={100}
              height={30}
              className="h-5 w-auto"
            />
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer
        className="relative py-8 border-t"
        style={{ borderColor: 'var(--border-primary)', zIndex: 1, background: 'var(--bg-primary)' }}
      >
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
            Bl&uacute;men{' '}
            <span style={{ color: 'var(--olive)' }}>Biz</span>
            {' '}&middot;{' '}
            &copy; {new Date().getFullYear()}. Todos os direitos reservados.
          </p>
          <p
            className="text-xs italic"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}
          >
            Clareza para neg&oacute;cios.
          </p>
        </div>
        <DataRoFooter />
      </footer>
    </div>
  )
}
