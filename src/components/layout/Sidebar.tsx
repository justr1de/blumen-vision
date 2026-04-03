"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  ArrowLeftRight,
  BookOpen,
  CreditCard,
  Landmark,
  Brain,
  BarChart3,
  Upload,
  Menu,
  X,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "next-themes";

const navItems = [
  { href: "/painel", label: "Painel Geral", icon: LayoutDashboard, tooltip: "Visão consolidada com KPIs e gráficos" },
  { href: "/dre", label: "DRE Gerencial", icon: FileText, tooltip: "Demonstrativo de Resultado do Exercício" },
  { href: "/movimento", label: "Movimento", icon: ArrowLeftRight, tooltip: "Lançamentos analíticos detalhados" },
  { href: "/plano-contas", label: "Plano de Contas", icon: BookOpen, tooltip: "Estrutura hierárquica de contas" },
  { href: "/crediario", label: "Crediário", icon: CreditCard, tooltip: "Vendas a prazo e recebimentos" },
  { href: "/patrimonial", label: "Patrimonial", icon: Landmark, tooltip: "Aportes, retornos e empréstimos" },
  { href: "/bi", label: "BI Gerencial", icon: BarChart3, tooltip: "Business Intelligence e relatórios" },
  { href: "/uploads", label: "Uploads", icon: Upload, tooltip: "Upload e processamento de planilhas" },
  { href: "/blumen-ai", label: "Blumen AI", icon: Brain, tooltip: "Assistente financeiro inteligente" },
];

interface ClientInfo {
  id: string;
  nome: string;
  tipo: string;
  periodo: string;
}

interface SidebarProps {
  clients: ClientInfo[];
  activeClient: ClientInfo;
  onClientChange: (id: string) => void;
}

export default function Sidebar({ clients, activeClient, onClientChange }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [clientOpen, setClientOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-6 pt-7 pb-4">
        <h1 className="text-xl font-bold tracking-tight font-serif">
          Blumen<span className="text-[hsl(var(--sidebar-primary))]">Biz</span>
        </h1>
        <p className="text-[10px] text-[hsl(var(--sidebar-fg))] opacity-50 mt-0.5 font-light tracking-widest uppercase">
          Portal Financeiro
        </p>
      </div>

      {/* Client Selector */}
      <div className="px-3 mb-4">
        <div className="relative">
          <button
            onClick={() => setClientOpen(!clientOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-[hsl(var(--sidebar-accent))]/60 hover:bg-[hsl(var(--sidebar-accent))] text-sm transition-colors border border-[hsl(var(--sidebar-border))]/50"
          >
            <div className="text-left">
              <p className="text-xs font-medium text-[hsl(var(--sidebar-fg))]">{activeClient.nome}</p>
              <p className="text-[10px] text-[hsl(var(--sidebar-fg))] opacity-50">{activeClient.tipo}</p>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-[hsl(var(--sidebar-fg))] opacity-50 transition-transform ${clientOpen ? 'rotate-180' : ''}`} />
          </button>
          {clientOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[hsl(var(--sidebar-accent))] rounded-lg border border-[hsl(var(--sidebar-border))]/50 overflow-hidden z-50 shadow-lg">
              {clients.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { onClientChange(c.id); setClientOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 text-xs hover:bg-[hsl(var(--sidebar-border))]/30 transition-colors ${
                    c.id === activeClient.id ? 'bg-[hsl(var(--sidebar-border))]/20 text-[hsl(var(--sidebar-primary))]' : 'text-[hsl(var(--sidebar-fg))] opacity-80'
                  }`}
                >
                  <p className="font-medium">{c.nome}</p>
                  <p className="text-[10px] opacity-40">{c.periodo}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} title={item.tooltip}>
              <div
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-primary))]"
                    : "text-[hsl(var(--sidebar-fg))]/60 hover:text-[hsl(var(--sidebar-fg))] hover:bg-[hsl(var(--sidebar-accent))]/40"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Theme Toggle */}
      <div className="px-3 pb-4">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-[hsl(var(--sidebar-fg))]/60 hover:text-[hsl(var(--sidebar-fg))] hover:bg-[hsl(var(--sidebar-accent))]/40 transition-all duration-200"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
        </button>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[hsl(var(--sidebar-border))]">
        <p className="text-[10px] text-[hsl(var(--sidebar-fg))] opacity-40 uppercase tracking-widest">
          {activeClient.nome}
        </p>
        <p className="text-[10px] text-[hsl(var(--sidebar-fg))] opacity-30 mt-0.5">
          {activeClient.periodo}
        </p>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-[260px] bg-[hsl(var(--sidebar-bg))] text-[hsl(var(--sidebar-fg))] fixed inset-y-0 left-0 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[hsl(var(--sidebar-bg))] text-[hsl(var(--sidebar-fg))] px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold font-serif">
          Blumen<span className="text-[hsl(var(--sidebar-primary))]">Biz</span>
        </h1>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-1.5 rounded-md hover:bg-[hsl(var(--sidebar-accent))]/40">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-[hsl(var(--sidebar-bg))] text-[hsl(var(--sidebar-fg))] pt-16 flex flex-col">
          {sidebarContent}
        </div>
      )}
    </>
  );
}
