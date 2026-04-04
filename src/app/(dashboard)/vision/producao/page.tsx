'use client';

import { Factory } from 'lucide-react';

export default function VisionProducaoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Vision Produção</h1>
        <p className="text-sm text-muted-foreground mt-1">Indicadores de produção e eficiência operacional</p>
      </div>
      <div className="bg-card rounded-xl border border-border p-12 text-center">
        <Factory className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
        <p className="text-muted-foreground">Faça upload de planilhas para visualizar dados</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Vendas, milheiros, clientes e produtividade</p>
      </div>
    </div>
  );
}
