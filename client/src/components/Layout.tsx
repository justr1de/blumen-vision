/**
 * Layout: Blumen Biz — Multi-cliente
 * Sidebar fixa com seletor de cliente + navegação contextual
 * Identidade visual: blúmen biz™ + Camila Arnuti - Palestras e Cursos
 * 
 * Detecta automaticamente se está em /gestao (admin) ou /painel (user)
 * e ajusta os links de navegação de acordo.
 */
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import BlumenSymbol from "@/components/BlumenSymbol";
import DataROFooter from "@/components/DataROFooter";
import {
  LayoutDashboard,
  FileText,
  ArrowLeftRight,
  BookOpen,
  CreditCard,
  Landmark,
  Brain,
  Menu,
  X,
  ChevronDown,
  Sun,
  Moon,
  LogOut,
  Home,
} from "lucide-react";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useClient, type ClientId } from "@/contexts/ClientContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * Itens de navegação base — o prefixo será adicionado dinamicamente
 */
const baseNavItems = [
  { path: "", label: "Painel Geral", icon: LayoutDashboard, tooltip: "Visão consolidada com KPIs e gráficos", adminOnly: false },
  { path: "/dre", label: "DRE Gerencial", icon: FileText, tooltip: "Demonstrativo de Resultado do Exercício", adminOnly: false },
  { path: "/movimento", label: "Movimento", icon: ArrowLeftRight, tooltip: "Lançamentos analíticos detalhados", adminOnly: false },
  { path: "/plano-contas", label: "Plano de Contas", icon: BookOpen, tooltip: "Estrutura hierárquica de contas", adminOnly: false },
  { path: "/crediario", label: "Crediário", icon: CreditCard, tooltip: "Vendas a prazo e recebimentos", adminOnly: false },
  { path: "/patrimonial", label: "Patrimonial", icon: Landmark, tooltip: "Aportes, retornos e empréstimos", adminOnly: false },
  { path: "/blumen-ai", label: "Blumen AI", icon: Brain, tooltip: "Assistente financeiro inteligente com Gemini", adminOnly: true },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [clientOpen, setClientOpen] = useState(false);
  const { client, setClientId, allClients } = useClient();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  // Detectar se estamos na área de gestão ou painel do usuário
  const isAdminArea = location.startsWith("/gestao");
  const prefix = isAdminArea ? "/gestao" : "/painel";
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  // Filtrar itens de navegação baseado na área
  const navItems = useMemo(() => {
    return baseNavItems
      .filter((item) => {
        if (!isAdminArea && item.adminOnly) return false;
        return true;
      })
      .map((item) => ({
        ...item,
        href: `${prefix}${item.path}`,
      }));
  }, [prefix, isAdminArea]);

  const areaLabel = isAdminArea ? "Gestão" : "Painel";

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-[260px] bg-sidebar text-sidebar-foreground fixed inset-y-0 left-0 z-40">
        {/* Branding Area */}
        <div className="px-5 pt-6 pb-5">
          {/* Marca primária: blúmen biz */}
          <div className="flex items-center gap-3">
            <BlumenSymbol size={36} variant="dark-bg" />
            <div>
              <h1 className="text-lg font-extrabold tracking-tight leading-tight">
                blúmen<span className="text-sidebar-primary"> biz</span><span className="text-sidebar-primary text-[8px] align-super ml-0.5">™</span>
              </h1>
            </div>
          </div>
          {/* Marca secundária: Camila Arnuti */}
          <div className="mt-3 pt-3 border-t border-sidebar-border/30">
            <p className="text-[13px] font-semibold text-sidebar-foreground/90 tracking-tight">
              Camila Arnuti<span className="text-sidebar-primary text-[6px] align-super ml-0.5">●</span>
            </p>
            <p className="text-[10px] font-medium text-sidebar-primary tracking-wide">
              Palestras e Cursos
            </p>
          </div>
        </div>

        {/* Area Badge */}
        <div className="px-5 mb-3">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            isAdminArea
              ? "bg-blumen-olive/15 text-blumen-olive"
              : "bg-blumen-navy/10 text-blumen-navy"
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${isAdminArea ? "bg-blumen-olive" : "bg-blumen-navy"}`} />
            {areaLabel}
          </div>
        </div>

        {/* Client Selector */}
        <div className="px-3 mb-4">
          <div className="relative">
            <button
              onClick={() => setClientOpen(!clientOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-sidebar-accent/60 hover:bg-sidebar-accent text-sm transition-colors border border-sidebar-border/50"
            >
              <div className="text-left">
                <p className="text-xs font-medium text-sidebar-foreground">{client.nome}</p>
                <p className="text-[10px] text-sidebar-foreground/50">{client.tipo}</p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-sidebar-foreground/50 transition-transform ${clientOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {clientOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-sidebar-accent rounded-lg border border-sidebar-border/50 overflow-hidden z-50 shadow-lg"
                >
                  {allClients.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { setClientId(c.id as ClientId); setClientOpen(false); }}
                      className={`w-full text-left px-3 py-2.5 text-xs hover:bg-sidebar-border/30 transition-colors ${
                        c.id === client.id ? 'bg-sidebar-border/20 text-sidebar-primary' : 'text-sidebar-foreground/80'
                      }`}
                    >
                      <p className="font-medium">{c.nome}</p>
                      <p className="text-[10px] text-sidebar-foreground/40">{c.periodo}</p>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link href={item.href}>
                    <div
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary"
                          : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/40"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  {item.tooltip}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="px-3 pb-2 space-y-0.5">
          {isAdmin && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={isAdminArea ? "/painel" : "/gestao"}>
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/40 transition-all duration-200">
                    <Home className="w-4 h-4" />
                    {isAdminArea ? "Ir ao Painel" : "Ir à Gestão"}
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                {isAdminArea ? "Acessar o painel do usuário" : "Acessar a área de gestão"}
              </TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/40 transition-all duration-200"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              Alternar entre modo claro e escuro
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => logout()}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/5 transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              Encerrar sessão
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Footer: User info + Clareza para negócios */}
        <div className="px-5 py-4 border-t border-sidebar-border">
          {user && (
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-[10px] font-bold text-sidebar-primary">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-sidebar-foreground/80 truncate">{user.name || "Usuário"}</p>
                <p className="text-[9px] text-sidebar-foreground/40 truncate">{user.email || ""}</p>
              </div>
            </div>
          )}
          <p className="text-[10px] text-sidebar-foreground/30 italic">
            Clareza para negócios
          </p>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar text-sidebar-foreground px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <BlumenSymbol size={28} variant="dark-bg" />
          <div className="leading-tight">
            <h1 className="text-base font-extrabold tracking-tight">
              blúmen<span className="text-sidebar-primary"> biz</span>
            </h1>
            <p className="text-[9px] font-medium text-sidebar-foreground/60">
              Camila Arnuti — {areaLabel}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-1.5 rounded-md hover:bg-sidebar-accent/40">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: -260 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -260 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 z-40 bg-sidebar text-sidebar-foreground pt-16"
          >
            <div className="px-4 mb-3">
              <select
                value={client.id}
                onChange={(e) => setClientId(e.target.value as ClientId)}
                className="w-full bg-sidebar-accent text-sidebar-foreground text-sm rounded-lg px-3 py-2 border border-sidebar-border/50"
              >
                {allClients.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome} — {c.periodo}</option>
                ))}
              </select>
            </div>
            <nav className="px-4 space-y-1">
              {navItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium ${
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary"
                          : "text-sidebar-foreground/70"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="px-4 mt-4 space-y-1 border-t border-sidebar-border/30 pt-4">
              {isAdmin && (
                <Link href={isAdminArea ? "/painel" : "/gestao"}>
                  <div
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium text-sidebar-foreground/70"
                  >
                    <Home className="w-4 h-4" />
                    {isAdminArea ? "Ir ao Painel" : "Ir à Gestão"}
                  </div>
                </Link>
              )}
              <button
                onClick={() => { logout(); setMobileOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium text-sidebar-foreground/70 hover:text-destructive"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 px-4 py-4 border-t border-sidebar-border/30">
              <p className="text-[11px] font-semibold text-sidebar-foreground/80">
                Camila Arnuti<span className="text-sidebar-primary text-[6px] align-super ml-0.5">●</span>
              </p>
              <p className="text-[9px] font-medium text-sidebar-primary">
                Palestras e Cursos
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-[260px] pt-14 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
        {/* Rodapé DATA-RO */}
        <div className="px-4 sm:px-6 lg:px-8">
          <DataROFooter variant="light" />
        </div>
      </main>
    </div>
  );
}
