"use client";
import { useAuth } from "../layout";
import { Wallet, TrendingUp, TrendingDown, BarChart3, ArrowUpRight } from "lucide-react";

export default function PainelPage() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif">Painel Geral</h1>
        <p className="text-sm text-muted-foreground mt-1">Bem-vindo, {user.name}. Visão consolidada do seu negócio.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Receita Bruta", icon: TrendingUp, color: "emerald" },
          { label: "Despesas Totais", icon: TrendingDown, color: "red" },
          { label: "Saldo Operacional", icon: Wallet, color: "blue" },
          { label: "Margem Líquida", icon: BarChart3, color: "emerald" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-card rounded-xl p-5 shadow-sm border border-border/50">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                <p className="text-xl font-semibold mt-1.5 font-mono text-muted-foreground">—</p>
              </div>
              <div className={`p-2 rounded-lg bg-${kpi.color}-500/10`}>
                <kpi.icon className={`w-4 h-4 text-${kpi.color}-500`} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl shadow-sm p-6 border border-border/50 h-72 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Gráficos serão exibidos após importação dos dados.</p>
          </div>
        </div>
        <div className="bg-card rounded-xl shadow-sm p-6 border border-border/50 h-72 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Distribuição por categoria será carregada automaticamente.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
