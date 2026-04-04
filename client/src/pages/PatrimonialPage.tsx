/*
 * Patrimonial — Nordic Data Landscape
 * Aportes, retornos, empréstimos e posição dos sócios
 */
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, colorForValue } from "@/lib/format";
import { useFinancialData } from "@/hooks/useFinancialData";
import { useClient } from "@/contexts/ClientContext";
import { useMemo } from "react";
import { Landmark, TrendingUp, TrendingDown, ArrowRightLeft } from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from "recharts";

const COLORS = ["#1D3B5F", "#6F963E", "#254A73", "#8AB050", "#5A7A30"];

export default function PatrimonialPage() {
  const data = useFinancialData();
  const { client, clientId } = useClient();

  const isTijolos = clientId === "tijolos";
  const patrimonial = data.patrimonial || [];
  const kpis = data.kpis || {};

  // Aggregate by socio
  const bySocio = useMemo(() => {
    const map: Record<string, { aporte: number; retorno: number; emprestimo: number; juros: number }> = {};
    patrimonial.forEach((p: any) => {
      const key = p.origem || 'Outros';
      if (!map[key]) map[key] = { aporte: 0, retorno: 0, emprestimo: 0, juros: 0 };
      if (p.tipo === 'APORTE') map[key].aporte += p.valor;
      else if (p.tipo === 'RETORNO') map[key].retorno += p.valor;
      else if (p.tipo === 'EMPRÉSTIMOS') map[key].emprestimo += p.valor;
      else if (p.tipo === 'JUROS') map[key].juros += p.valor;
    });
    return Object.entries(map).map(([nome, vals]) => ({
      nome,
      ...vals,
      saldo: vals.aporte + vals.retorno + vals.emprestimo + vals.juros,
    })).sort((a, b) => b.saldo - a.saldo);
  }, [patrimonial]);

  // Aggregate by tipo
  const byTipo = useMemo(() => {
    const map: Record<string, number> = {};
    patrimonial.forEach((p: any) => {
      const t = p.tipo || 'Outros';
      map[t] = (map[t] || 0) + Math.abs(p.valor);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [patrimonial]);

  // Chart data for socios
  const socioChart = bySocio.filter(s => !s.nome.startsWith('EMPRESTIMO')).map(s => ({
    nome: s.nome.replace('SOCIO ', 'Sócio '),
    Aporte: s.aporte,
    Retorno: Math.abs(s.retorno),
    Saldo: s.saldo,
  }));

  if (!isTijolos || patrimonial.length === 0) {
    return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-2xl font-bold" >
            Patrimonial
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Este módulo está disponível apenas para clientes com movimentação patrimonial.
          </p>
        </motion.div>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <Landmark className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              O cliente {client.nome} não possui movimentação patrimonial registrada.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalAportes = kpis.total_aportes || 0;
  const totalRetornos = kpis.total_retornos || 0;
  const saldoGeral = totalAportes + totalRetornos;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold" >
          Patrimonial
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Aportes, retornos e empréstimos entre sócios — {client.nome}
        </p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Aportes", value: totalAportes, icon: TrendingUp, color: "text-blumen-olive" },
          { label: "Total Retornos", value: totalRetornos, icon: TrendingDown, color: "text-destructive" },
          { label: "Saldo Patrimonial", value: saldoGeral, icon: ArrowRightLeft, color: colorForValue(saldoGeral) },
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
                      {formatCurrency(kpi.value)}
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-1" >
                Posição por Sócio
              </h2>
              <p className="text-xs text-muted-foreground mb-6">Aportes vs Retornos</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={socioChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e0" />
                    <XAxis dataKey="nome" tick={{ fontSize: 10, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="Aporte" fill="#6F963E" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Retorno" fill="#C0392B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-1" >
                Distribuição por Tipo
              </h2>
              <p className="text-xs text-muted-foreground mb-6">Volume absoluto por tipo de transação</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={byTipo}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={95}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                    >
                      {byTipo.map((_, i) => (
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

      {/* Sócios Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="px-5 py-4 border-b border-border/30">
              <h3 className="text-sm font-semibold" >
                Posição Detalhada por Sócio
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Sócio</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Aportes</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Retornos</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Empréstimos</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Juros</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {bySocio.map((s, i) => (
                    <tr key={i} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-2.5 text-xs font-medium">{s.nome}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-xs text-blumen-olive">{formatCurrency(s.aporte)}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-xs text-destructive">{formatCurrency(s.retorno)}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-xs">{formatCurrency(s.emprestimo)}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-xs">{formatCurrency(s.juros)}</td>
                      <td className={`px-4 py-2.5 text-right font-mono text-xs font-semibold ${colorForValue(s.saldo)}`}>
                        {formatCurrency(s.saldo)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="px-5 py-4 border-b border-border/30">
              <h3 className="text-sm font-semibold" >
                Últimos Lançamentos Patrimoniais
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Data</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Origem</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Tipo</th>
                    <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {patrimonial.slice(-20).reverse().map((p: any, i: number) => (
                    <tr key={i} className="border-b border-border/20 hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-2 text-xs font-mono text-muted-foreground">{p.data || '—'}</td>
                      <td className="px-4 py-2 text-xs">{p.origem}</td>
                      <td className="px-4 py-2 text-xs">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                          p.tipo === 'APORTE' ? 'bg-blumen-olive/10 text-blumen-olive' :
                          p.tipo === 'RETORNO' ? 'bg-destructive/10 text-destructive' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {p.tipo}
                        </span>
                      </td>
                      <td className={`px-4 py-2 text-right font-mono text-xs ${colorForValue(p.valor)}`}>
                        {formatCurrency(p.valor)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
