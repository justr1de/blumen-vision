/*
 * Plano de Contas — Nordic Data Landscape (Multi-cliente)
 */
import { Card, CardContent } from "@/components/ui/card";
import { useFinancialData } from "@/hooks/useFinancialData";
import { useClient } from "@/contexts/ClientContext";
import { useState, useMemo } from "react";
import { Search, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export default function PlanoContasPage() {
  const data = useFinancialData();
  const { client } = useClient();
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");

  const plano = data.plano_contas || [];

  const categories = useMemo(() => {
    const cats = new Set<string>();
    plano.forEach((c: any) => { if (c.categoria) cats.add(c.categoria); });
    return Array.from(cats).sort();
  }, [plano]);

  const filtered = useMemo(() => {
    return plano.filter((c: any) => {
      const matchSearch = !search ||
        (c.descricao || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.detalhamento || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.ordem || '').toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCat === "all" || c.categoria === filterCat;
      return matchSearch && matchCat;
    });
  }, [plano, search, filterCat]);

  // Group by category
  const grouped = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filtered.forEach((c: any) => {
      const cat = c.categoria || 'Sem Categoria';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(c);
    });
    return groups;
  }, [filtered]);

  const catColors: Record<string, string> = {
    'Receitas': 'bg-blumen-olive/10 text-blumen-olive border-blumen-olive/20',
    'Deduções da Receita': 'bg-amber-100 text-amber-800 border-amber-200',
    'Despesas': 'bg-destructive/10 text-destructive border-destructive/20',
    'Investimentos': 'bg-blue-50 text-blue-700 border-blue-200',
    'Patrimonial': 'bg-purple-50 text-purple-700 border-purple-200',
    'Financeiro': 'bg-blumen-navy/10 text-blumen-navy border-blumen-navy/20',
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-bold" >
              Plano de Contas
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {plano.length} contas mapeadas — {client.nome}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código, descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground"
        >
          <option value="all">Todas as Categorias</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Grouped Cards */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([cat, items], gi) => (
          <motion.div
            key={cat}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: gi * 0.05 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium border ${catColors[cat] || 'bg-muted text-muted-foreground border-border'}`}>
                {cat}
              </span>
              <span className="text-xs text-muted-foreground">{items.length} contas</span>
            </div>
            <Card className="border-0 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30">
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider w-24">Código</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Descrição</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Detalhamento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((conta: any, i: number) => (
                      <tr key={i} className="border-b border-border/20 hover:bg-muted/10 transition-colors">
                        <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{conta.ordem || conta.codigo || '—'}</td>
                        <td className="px-4 py-2 text-xs">{conta.descricao || conta.nome || '—'}</td>
                        <td className="px-4 py-2 text-xs text-muted-foreground">{conta.detalhamento || conta.tipo || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
