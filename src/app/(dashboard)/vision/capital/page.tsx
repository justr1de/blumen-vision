'use client';

import { TrendingUp } from 'lucide-react';

export default function VisionCapitalPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Vision Capital</h1>
        <p className="text-sm text-muted-foreground mt-1">Estrutura de capital, patrimônio e investimentos</p>
      </div>
      <div className="bg-card rounded-xl border border-border p-12 text-center">
        <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
        <p className="text-muted-foreground">Faça upload de planilhas para visualizar dados</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Aportes, retornos, empréstimos e patrimônio</p>
      </div>
    </div>
  );
}
