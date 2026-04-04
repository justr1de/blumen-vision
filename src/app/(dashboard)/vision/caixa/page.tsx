'use client';

import { Wallet, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

export default function VisionCaixaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
          Vision Caixa
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Fluxo de caixa, receitas, despesas e projeções financeiras
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Entradas</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-500">R$ 0,00</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Saídas</span>
            <ArrowDownRight className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-red-500">R$ 0,00</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Saldo</span>
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold font-mono">R$ 0,00</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-12 text-center">
        <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
        <p className="text-muted-foreground">Faça upload de planilhas para visualizar dados</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Acesse a seção Uploads para importar seus dados financeiros</p>
      </div>
    </div>
  );
}
