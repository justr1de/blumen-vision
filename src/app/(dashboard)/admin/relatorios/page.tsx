'use client';

import { BarChart3 } from 'lucide-react';

export default function RelatoriosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Relatórios</h1>
        <p className="text-sm text-muted-foreground mt-1">Relatórios consolidados de todos os tenants</p>
      </div>
      <div className="bg-card rounded-xl border border-border p-12 text-center">
        <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
        <p className="text-muted-foreground">Nenhum relatório disponível</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Os relatórios gerados pelos tenants aparecerão aqui</p>
      </div>
    </div>
  );
}
