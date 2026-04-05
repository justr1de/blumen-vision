'use client'

import { useRouter } from 'next/navigation'
import DarkLogo from '@/components/DarkLogo'
import ThemeToggle from '@/components/ThemeToggle'
import Tooltip from '@/components/Tooltip'
import {
  Eye,
  DollarSign,
  Users,
  Settings,
  TrendingUp,
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
    id: 'lumen-financeiro',
    nome: 'Blúmen Financeiro',
    descricao: 'Auditoria e conciliação de repasses financeiros. Identifique divergências, cruze dados de produção e FLAT, e tenha controle total sobre comissões e valores.',
    icon: DollarSign,
    href: '/painel',
    cor: 'navy',
    badge: 'Ativo',
    shadowColor: 'rgba(29, 59, 95, 0.3)',
  },
  {
    id: 'lumen-pessoas',
    nome: 'Blúmen Pessoas',
    descricao: 'Gestão de clientes, beneficiários e agentes. Centralize informações cadastrais, acompanhe históricos e mantenha a base de dados sempre atualizada.',
    icon: Users,
    href: '/sistemas/lumen-pessoas',
    cor: 'olive',
    badge: 'Em breve',
    shadowColor: 'rgba(111, 150, 62, 0.3)',
  },
  {
    id: 'lumen-operacao',
    nome: 'Blúmen Operação',
    descricao: 'Controle operacional de contratos e processos. Acompanhe o ciclo de vida das operações, status de pagamento, ADE e movimentações em tempo real.',
    icon: Settings,
    href: '/sistemas/lumen-operacao',
    cor: 'cyan',
    badge: 'Em breve',
    shadowColor: 'rgba(42, 80, 128, 0.3)',
  },
  {
    id: 'lumen-fluxo-receita',
    nome: 'Blúmen Fluxo de Receita',
    descricao: 'Análise e projeção de fluxo de receita. Dashboards gerenciais com indicadores de performance, tendências e previsões financeiras inteligentes.',
    icon: TrendingUp,
    href: '/sistemas/lumen-fluxo-receita',
    cor: 'gold',
    badge: 'Em breve',
    shadowColor: 'rgba(139, 105, 20, 0.3)',
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
              className="text-xs tracking-[0.15em] uppercase"
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
              Plataforma Integrada
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
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
            className="text-xs mt-3"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)', opacity: 0.5 }}
          >
            Blúmen Vision — Plataforma Integrada de Gestão
          </p>
        </div>
      </main>
    </div>
  )
}
