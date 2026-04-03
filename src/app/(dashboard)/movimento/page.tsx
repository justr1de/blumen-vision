"use client";

import { useClient } from "../layout";
import { formatCurrency, formatDate } from "@/lib/format";
import { useState, useMemo } from "react";
import { Search, ArrowUpDown, Download } from "lucide-react";

export default function MovimentoPage() {
  const { client } = useClient();
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"data" | "valor">("data");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filterBanco, setFilterBanco] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 50;

  const movimento = client.movimento || [];

  const bancos = useMemo(() => [...new Set(movimento.map((m) => m.banco).filter(Boolean))], [movimento]);
  const tipos = useMemo(() => [...new Set(movimento.map((m) => m.tipo).filter(Boolean))], [movimento]);

  const filtered = useMemo(() => {
    let items = [...movimento];
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (m) =>
          m.descricao.toLowerCase().includes(q) ||
          m.codigo.toLowerCase().includes(q) ||
          (m.banco || "").toLowerCase().includes(q)
      );
    }
    if (filterBanco) items = items.filter((m) => m.banco === filterBanco);
    if (filterTipo) items = items.filter((m) => m.tipo === filterTipo);

    items.sort((a, b) => {
      const mul = sortDir === "asc" ? 1 : -1;
      if (sortField === "data") return mul * (new Date(a.data).getTime() - new Date(b.data).getTime());
      return mul * (a.valor - b.valor);
    });
    return items;
  }, [movimento, search, filterBanco, filterTipo, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const totalReceitas = filtered.filter((m) => m.valor > 0).reduce((s, m) => s + m.valor, 0);
  const totalDespesas = filtered.filter((m) => m.valor < 0).reduce((s, m) => s + m.valor, 0);

  const toggleSort = (field: "data" | "valor") => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const handleExportCSV = () => {
    const header = "Data,Código,Descrição,Valor,Tipo,Banco,Loja,Categoria\n";
    const rows = filtered
      .map((m) =>
        `"${formatDate(m.data)}","${m.codigo}","${m.descricao}",${m.valor},"${m.tipo}","${m.banco || ""}","${m.loja || ""}","${m.categoria || ""}"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `movimento_${client.nome.replace(/\s/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif">Movimento Analítico</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} lançamentos — {client.nome}
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="glass-btn flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          title="Exportar CSV"
        >
          <Download className="w-4 h-4" />
          Exportar
        </button>
      </div>

      {/* Totais */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-4 shadow-sm">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Receitas</p>
          <p className="text-lg font-semibold font-mono text-emerald-600 mt-1">{formatCurrency(totalReceitas)}</p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-sm">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Despesas</p>
          <p className="text-lg font-semibold font-mono text-red-500 mt-1">{formatCurrency(totalDespesas)}</p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-sm">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Saldo</p>
          <p className={`text-lg font-semibold font-mono mt-1 ${totalReceitas + totalDespesas >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {formatCurrency(totalReceitas + totalDespesas)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar lançamento..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        {bancos.length > 0 && (
          <select
            value={filterBanco}
            onChange={(e) => { setFilterBanco(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-lg bg-card border border-border text-sm"
          >
            <option value="">Todos os bancos</option>
            {bancos.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        )}
        {tipos.length > 0 && (
          <select
            value={filterTipo}
            onChange={(e) => { setFilterTipo(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-lg bg-card border border-border text-sm"
          >
            <option value="">Todos os tipos</option>
            {tipos.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        )}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className="text-left cursor-pointer" onClick={() => toggleSort("data")}>
                  <span className="flex items-center gap-1">Data <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="text-left">Código</th>
                <th className="text-left min-w-[250px]">Descrição</th>
                <th className="text-right cursor-pointer" onClick={() => toggleSort("valor")}>
                  <span className="flex items-center justify-end gap-1">Valor <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="text-left">Tipo</th>
                <th className="text-left">Banco</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((m, i) => (
                <tr key={`${m.codigo}-${i}`}>
                  <td className="font-mono text-xs whitespace-nowrap">{formatDate(m.data)}</td>
                  <td className="font-mono text-xs">{m.codigo}</td>
                  <td className="text-xs">{m.descricao}</td>
                  <td className={`text-right font-mono text-xs ${m.valor < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                    {formatCurrency(m.valor)}
                  </td>
                  <td className="text-xs">{m.tipo}</td>
                  <td className="text-xs">{m.banco || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Página {page} de {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-md text-xs bg-muted hover:bg-muted/80 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-md text-xs bg-muted hover:bg-muted/80 disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
