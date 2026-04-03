"use client";

import { useClient } from "../layout";
import { formatCurrency, formatDate } from "@/lib/format";
import { CreditCard } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const STATUS_COLORS: Record<string, string> = {
  em_dia: "bg-emerald-500/10 text-emerald-600",
  atrasado: "bg-amber-500/10 text-amber-600",
  inadimplente: "bg-red-500/10 text-red-500",
  quitado: "bg-blue-500/10 text-blue-600",
};

const PIE_COLORS = ["#3D5A40", "#E07A5F", "#0F4C5C", "#64748B"];

export default function CrediarioPage() {
  const { client, clientId } = useClient();
  const crediario = client.crediario || [];

  if (clientId !== "tijolos" || !crediario.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <CreditCard className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <h2 className="text-lg font-semibold font-serif">Crediário não disponível</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Este módulo está disponível apenas para clientes com vendas a prazo.
        </p>
      </div>
    );
  }

  const totalOriginal = crediario.reduce((s, c) => s + c.valor_original, 0);
  const totalPago = crediario.reduce((s, c) => s + c.valor_pago, 0);
  const totalSaldo = crediario.reduce((s, c) => s + c.saldo, 0);

  const statusCount = crediario.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(statusCount).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CreditCard className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold font-serif">Crediário</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {crediario.length} clientes — {client.nome}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-4 shadow-sm">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Valor Original</p>
          <p className="text-lg font-semibold font-mono mt-1">{formatCurrency(totalOriginal)}</p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-sm">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Pago</p>
          <p className="text-lg font-semibold font-mono text-emerald-600 mt-1">{formatCurrency(totalPago)}</p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-sm">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Saldo a Receber</p>
          <p className="text-lg font-semibold font-mono text-amber-600 mt-1">{formatCurrency(totalSaldo)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="bg-card rounded-xl shadow-sm p-6">
          <h2 className="text-sm font-semibold mb-4 font-serif">Distribuição por Status</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" nameKey="name">
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table */}
        <div className="lg:col-span-2 bg-card rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th className="text-left">Cliente</th>
                  <th className="text-right">Valor Original</th>
                  <th className="text-right">Pago</th>
                  <th className="text-right">Saldo</th>
                  <th className="text-center">Status</th>
                  <th className="text-left">Data Venda</th>
                </tr>
              </thead>
              <tbody>
                {crediario.map((c, i) => (
                  <tr key={i}>
                    <td className="text-xs font-medium">{c.cliente}</td>
                    <td className="text-right font-mono text-xs">{formatCurrency(c.valor_original)}</td>
                    <td className="text-right font-mono text-xs text-emerald-600">{formatCurrency(c.valor_pago)}</td>
                    <td className="text-right font-mono text-xs text-amber-600">{formatCurrency(c.saldo)}</td>
                    <td className="text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_COLORS[c.status] || 'bg-muted text-muted-foreground'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="text-xs font-mono">{formatDate(c.data_venda)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
