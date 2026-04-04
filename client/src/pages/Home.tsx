/*
 * Home: Painel Geral — Blumen Biz (Multi-cliente)
 */
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatNumber, colorForValue } from "@/lib/format";
import { useFinancialData } from "@/hooks/useFinancialData";
import { useClient } from "@/contexts/ClientContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Wallet, Receipt, Package, Users, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

/* Blumen Biz official palette */
const BLUMEN_NAVY = "#1D3B5F";
const BLUMEN_OLIVE = "#6F963E";
const BLUMEN_OLIVE_LIGHT = "#8AB050";
const BLUMEN_OLIVE_DARK = "#5A7A30";
const BLUMEN_NAVY_MID = "#254A73";
const BLUMEN_NAVY_LIGHT = "#3A6B9F";
const BLUMEN_DESTRUCTIVE = "#C0392B";

const COLORS = [BLUMEN_NAVY, BLUMEN_OLIVE, BLUMEN_NAVY_MID, BLUMEN_OLIVE_LIGHT, BLUMEN_OLIVE_DARK, BLUMEN_NAVY_LIGHT, "#64748B", "#8E9AAF"];

const heroImg = "https://d2xsxph8kpxj0f.cloudfront.net/310519663350656007/Rv4q3kESEs5MJJSPdvwvcq/hero-banner-Yi8YEE6cCTpZfssKciLWV7.webp";

/**
 * KpiCard — Card padronizado com altura fixa para uniformidade visual
 */
function KpiCard({ label, value, icon: Icon, delay, suffix }: { label: string; value: number; icon: any; delay: number; suffix?: string }) {
  const isPositive = value >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="h-full"
    >
      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300 bg-card h-full">
        <CardContent className="p-5 h-full flex flex-col justify-between min-h-[120px]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider leading-tight line-clamp-2">
                {label}
              </p>
            </div>
            <div className={`p-2 rounded-lg shrink-0 ${isPositive ? 'bg-blumen-olive/10' : 'bg-destructive/10'}`}>
              <Icon className={`w-4 h-4 ${isPositive ? 'text-blumen-olive' : 'text-destructive'}`} />
            </div>
          </div>
          <p className={`text-lg font-bold mt-3 font-mono tracking-tight ${colorForValue(value)}`}>
            {suffix ? `${formatNumber(value)} ${suffix}` : formatCurrency(value)}
          </p>
        </CardContent>
      </Card>
    </motion.div>
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

export default function Home() {
  const data = useFinancialData();
  const { client, clientId } = useClient();
  const { kpis, evolucao_mensal } = data;

  const isTijolos = clientId === "tijolos";

  // Prepare chart data
  const topItems = isTijolos
    ? (data.top_clientes || []).slice(0, 8).map((c: any) => ({ name: c.cliente, value: c.faturamento }))
    : (data.bancos || []).slice(0, 8).map((b: any) => ({ name: b.banco, value: b.receitas }));

  const catItems = isTijolos
    ? (data.despesas_detalhamento || []).slice(0, 8).map((d: any) => ({ name: d.detalhamento, value: Math.abs(d.valor) }))
    : (data.categorias || []).slice(0, 8).map((c: any) => ({ name: c.categoria, value: Math.abs(c.valor_total) }));

  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative rounded-xl overflow-hidden"
      >
        <img src={heroImg} alt="" className="w-full h-48 sm:h-56 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-blumen-navy/90 via-blumen-navy/60 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Painel Financeiro
          </h1>
          <p className="text-white/70 text-sm mt-1 max-w-md">
            {client.nome} — {client.periodo}
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
              <span className="text-xs text-blumen-navy/70">Lançamentos</span>
              <span className="text-sm font-semibold text-blumen-navy font-mono">
                {formatNumber(isTijolos ? kpis.total_vendas_count : kpis.total_lancamentos)}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
              <span className="text-xs text-blumen-navy/70">{isTijolos ? 'Clientes' : 'Lojas'}</span>
              <span className="text-sm font-semibold text-blumen-navy font-mono">
                {isTijolos ? kpis.total_clientes : kpis.total_lojas}
              </span>
            </div>
            {isTijolos && (
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
                <span className="text-xs text-blumen-navy/70">Milheiros</span>
                <span className="text-sm font-semibold text-blumen-navy font-mono">
                  {formatNumber(kpis.qtd_milheiros)}
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* KPIs — Grid padronizado com altura uniforme */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr">
        <KpiCard label="Receitas Brutas" value={kpis.receitas_brutas} icon={TrendingUp} delay={0.1} />
        <KpiCard label="Receita Líquida" value={kpis.receita_liquida} icon={Wallet} delay={0.2} />
        <KpiCard label="Despesas Totais" value={kpis.despesas} icon={TrendingDown} delay={0.3} />
        <KpiCard label="Resultado Operacional" value={kpis.resultado_operacional} icon={Receipt} delay={0.4} />
      </div>

      {isTijolos && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr">
          <KpiCard label="A Receber (Crediário)" value={kpis.a_receber_crediario} icon={CreditCard} delay={0.5} />
          <KpiCard label="Investimentos" value={kpis.investimentos} icon={Package} delay={0.6} />
          <KpiCard label="Aportes Sócios" value={kpis.total_aportes} icon={Users} delay={0.7} />
          <KpiCard label="Retornos Sócios" value={kpis.total_retornos} icon={TrendingDown} delay={0.8} />
        </div>
      )}

      {/* Evolução Mensal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-1">
              Evolução Mensal
            </h2>
            <p className="text-xs text-muted-foreground mb-6">Receitas vs Despesas por mês</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={evolucao_mensal}>
                  <defs>
                    <linearGradient id="gradRec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={BLUMEN_OLIVE} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={BLUMEN_OLIVE} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradDesp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={BLUMEN_DESTRUCTIVE} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={BLUMEN_DESTRUCTIVE} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d0dce8" />
                  <XAxis dataKey="mes_label" tick={{ fontSize: 11, fill: BLUMEN_NAVY }} />
                  <YAxis tick={{ fontSize: 11, fill: BLUMEN_NAVY }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="receitas" name="Receitas" stroke={BLUMEN_OLIVE} fill="url(#gradRec)" strokeWidth={2} />
                  <Area type="monotone" dataKey="despesas" name="Despesas" stroke={BLUMEN_DESTRUCTIVE} fill="url(#gradDesp)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="border-0 shadow-sm h-full">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-1">
                {isTijolos ? 'Top Clientes' : 'Concentração por Banco'}
              </h2>
              <p className="text-xs text-muted-foreground mb-6">
                {isTijolos ? 'Maiores compradores por faturamento' : 'Top 8 bancos por volume'}
              </p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topItems} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#d0dce8" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: BLUMEN_NAVY }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: BLUMEN_NAVY }} width={100} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" name="Valor" fill={BLUMEN_NAVY} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="border-0 shadow-sm h-full">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-1">
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
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
