/*
 * Crediário — Nordic Data Landscape
 * Análise de vendas a prazo, recebimentos e contas a receber
 */
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, colorForValue } from "@/lib/format";
import { useFinancialData } from "@/hooks/useFinancialData";
import { useClient } from "@/contexts/ClientContext";
import { useState, useMemo } from "react";
import { Search, CreditCard, AlertTriangle, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

export default function CrediarioPage() {
  const data = useFinancialData();
  const { client, clientId } = useClient();
  const [search, setSearch] = useState("");

  const isTijolos = clientId === "tijolos";
  const crediario = data.crediario || [];
  const kpis = data.kpis || {};

  const filtered = useMemo(() => {
    if (!search) return crediario;
    const q = search.toLowerCase();
    return crediario.filter((c: any) =>
      (c.cliente || '').toLowerCase().includes(q) ||
      (c.tipo_cliente || '').toLowerCase().includes(q)
    );
  }, [crediario, search]);

  const totalVenda = crediario.reduce((s: number, c: any) => s + (c.total_venda || 0), 0);
  const totalPago = crediario.reduce((s: number, c: any) => s + (c.total_pago || 0), 0);
  const totalReceber = crediario.reduce((s: number, c: any) => s + (c.a_receber || 0), 0);
  const percPago = totalVenda > 0 ? (totalPago / totalVenda) * 100 : 0;

  // Chart data: top 10 devedores
  const chartData = [...crediario]
    .sort((a: any, b: any) => b.a_receber - a.a_receber)
    .slice(0, 10)
    .map((c: any) => ({
      nome: (c.cliente || '').substring(0, 15),
      pago: Math.abs(c.total_pago || 0),
      a_receber: c.a_receber || 0,
    }));

  if (!isTijolos) {
    return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-2xl font-bold" >
            Crediário
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Este módulo está disponível apenas para clientes com operação de crediário.
          </p>
        </motion.div>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <CreditCard className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              O cliente {client.nome} não possui operação de crediário registrada.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold" >
          Crediário
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Análise de vendas a prazo e contas a receber — {client.nome}
        </p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Vendas Crediário", value: totalVenda, icon: CreditCard, color: "text-foreground" },
          { label: "Total Recebido", value: totalPago, icon: CheckCircle, color: "text-blumen-olive" },
          { label: "A Receber", value: totalReceber, icon: AlertTriangle, color: "text-destructive" },
          { label: "% Recebido", value: percPago, icon: CheckCircle, color: "text-blumen-navy", isPercent: true },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                    <p className={`text-xl font-semibold mt-1.5 font-mono ${kpi.color}`}>
                      {(kpi as any).isPercent ? `${kpi.value.toFixed(1)}%` : formatCurrency(kpi.value)}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <kpi.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-1" >
              Top 10 Devedores
            </h2>
            <p className="text-xs text-muted-foreground mb-6">Comparativo entre valor pago e a receber</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="nome" tick={{ fontSize: 10, fill: '#2D2D2D' }} width={110} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="pago" name="Pago" fill="#6F963E" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="a_receber" name="A Receber" fill="#C0392B" stackId="a" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Table */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 text-sm"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Cliente</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Tipo</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Venda</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Pago</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">A Receber</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row: any, i: number) => {
                    const perc = row.total_venda > 0 ? (row.total_pago / row.total_venda) * 100 : 0;
                    return (
                      <tr key={i} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-2.5 text-xs font-medium">{row.cliente}</td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground">{row.tipo_cliente}</td>
                        <td className="px-4 py-2.5 text-right font-mono text-xs">{formatCurrency(row.total_venda)}</td>
                        <td className="px-4 py-2.5 text-right font-mono text-xs text-blumen-olive">{formatCurrency(row.total_pago)}</td>
                        <td className={`px-4 py-2.5 text-right font-mono text-xs font-medium ${row.a_receber > 0 ? 'text-destructive' : 'text-blumen-olive'}`}>
                          {formatCurrency(row.a_receber)}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <div className="w-full bg-muted rounded-full h-1.5 max-w-[60px] mx-auto">
                            <div
                              className="bg-blumen-olive h-1.5 rounded-full transition-all"
                              style={{ width: `${Math.min(100, perc)}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground">{perc.toFixed(0)}%</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-border/30 text-xs text-muted-foreground">
              {filtered.length} clientes com crediário
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
