"use client";

import { useClient } from "../layout";
import { formatCurrency } from "@/lib/format";
import { useState, useMemo } from "react";
import { Search, ChevronRight, ChevronDown } from "lucide-react";

export default function DREPage() {
  const { client } = useClient();
  const [search, setSearch] = useState("");
  const [expandedCodes, setExpandedCodes] = useState<Set<string>>(new Set());

  const dreData = client.dre || [];
  const meses = useMemo(() => {
    if (!dreData.length) return [];
    const first = dreData[0];
    return Object.keys(first.valores || {});
  }, [dreData]);

  const filteredDre = useMemo(() => {
    if (!search) return dreData;
    const q = search.toLowerCase();
    return dreData.filter(
      (d) => d.nome.toLowerCase().includes(q) || d.codigo.toLowerCase().includes(q)
    );
  }, [dreData, search]);

  const toggleExpand = (code: string) => {
    setExpandedCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const hasChildren = (code: string) =>
    dreData.some((d) => d.codigo_pai === code);

  const isVisible = (item: typeof dreData[0]) => {
    if (!item.codigo_pai) return true;
    return expandedCodes.has(item.codigo_pai);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif">DRE Gerencial</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Demonstrativo de Resultado do Exercício — {client.nome}
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar conta..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className="text-left min-w-[300px]">Conta</th>
                {meses.map((m) => (
                  <th key={m} className="text-right min-w-[120px]">{m}</th>
                ))}
                <th className="text-right min-w-[130px]">Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredDre.filter(isVisible).map((item) => {
                const isTotalizadora = item.tipo === "totalizadora";
                const canExpand = hasChildren(item.codigo);
                const isExpanded = expandedCodes.has(item.codigo);
                const indent = (item.nivel - 1) * 16;

                return (
                  <tr
                    key={item.codigo}
                    className={isTotalizadora ? "font-semibold bg-muted/30" : ""}
                  >
                    <td>
                      <div className="flex items-center gap-1" style={{ paddingLeft: indent }}>
                        {canExpand ? (
                          <button
                            onClick={() => toggleExpand(item.codigo)}
                            className="p-0.5 rounded hover:bg-muted"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                          </button>
                        ) : (
                          <span className="w-4" />
                        )}
                        <span className="text-xs text-muted-foreground font-mono mr-2">
                          {item.codigo}
                        </span>
                        <span className={isTotalizadora ? "" : "text-foreground/80"}>
                          {item.nome}
                        </span>
                      </div>
                    </td>
                    {meses.map((m) => (
                      <td key={m} className="text-right font-mono text-xs">
                        <span className={item.valores[m] < 0 ? "text-red-500" : ""}>
                          {formatCurrency(item.valores[m] ?? 0)}
                        </span>
                      </td>
                    ))}
                    <td className="text-right font-mono text-xs font-semibold">
                      <span className={item.total < 0 ? "text-red-500" : ""}>
                        {formatCurrency(item.total)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
