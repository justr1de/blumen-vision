'use client'

import { useRouter } from 'next/navigation'
import DarkLogo from '@/components/DarkLogo'
import ThemeToggle from '@/components/ThemeToggle'
import Tooltip from '@/components/Tooltip'
import DataRoFooter from '@/components/DataRoFooter'
import {
  Eye,
  Wallet,
  Factory,
  PiggyBank,
  ArrowRight,
  LogOut,
  Sparkles,
} from 'lucide-react'

interface SistemasContentProps {
  user: {
    name: string
    email: string
    role: string
  }
}

const modulos = [
  {
    id: 'vision-caixa',
    nome: 'Vision Caixa',
    descricao: 'Auditoria e conciliação de repasses financeiros. Identifique divergências, cruze dados de produção e FLAT, e tenha controle total sobre comissões e valores.',
    icon: Wallet,
    href: '/sistemas/vision-caixa',
    cor: 'navy',
    badge: 'Em breve',
    shadowColor: 'rgba(29, 59, 95, 0.3)',
  },
  {
    id: 'vision-producao',
    nome: 'Vision Produção',
    descricao: 'Margem, folha de pagamento, custos operacionais e gestão de pessoas. Acompanhe o ciclo de vida das operações, colaboradores e indicadores de desempenho em tempo real.',
    icon: Factory,
    href: '/sistemas/vision-producao',
    cor: 'gold',
    badge: 'Em breve',
    shadowColor: 'rgba(139, 105, 20, 0.3)',
  },
  {
    id: 'vision-capital',
    nome: 'Vision Capital',
    descricao: 'Endividamento, investimentos e comprometimento financeiro. Controle de capital de giro, análise de dívidas e planejamento de investimentos estratégicos.',
    icon: PiggyBank,
    href: '/sistemas/vision-capital',
    cor: 'olive',
    badge: 'Em breve',
    shadowColor: 'rgba(111, 150, 62, 0.3)',
  },
]

function getIconColor(cor: string) {
  switch (cor) {
    case 'navy': return 'var(--navy)'
    case 'olive': return 'var(--olive)'
    case 'gold': return '#B8860B'
    case 'cyan': return 'var(--navy-light)'
    default: return 'var(--navy)'
  }
}

