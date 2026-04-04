'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  LayoutDashboard, Wallet, TrendingUp, Factory, Brain,
  FileSpreadsheet, BarChart3, Receipt, Building2, Users,
  Settings, LogOut, ChevronLeft, ChevronRight, Eye,
  MessageSquare, Upload, Menu, X, Sun, Moon, Shield
} from 'lucide-react';

interface SidebarProps {
  user: {
    name: string;
    email: string;
    role: string;
    tenantName?: string;
  };
}

const adminNav = [
  { label: 'Painel Geral', href: '/admin', icon: LayoutDashboard },
  { label: 'Tenants', href: '/admin/tenants', icon: Building2 },
  { label: 'Usuários', href: '/admin/usuarios', icon: Users },
  { label: 'Mensagens', href: '/admin/mensagens', icon: MessageSquare },
  { label: 'Relatórios', href: '/admin/relatorios', icon: BarChart3 },
  { label: 'Configurações', href: '/admin/configuracoes', icon: Settings },
];

const clientNav = [
  { label: 'Painel', href: '/painel', icon: LayoutDashboard },
  {
    label: 'Vision',
    icon: Eye,
    children: [
      { label: 'Vision Caixa', href: '/vision/caixa', icon: Wallet },
      { label: 'Vision Capital', href: '/vision/capital', icon: TrendingUp },
      { label: 'Vision Produção', href: '/vision/producao', icon: Factory },
      { label: 'Vision Decisão', href: '/vision/decisao', icon: Brain },
    ],
  },
  { label: 'DRE', href: '/dre', icon: FileSpreadsheet },
  { label: 'Movimento', href: '/movimento', icon: Receipt },
  { label: 'Uploads', href: '/uploads', icon: Upload },
  { label: 'Blúmen AI', href: '/blumen-ai', icon: Brain },
];

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [visionOpen, setVisionOpen] = useState(
    pathname?.startsWith('/vision') ?? false
  );

  const isSuperAdmin = user.role === 'SUPER_ADMIN';
  const navItems = isSuperAdmin ? adminNav : clientNav;

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const isActive = (href: string) => pathname === href;

  const renderNavItem = (item: any) => {
    if (item.children) {
      const childActive = item.children.some((c: any) => isActive(c.href));
      return (
        <div key={item.label}>
          <button
            onClick={() => setVisionOpen(!visionOpen)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              childActive
                ? 'bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-primary))]'
                : 'text-[hsl(var(--sidebar-fg))]/60 hover:text-[hsl(var(--sidebar-fg))] hover:bg-[hsl(var(--sidebar-accent))]/40'
            }`}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">{item.label}</span>
                <ChevronRight className={`w-3 h-3 transition-transform duration-200 ${visionOpen ? 'rotate-90' : ''}`} />
              </>
            )}
          </button>
          {visionOpen && !collapsed && (
            <div className="ml-4 mt-1 space-y-0.5 border-l border-[hsl(var(--sidebar-border))]/50 pl-3">
              {item.children.map((child: any) => (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 ${
                    isActive(child.href)
                      ? 'bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-primary))]'
                      : 'text-[hsl(var(--sidebar-fg))]/50 hover:text-[hsl(var(--sidebar-fg))] hover:bg-[hsl(var(--sidebar-accent))]/30'
                  }`}
                >
                  <child.icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{child.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setMobileOpen(false)}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
          isActive(item.href)
            ? 'bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-primary))]'
            : 'text-[hsl(var(--sidebar-fg))]/60 hover:text-[hsl(var(--sidebar-fg))] hover:bg-[hsl(var(--sidebar-accent))]/40'
        }`}
      >
        <item.icon className="w-4 h-4 shrink-0" />
        {!collapsed && <span>{item.label}</span>}
      </Link>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[hsl(var(--sidebar-bg))] text-[hsl(var(--sidebar-fg))]">
      {/* Logo */}
      <div className="px-4 pt-6 pb-4 border-b border-[hsl(var(--sidebar-border))]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-[hsl(var(--sidebar-primary))]">
            <Eye className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold tracking-tight text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                Blúmen Vision
              </h1>
              <p className="text-[10px] opacity-50 truncate">
                {isSuperAdmin ? 'Administração' : user.tenantName || 'Portal do Cliente'}
              </p>
            </div>
          )}
        </div>
        {isSuperAdmin && !collapsed && (
          <div className="mt-3 flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500/15 text-amber-400 text-[10px] font-medium">
            <Shield className="w-3 h-3" />
            Super Admin
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(renderNavItem)}
      </nav>

      {/* Theme Toggle */}
      <div className="px-3">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[hsl(var(--sidebar-fg))]/60 hover:text-[hsl(var(--sidebar-fg))] hover:bg-[hsl(var(--sidebar-accent))]/40 transition-all duration-200"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {!collapsed && <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>}
        </button>
      </div>

      {/* User section */}
      <div className="px-3 py-4 border-t border-[hsl(var(--sidebar-border))]">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-[hsl(var(--sidebar-primary))]/20 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-[10px] opacity-50 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>

      {/* Collapse toggle (desktop only) */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex items-center justify-center py-3 border-t border-[hsl(var(--sidebar-border))] opacity-50 hover:opacity-100 transition-opacity"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card border border-border shadow-md"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 h-full shadow-xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 z-10 text-white/50 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className={`hidden lg:block shrink-0 h-screen sticky top-0 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
        {sidebarContent}
      </aside>
    </>
  );
}
