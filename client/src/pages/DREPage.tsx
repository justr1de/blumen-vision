/*
 * DRE Gerencial — Nordic Data Landscape (Multi-cliente)
 */
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, colorForValue } from "@/lib/format";
import { useFinancialData } from "@/hooks/useFinancialData";
import { useClient } from "@/contexts/ClientContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { motion } from "framer-motion";

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

export default function DREPage() {
  const data = useFinancialData();
  const { client } = useClient();
  const { dre, evolucao_mensal, kpis } = data;

  const waterfallData = (evolucao_mensal || []).map((m: any) => ({
    mes: m.mes_label,
    resultado: m.resultado,
  }));

  const formulaItems = [
    { label: 'Receitas Brutas', value: kpis?.receitas_brutas || 0, color: 'bg-blumen-olive' },
    { label: 'Deduções', value: kpis?.deducoes || 0, color: 'bg-muted-foreground' },
    { label: 'Despesas', value: kpis?.despesas || 0, color: 'bg-destructive' },
    { label: 'Resultado Operacional', value: kpis?.resultado_operacional || 0, color: 'bg-blumen-navy' },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold" >
          DRE Gerencial
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Demonstrativo de Resultado do Exercício — {client.nome} — {client.periodo}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* DRE Table */}
        <motion.div
          className="xl:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left px-5 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Conta
                      </th>
                      <th className="text-right px-5 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Valor
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(dre || []).map((row: any, i: number) => {
                      const isHeader = row.tipo === "header";
                      const isTotal = row.tipo === "total" || row.tipo === "resultado";
                      const isItem = row.tipo === "item";
                      return (
                        <tr
                          key={i}
                          className={`border-b border-border/30 transition-colors hover:bg-muted/20 ${
                            isTotal ? "bg-muted/40 font-semibold" : ""
                          } ${isHeader ? "font-medium" : ""}`}
                        >
                          <td className={`px-5 py-2.5 ${isItem ? "pl-10 text-muted-foreground" : ""}`}>
                            {row.linha}
                          </td>
                          <td className={`px-5 py-2.5 text-right font-mono ${colorForValue(row.valor)}`}>
                            {formatCurrency(row.valor)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold mb-4" >
                Resultado Mensal
              </h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={waterfallData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e0" />
                    <XAxis dataKey="mes" tick={{ fontSize: 10, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={0} stroke="#2D2D2D" strokeWidth={1} />
                    <Bar dataKey="resultado" name="Resultado" fill="#1D3B5F" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold mb-4" >
                Fórmula do Resultado
              </h3>
              <div className="space-y-3">
                {formulaItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${item.color}`} />
                    <span className="text-xs text-muted-foreground flex-1">{item.label}</span>
                    <span className={`text-xs font-mono font-medium ${colorForValue(item.value)}`}>
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
