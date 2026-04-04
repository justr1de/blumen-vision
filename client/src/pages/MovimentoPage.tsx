/*
 * Movimento — Nordic Data Landscape (Multi-cliente)
 */
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrency, colorForValue } from "@/lib/format";
import { useFinancialData } from "@/hooks/useFinancialData";
import { useClient } from "@/contexts/ClientContext";
import { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { motion } from "framer-motion";

const PAGE_SIZE = 20;

export default function MovimentoPage() {
  const data = useFinancialData();
  const { client, clientId } = useClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const isTijolos = clientId === "tijolos";
  const items = data.movimento_top || [];

  const columns = isTijolos
    ? [
        { key: "Data", label: "Data" },
        { key: "Cliente", label: "Cliente" },
        { key: "Tipo_Venda", label: "Tipo Venda" },
        { key: "Forma_Pgto", label: "Forma Pgto" },
        { key: "Tipo_Tijolo", label: "Produto" },
        { key: "Qtd", label: "Qtd" },
        { key: "Total", label: "Total" },
        { key: "Tipo_Cliente", label: "Tipo Cliente" },
      ]
    : [
        { key: "Caixa", label: "Data" },
        { key: "Tipo", label: "Tipo" },
        { key: "Categoria", label: "Categoria" },
        { key: "Detalhamento", label: "Detalhamento" },
        { key: "Valor", label: "Valor" },
        { key: "Loja", label: "Loja" },
        { key: "Banco", label: "Banco" },
      ];

  const filtered = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter((row: any) =>
      Object.values(row).some((v: any) => String(v).toLowerCase().includes(q))
    );
  }, [items, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold" >
          Movimento Analítico
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isTijolos ? 'Top 50 vendas por valor' : 'Top 100 lançamentos por valor'} — {client.nome}
        </p>
      </motion.div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Filtrar lançamentos..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="pl-9 text-sm"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    {columns.map((col) => (
                      <th key={col.key} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          {col.label}
                          <ArrowUpDown className="w-3 h-3 opacity-30" />
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paged.map((row: any, i: number) => (
                    <tr key={i} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      {columns.map((col) => {
                        const val = row[col.key];
                        const isValue = col.key === "Total" || col.key === "Valor";
                        return (
                          <td key={col.key} className={`px-4 py-2.5 whitespace-nowrap text-xs ${isValue ? 'font-mono text-right ' + colorForValue(val) : ''}`}>
                            {isValue ? formatCurrency(val) : String(val || '—')}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t border-border/30">
              <p className="text-xs text-muted-foreground">
                {filtered.length} registros | Página {page + 1} de {totalPages || 1}
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="p-1.5 rounded hover:bg-muted disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="p-1.5 rounded hover:bg-muted disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
