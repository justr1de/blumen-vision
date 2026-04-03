"use client";

import { useClient } from "../layout";
import { formatCurrency, formatDate } from "@/lib/format";
import { Landmark } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useMemo } from "react";

const TIPO_COLORS: Record<string, string> = {
  aporte: "bg-emerald-500/10 text-emerald-600",
  retorno: "bg-amber-500/10 text-amber-600",
  emprestimo: "bg-blue-500/10 text-blue-600",
  investimento: "bg-purple-500/10 text-purple-600",
};

export default function PatrimonialPage() {
  const { client, clientId } = useClient();
  const patrimonial = client.patrimonial || [];

  if (clientId !== "tijolos" || !patrimonial.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Landmark className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <h2 className="text-lg font-semibold font-serif">Patrimonial não disponível</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Este módulo está disponível apenas para clientes com movimentação patrimonial.
        </p>
      </div>
    );
  }

  const byTipo = useMemo(() => {
    const map: Record<string, number> = {};
    patrimonial.forEach((p) => {
      map[p.tipo] = (map[p.tipo] || 0) + p.valor;
    });
    return Object.entries(map).map(([tipo, valor]) => ({ tipo, valor }));
  }, [patrimonial]);

  const bySocio = useMemo(() => {
    const map: Record<string, { aportes: number; retornos: number }> = {};
    patrimonial.forEach((p) => {
      if (!map[p.socio]) map[p.socio] = { aportes: 0, retornos: 0 };
      if (p.tipo === "aporte" || p.tipo === "investimento") map[p.socio].aportes += p.valor;
      else map[p.socio].retornos += Math.abs(p.valor);
    });
    return Object.entries(map).map(([socio, vals]) => ({ socio, ...vals }));
  }, [patrimonial]);

  const totalAportes = patrimonial.filter((p) => p.valor > 0).reduce((s, p) => s + p.valor, 0);
  const totalRetornos = patrimonial.filter((p) => p.valor < 0).reduce((s, p) => s + p.valor, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Landmark className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold font-serif">Patrimonial</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Aportes, retornos e empréstimos — {client.nome}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl p-4 shadow-sm">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Aportes</p>
          <p className="text-lg font-semibold font-mono text-emerald-600 mt-1">{formatCurrency(totalAportes)}</p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-sm">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Retornos</p>
          <p className="text-lg font-semibold font-mono text-red-500 mt-1">{formatCurrency(totalRetornos)}</p>
        </div>
      </div>

      {/* Chart by Socio */}
      {bySocio.length > 0 && (
        <div className="bg-card rounded-xl shadow-sm p-6">
          <h2 className="text-sm font-semibold mb-4 font-serif">Movimentação por Sócio</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bySocio}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e0" />
                <XAxis dataKey="socio" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="aportes" name="Aportes" fill="#3D5A40" radius={[4, 4, 0, 0]} />
                <Bar dataKey="retornos" name="Retornos" fill="#E07A5F" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-card rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className="text-left">Data</th>
                <th className="text-left">Tipo</th>
                <th className="text-left">Sócio</th>
                <th className="text-left">Descrição</th>
                <th className="text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {patrimonial.map((p, i) => (
                <tr key={i}>
                  <td className="font-mono text-xs">{formatDate(p.data)}</td>
                  <td>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${TIPO_COLORS[p.tipo] || 'bg-muted text-muted-foreground'}`}>
                      {p.tipo}
                    </span>
                  </td>
                  <td className="text-xs">{p.socio}</td>
                  <td className="text-xs">{p.descricao}</td>
                  <td className={`text-right font-mono text-xs ${p.valor < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                    {formatCurrency(p.valor)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
