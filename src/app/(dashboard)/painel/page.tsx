"use client";

import { useClient } from "../layout";
import { formatCurrency, formatNumber, colorForValue } from "@/lib/format";
import {
  TrendingUp, TrendingDown, Wallet, Receipt,
  Package, Users, CreditCard,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ["#0F4C5C", "#E07A5F", "#3D5A40", "#64748B", "#D4A373", "#457B9D", "#BC6C25", "#2A9D8F"];

const heroImg = "https://d2xsxph8kpxj0f.cloudfront.net/310519663350656007/Rv4q3kESEs5MJJSPdvwvcq/hero-banner-Yi8YEE6cCTpZfssKciLWV7.webp";

function KpiCard({ label, value, icon: Icon, suffix }: { label: string; value: number; icon: React.ElementType; suffix?: string }) {
  const isPositive = value >= 0;
  return (
    <div className="bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className={`text-xl font-semibold mt-1.5 font-mono ${colorForValue(value)}`}>
            {suffix ? `${formatNumber(value)} ${suffix}` : formatCurrency(value)}
          </p>
        </div>
        <div className={`p-2 rounded-lg ${isPositive ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
          <Icon className={`w-4 h-4 ${isPositive ? 'text-emerald-600' : 'text-red-500'}`} />
        </div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
      <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-mono" style={{ color: p.color }}>
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function PainelPage() {
  const { client, clientId } = useClient();
  const { kpis, evolucao_mensal } = client;
  const isTijolos = clientId === "tijolos";

  const topItems = isTijolos
    ? (client.top_clientes || []).slice(0, 8).map((c) => ({ name: c.cliente, value: c.faturamento }))
    : (client.bancos || []).slice(0, 8).map((b) => ({ name: b.banco, value: b.receitas }));

  const catItems = isTijolos
    ? (client.despesas_detalhamento || []).slice(0, 8).map((d) => ({ name: d.detalhamento, value: Math.abs(d.valor) }))
    : (client.categorias || []).slice(0, 8).map((c) => ({ name: c.categoria, value: Math.abs(c.valor_total) }));

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative rounded-xl overflow-hidden">
        <img src={heroImg} alt="" className="w-full h-48 sm:h-56 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif">
            Painel Financeiro
          </h1>
          <p className="text-white/70 text-sm mt-1 max-w-md">
            {client.nome} — {client.periodo}
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
              <span className="text-xs text-muted-foreground">Lançamentos</span>
              <span className="text-sm font-semibold text-foreground font-mono">
                {formatNumber(isTijolos ? (kpis.total_vendas_count ?? 0) : kpis.total_lancamentos)}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
              <span className="text-xs text-muted-foreground">{isTijolos ? 'Clientes' : 'Lojas'}</span>
              <span className="text-sm font-semibold text-foreground font-mono">
                {isTijolos ? kpis.total_clientes : kpis.total_lojas}
              </span>
            </div>
            {isTijolos && kpis.qtd_milheiros && (
              <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
                <span className="text-xs text-muted-foreground">Milheiros</span>
                <span className="text-sm font-semibold text-foreground font-mono">
                  {formatNumber(kpis.qtd_milheiros)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Receitas Brutas" value={kpis.receitas_brutas} icon={TrendingUp} />
        <KpiCard label="Receita Líquida" value={kpis.receita_liquida} icon={Wallet} />
        <KpiCard label="Despesas Totais" value={kpis.despesas} icon={TrendingDown} />
        <KpiCard label="Resultado Operacional" value={kpis.resultado_operacional} icon={Receipt} />
      </div>

      {isTijolos && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="A Receber (Crediário)" value={kpis.a_receber_crediario ?? 0} icon={CreditCard} />
          <KpiCard label="Investimentos" value={kpis.investimentos ?? 0} icon={Package} />
          <KpiCard label="Aportes Sócios" value={kpis.total_aportes ?? 0} icon={Users} />
          <KpiCard label="Retornos Sócios" value={kpis.total_retornos ?? 0} icon={TrendingDown} />
        </div>
      )}

      {/* Evolução Mensal */}
      <div className="bg-card rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-1 font-serif">Evolução Mensal</h2>
        <p className="text-xs text-muted-foreground mb-6">Receitas vs Despesas por mês</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={evolucao_mensal}>
              <defs>
                <linearGradient id="gradRec" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3D5A40" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3D5A40" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradDesp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E07A5F" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#E07A5F" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e0" />
              <XAxis dataKey="mes_label" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="receitas" name="Receitas" stroke="#3D5A40" fill="url(#gradRec)" strokeWidth={2} />
              <Area type="monotone" dataKey="despesas" name="Despesas" stroke="#E07A5F" fill="url(#gradDesp)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-1 font-serif">
            {isTijolos ? 'Top Clientes' : 'Concentração por Banco'}
          </h2>
          <p className="text-xs text-muted-foreground mb-6">
            {isTijolos ? 'Maiores compradores por faturamento' : 'Top 8 bancos por volume'}
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topItems} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#2D2D2D' }} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Valor" fill="#0F4C5C" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-1 font-serif">
            {isTijolos ? 'Despesas por Categoria' : 'Distribuição por Categoria'}
          </h2>
          <p className="text-xs text-muted-foreground mb-6">Peso relativo das 8 maiores categorias</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={catItems}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                >
                  {catItems.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  wrapperStyle={{ fontSize: '11px', lineHeight: '18px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
