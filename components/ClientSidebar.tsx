'use client'

import Link from 'next/link'
import DarkLogo from './DarkLogo'
import Tooltip from './Tooltip'
import { usePathname, useRouter } from 'next/navigation'
import ThemeToggle from './ThemeToggle'
import {
  LayoutDashboard,
  FileUp,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Eye,
  Network,
  Wallet,
  Receipt,
  ArrowLeftRight,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/painel', label: 'Dashboard', icon: LayoutDashboard, tooltip: 'Visão geral do seu painel' },
  { href: '/painel/visao-geral', label: 'Visão Geral', icon: Eye, tooltip: 'Indicadores consolidados e módulos' },
  { href: '/painel/arquitetura', label: 'Arquitetura', icon: Network, tooltip: 'Hierarquia Grupo → Segmento → Unidade' },
]

const caixaItems = [
  { href: '/painel/caixa', label: 'Painel do Caixa', icon: Wallet, tooltip: 'Cockpit do fluxo de caixa' },
  { href: '/painel/caixa/lancamentos', label: 'Lançamentos', icon: Receipt, tooltip: 'Entradas, saídas e transferências' },
  { href: '/painel/caixa/extrato', label: 'Extrato', icon: FileText, tooltip: 'Extrato bancário por conta' },
  { href: '/painel/caixa/conciliacao', label: 'Conciliação', icon: ShieldCheck, tooltip: 'Conciliação bancária' },
]

const dataItems = [
  { href: '/painel/upload', label: 'Enviar Planilha', icon: FileUp, tooltip: 'Enviar nova planilha para análise' },
  { href: '/painel/dados', label: 'Meus Dados', icon: ArrowLeftRight, tooltip: 'Visualizar seus dados processados' },
  { href: '/painel/relatorios', label: 'Relatórios', icon: BarChart3, tooltip: 'Relatórios e análises dos seus dados' },
]

export default function ClientSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [caixaOpen, setCaixaOpen] = useState(pathname.startsWith('/painel/caixa'))
  const [dataOpen, setDataOpen] = useState(
    pathname.startsWith('/painel/upload') || pathname.startsWith('/painel/dados') || pathname.startsWith('/painel/relatorios')
  )

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <aside
      className="sidebar-bg w-64 min-h-screen flex flex-col"
      style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-primary)' }}
    >
      <div className="p-5" style={{ borderBottom: '1px solid var(--border-primary)' }}>
        <div className="flex flex-col items-center gap-3">
          <DarkLogo lightSrc="/logo-blumen-biz.png" darkSrc="/logo-blumen-biz-white.png" alt="Blúmen Biz" width={180} height={36} className="h-8 w-auto rounded-lg" />
          <div className="w-10 h-px" style={{ background: 'var(--border-primary)' }} />
          <DarkLogo lightSrc="/logo-camila-arnuti.png" darkSrc="/logo-camila-arnuti-white.png" alt="Camila Arnuti" width={180} height={36} className="h-8 w-auto rounded-lg" />
        </div>
        <div className="mt-3 flex items-center justify-center gap-2">
          <span className="badge badge-olive text-[10px]">Painel do Cliente</span>
          <ThemeToggle />
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {/* Nav principal */}
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Tooltip key={item.href} text={item.tooltip} position="right">
              <Link
                href={item.href}
                className={`sidebar-nav-item w-full ${isActive ? 'active' : ''}`}
              >
                <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                {item.label}
              </Link>
            </Tooltip>
          )
        })}

        {/* Divider */}
        <div className="my-2 mx-2 h-px" style={{ background: 'var(--border-primary)' }} />

        {/* Vision Caixa - Collapsible */}
        <button
          onClick={() => setCaixaOpen(!caixaOpen)}
          className="sidebar-nav-item w-full justify-between"
          style={{ color: pathname.startsWith('/painel/caixa') ? 'var(--olive)' : undefined }}
        >
          <span className="flex items-center gap-3">
            <Wallet className="w-[18px] h-[18px] flex-shrink-0" />
            Vision Caixa
          </span>
          {caixaOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        {caixaOpen && (
          <div className="ml-4 space-y-0.5">
            {caixaItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Tooltip key={item.href} text={item.tooltip} position="right">
                  <Link
                    href={item.href}
                    className={`sidebar-nav-item w-full text-[13px] ${isActive ? 'active' : ''}`}
                  >
                    <item.icon className="w-[16px] h-[16px] flex-shrink-0" />
                    {item.label}
                  </Link>
                </Tooltip>
              )
            })}
          </div>
        )}

        {/* Divider */}
        <div className="my-2 mx-2 h-px" style={{ background: 'var(--border-primary)' }} />

        {/* Dados - Collapsible */}
        <button
          onClick={() => setDataOpen(!dataOpen)}
          className="sidebar-nav-item w-full justify-between"
          style={{ color: (pathname.startsWith('/painel/upload') || pathname.startsWith('/painel/dados') || pathname.startsWith('/painel/relatorios')) ? 'var(--navy)' : undefined }}
        >
          <span className="flex items-center gap-3">
            <FileText className="w-[18px] h-[18px] flex-shrink-0" />
            Dados
          </span>
          {dataOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        {dataOpen && (
          <div className="ml-4 space-y-0.5">
            {dataItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Tooltip key={item.href} text={item.tooltip} position="right">
                  <Link
                    href={item.href}
                    className={`sidebar-nav-item w-full text-[13px] ${isActive ? 'active' : ''}`}
                  >
                    <item.icon className="w-[16px] h-[16px] flex-shrink-0" />
                    {item.label}
                  </Link>
                </Tooltip>
              )
            })}
          </div>
        )}
      </nav>

      <div className="p-3 space-y-1" style={{ borderTop: '1px solid var(--border-primary)' }}>
        <Tooltip text="Voltar para Blúmen Vision" position="right">
          <Link
            href="/sistemas"
            className="sidebar-nav-item w-full"
          >
            <Eye className="w-[18px] h-[18px] flex-shrink-0" />
            Sistemas
          </Link>
        </Tooltip>
        <Tooltip text="Configurações da sua conta" position="right">
          <Link
            href="/painel/configuracoes"
            className={`sidebar-nav-item w-full ${pathname === '/painel/configuracoes' ? 'active' : ''}`}
          >
            <Settings className="w-[18px] h-[18px] flex-shrink-0" />
            Configurações
          </Link>
        </Tooltip>
        <Tooltip text="Encerrar sessão" position="right">
          <button
            onClick={handleLogout}
            className="btn-glass btn-glass-danger btn-glass-sm w-full justify-start gap-3"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.875rem' }}
          >
            <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
            Sair
          </button>
        </Tooltip>
      </div>
    </aside>
  )
}
