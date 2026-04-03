"use client";

import { useClient } from "../layout";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { BarChart3, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";
import { useMemo } from "react";

const COLORS = ["#0F4C5C", "#E07A5F", "#3D5A40", "#64748B", "#D4A373", "#457B9D", "#BC6C25", "#2A9D8F"];

export default function BIPage() {
  const { client, clientId } = useClient();
  const { kpis, evolucao_mensal } = client;
  const isTijolos = clientId === "tijolos";

  // Margem operacional por mês
  const margemMensal = useMemo(() => {
    return (evolucao_mensal || []).map((m) => ({
      mes: m.mes_label,
      margem: m.receitas > 0 ? ((m.resultado / m.receitas) * 100) : 0,
      receitas: m.receitas,
      despesas: m.despesas,
    }));
  }, [evolucao_mensal]);

  // Concentração por banco/loja
  const concentracao = useMemo(() => {
    if (isTijolos) {
      return (client.top_clientes || []).slice(0, 6).map((c) => ({
        name: c.cliente,
        value: c.faturamento,
        pct: c.percentual,
      }));
    }
    return (client.bancos || []).slice(0, 6).map((b) => ({
      name: b.banco,
      value: b.receitas,
      pct: b.percentual,
    }));
  }, [client, isTijolos]);

  // Radar de indicadores
  const radarData = useMemo(() => {
    const maxVal = Math.max(
      Math.abs(kpis.receitas_brutas),
      Math.abs(kpis.despesas),
      Math.abs(kpis.receita_liquida),
      Math.abs(kpis.resultado_operacional),
      1
    );
    return [
      { indicator: "Receitas", value: (Math.abs(kpis.receitas_brutas) / maxVal) * 100 },
      { indicator: "Despesas", value: (Math.abs(kpis.despesas) / maxVal) * 100 },
      { indicator: "Líquida", value: (Math.abs(kpis.receita_liquida) / maxVal) * 100 },
      { indicator: "Resultado", value: (Math.abs(kpis.resultado_operacional) / maxVal) * 100 },
      { indicator: "Lançamentos", value: Math.min((kpis.total_lancamentos / 1000) * 100, 100) },
    ];
  }, [kpis]);

  // Alertas
  const alertas = useMemo(() => {
    const list: string[] = [];
    if (kpis.resultado_operacional < 0) list.push("Resultado operacional negativo no período");
    const margemOp = kpis.receitas_brutas > 0 ? (kpis.resultado_operacional / kpis.receitas_brutas) * 100 : 0;
    if (margemOp < 5 && margemOp >= 0) list.push(`Margem operacional baixa: ${margemOp.toFixed(1)}%`);
    if (concentracao.length > 0 && concentracao[0].pct > 30) {
      list.push(`Alta concentração: ${concentracao[0].name} representa ${concentracao[0].pct.toFixed(1)}% do volume`);
    }
    return list;
  }, [kpis, concentracao]);

  const margemOp = kpis.receitas_brutas !== 0 ? (kpis.resultado_operacional / kpis.receitas_brutas) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold font-serif">BI Gerencial</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Business Intelligence — {client.nome}
          </p>
        </div>
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200">Pontos de Atenção</h3>
          </div>
          <ul className="space-y-1">
            {alertas.map((a, i) => (
              <li key={i} className="text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* KPI Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 shadow-sm">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Margem Operacional</p>
          <p className={`text-2xl font-bold font-mono mt-1 ${margemOp >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {margemOp.toFixed(1)}%
          </p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-sm">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Receita/Despesa</p>
          <p className="text-2xl font-bold font-mono mt-1">
            {kpis.despesas !== 0 ? (Math.abs(kpis.receitas_brutas / kpis.despesas)).toFixed(2) : '—'}x
          </p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-sm">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Ticket Médio</p>
          <p className="text-2xl font-bold font-mono mt-1">
            {kpis.total_lancamentos > 0
              ? formatCurrency(kpis.receitas_brutas / kpis.total_lancamentos)
              : '—'}
          </p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-sm">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Lançamentos</p>
          <p className="text-2xl font-bold font-mono mt-1">{formatNumber(kpis.total_lancamentos)}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Margem Mensal */}
        <div className="bg-card rounded-xl shadow-sm p-6">
          <h2 className="text-sm font-semibold mb-4 font-serif">Margem Operacional Mensal</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={margemMensal}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e0" />
                <XAxis dataKey="mes" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={(v) => `${v.toFixed(0)}%`} />
                <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
                <Bar dataKey="margem" name="Margem %" fill="#0F4C5C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Concentração */}
        <div className="bg-card rounded-xl shadow-sm p-6">
          <h2 className="text-sm font-semibold mb-4 font-serif">
            {isTijolos ? 'Concentração por Cliente' : 'Concentração por Banco'}
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={concentracao} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value" nameKey="name" paddingAngle={2}>
                  {concentracao.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '10px', lineHeight: '16px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Radar */}
      <div className="bg-card rounded-xl shadow-sm p-6">
        <h2 className="text-sm font-semibold mb-4 font-serif">Radar de Indicadores</h2>
        <div className="h-72 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e5e0" />
              <PolarAngleAxis dataKey="indicator" tick={{ fontSize: 11, fill: '#64748B' }} />
              <PolarRadiusAxis tick={{ fontSize: 9, fill: '#64748B' }} domain={[0, 100]} />
              <Radar name="Indicadores" dataKey="value" stroke="#0F4C5C" fill="#0F4C5C" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
