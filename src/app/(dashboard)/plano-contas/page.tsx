"use client";

import { useClient } from "../layout";
import { useState, useMemo } from "react";
import { Search, ChevronRight, ChevronDown, BookOpen } from "lucide-react";

export default function PlanoContasPage() {
  const { client } = useClient();
  const [search, setSearch] = useState("");
  const [expandedCodes, setExpandedCodes] = useState<Set<string>>(new Set());

  const plano = client.plano_contas || [];

  const filtered = useMemo(() => {
    if (!search) return plano;
    const q = search.toLowerCase();
    return plano.filter(
      (p) => p.nome.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q)
    );
  }, [plano, search]);

  const toggleExpand = (code: string) => {
    setExpandedCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const hasChildren = (code: string) => plano.some((p) => p.codigo_pai === code);

  const isVisible = (item: typeof plano[0]) => {
    if (!item.codigo_pai) return true;
    // Check all ancestors
    let parent = item.codigo_pai;
    while (parent) {
      if (!expandedCodes.has(parent)) return false;
      const parentItem = plano.find((p) => p.codigo === parent);
      parent = parentItem?.codigo_pai || "";
    }
    return true;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold font-serif">Plano de Contas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Estrutura hierárquica — {client.nome}
          </p>
        </div>
      </div>

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

      <div className="bg-card rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className="text-left min-w-[400px]">Conta</th>
                <th className="text-left">Tipo</th>
                <th className="text-left">Categoria Gerencial</th>
              </tr>
            </thead>
            <tbody>
              {filtered.filter(isVisible).map((item) => {
                const canExpand = hasChildren(item.codigo);
                const isExpanded = expandedCodes.has(item.codigo);
                const indent = (item.nivel - 1) * 20;
                const isTotalizadora = item.tipo === "totalizadora";

                return (
                  <tr key={item.codigo} className={isTotalizadora ? "font-semibold bg-muted/20" : ""}>
                    <td>
                      <div className="flex items-center gap-1" style={{ paddingLeft: indent }}>
                        {canExpand ? (
                          <button onClick={() => toggleExpand(item.codigo)} className="p-0.5 rounded hover:bg-muted">
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          </button>
                        ) : (
                          <span className="w-4" />
                        )}
                        <span className="text-xs text-muted-foreground font-mono mr-2">{item.codigo}</span>
                        <span>{item.nome}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        isTotalizadora
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {item.tipo}
                      </span>
                    </td>
                    <td className="text-xs text-muted-foreground">{item.categoria_gerencial || '—'}</td>
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
