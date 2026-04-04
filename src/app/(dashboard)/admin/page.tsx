'use client';

import { useAuth } from '../layout';
import { Building2, Users, FileSpreadsheet, MessageSquare, TrendingUp, Eye } from 'lucide-react';

const stats = [
  { label: 'Tenants Ativos', value: '0', icon: Building2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { label: 'Usuários', value: '0', icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { label: 'Relatórios Gerados', value: '0', icon: FileSpreadsheet, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { label: 'Mensagens Pendentes', value: '0', icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-500/10' },
];

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
          Painel Administrativo
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Bem-vindo(a), {user.name}. Visão geral do sistema.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold mt-2 font-mono">{stat.value}</p>
              </div>
              <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Ações Rápidas
          </h2>
          <div className="space-y-3">
            <a href="/admin/tenants" className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
              <Building2 className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Gerenciar Tenants</p>
                <p className="text-xs text-muted-foreground">Criar, editar e gerenciar empresas</p>
              </div>
            </a>
            <a href="/admin/usuarios" className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Gerenciar Usuários</p>
                <p className="text-xs text-muted-foreground">Controle de acesso e permissões</p>
              </div>
            </a>
            <a href="/admin/relatorios" className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
              <TrendingUp className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Relatórios</p>
                <p className="text-xs text-muted-foreground">Visualizar relatórios de todos os tenants</p>
              </div>
            </a>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Atividade Recente
          </h2>
          <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
            <div className="text-center">
              <Eye className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>Nenhuma atividade recente</p>
              <p className="text-xs mt-1 opacity-60">As atividades dos tenants aparecerão aqui</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