export default function SistemasContent({ user }: SistemasContentProps) {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50"
        style={{
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-primary)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <DarkLogo
              lightSrc="/logo-blumen-biz.png"
              darkSrc="/logo-blumen-biz-white.png"
              alt="Blúmen Biz"
              width={140}
              height={32}
              className="h-7 w-auto"
            />
            <div className="w-px h-6" style={{ background: 'var(--border-primary)' }} />
            <span
              className="text-xs tracking-[0.15em] uppercase leading-none self-center"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 700 }}
            >
              Sistemas
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span
              className="text-sm hidden sm:block"
              style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-body)' }}
            >
              Olá, <strong style={{ color: 'var(--text-primary)' }}>{user.name.split(' ')[0]}</strong>
            </span>
            <ThemeToggle />
            <Tooltip text="Encerrar sessão" position="bottom">
              <button
                onClick={handleLogout}
                className="btn-glass btn-glass-sm"
                style={{ padding: '6px 10px' }}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Título da Seção */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Eye className="w-5 h-5" style={{ color: 'var(--olive)' }} />
            <span
              className="text-xs tracking-[0.2em] uppercase"
              style={{ color: 'var(--olive)', fontFamily: 'var(--font-body)', fontWeight: 700 }}
            >
              Plataforma de Inteligência Empresarial
            </span>
          </div>
          <h1
            className="text-4xl md:text-5xl mb-4"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--text-primary)' }}
          >
            Blúmen <span className="text-gradient-olive">Vision</span>
          </h1>
          <p
            className="text-base max-w-2xl mx-auto"
            style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-body)', lineHeight: 1.7 }}
          >
            Selecione um módulo para acessar. Cada módulo oferece ferramentas especializadas
            para diferentes aspectos da gestão financeira e operacional.
          </p>
        </div>

        {/* Grid de Módulos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {modulos.map((modulo, index) => {
            const isActive = modulo.badge === 'Ativo'
            return (
              <Tooltip key={modulo.id} text={isActive ? `Acessar ${modulo.nome}` : `${modulo.nome} — disponível em breve`} position="top">
                <div
                  onClick={() => isActive && router.push(modulo.href)}
                  className={`card-glass group relative w-full text-left p-7 opacity-0 animate-fade-in-up ${
                    isActive ? 'cursor-pointer' : 'cursor-default opacity-80'
                  }`}
                  style={{
                    animationDelay: `${(index + 1) * 150}ms`,
                    animationFillMode: 'forwards',
                  }}
                >
                  {/* Badge de Status */}
                  <div className="absolute top-5 right-5">
                    {isActive ? (
                      <span className="badge badge-olive flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {modulo.badge}
                      </span>
                    ) : (
                      <span className="badge badge-navy">{modulo.badge}</span>
                    )}
                  </div>

                  {/* Ícone */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-primary)',
                      boxShadow: `0 4px 12px ${modulo.shadowColor}`,
                    }}
                  >
                    <modulo.icon
                      className="w-7 h-7 transition-transform duration-300"
                      style={{ color: getIconColor(modulo.cor) }}
                    />
                  </div>

                  {/* Conteúdo */}
                  <h3
                    className="text-xl mb-2"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {modulo.nome}
                  </h3>
                  <p
                    className="text-sm leading-relaxed mb-5"
                    style={{
                      color: 'var(--text-tertiary)',
                      fontFamily: 'var(--font-body)',
                      lineHeight: 1.7,
                    }}
                  >
                    {modulo.descricao}
                  </p>

                  {/* Botão de Ação */}
                  {isActive ? (
                    <div
                      className="inline-flex items-center gap-2 text-sm transition-all duration-300 group-hover:gap-3"
                      style={{
                        color: 'var(--navy)',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 600,
                        letterSpacing: '0.04em',
                      }}
                    >
                      Acessar módulo
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  ) : (
                    <div
                      className="inline-flex items-center gap-2 text-sm"
                      style={{
                        color: 'var(--text-muted)',
                        fontFamily: 'var(--font-body)',
                        fontWeight: 600,
                        fontSize: '0.8125rem',
                      }}
                    >
                      Disponível em breve
                    </div>
                  )}

                  {/* Linha decorativa inferior */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-[3px] rounded-b-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background: isActive
                        ? 'linear-gradient(90deg, var(--navy), var(--olive))'
                        : 'linear-gradient(90deg, var(--border-primary), var(--border-secondary))',
                    }}
                  />
                </div>
              </Tooltip>
            )
          })}
        </div>

        {/* Footer com logo secundária */}
        <div className="text-center mt-16 opacity-0 animate-fade-in" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
          <div className="divider-line max-w-xs mx-auto mb-6" />
          <DarkLogo
            lightSrc="/logo-camila-arnuti.png"
            darkSrc="/logo-camila-arnuti-white.png"
            alt="Camila Arnuti"
            width={100}
            height={30}
            className="h-5 w-auto mx-auto opacity-30"
          />
          <p
            className="mt-3 text-center"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontWeight: 600, opacity: 0.75, fontSize: '1.05rem', letterSpacing: '0.04em' }}
          >
            Blúmen Vision
          </p>
          <p
            className="mt-1 text-center"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 700, letterSpacing: '0.18em', fontSize: '0.68rem' }}
          >
            <span style={{ color: 'var(--text-muted)', opacity: 0.5 }}>VER. ENTENDER. </span>
            <span style={{ color: 'var(--olive)', opacity: 0.75 }}>DECIDIR.</span>
          </p>
          <div className="mt-6">
            <DataRoFooter />
          </div>
        </div>
      </main>
    </div>
  )
}
