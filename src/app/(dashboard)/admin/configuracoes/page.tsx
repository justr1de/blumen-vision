'use client';

import { Settings } from 'lucide-react';

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Configurações</h1>
        <p className="text-sm text-muted-foreground mt-1">Configurações gerais do sistema</p>
      </div>
      <div className="bg-card rounded-xl border border-border p-12 text-center">
        <Settings className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
        <p className="text-muted-foreground">Configurações do sistema</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Em breve</p>
      </div>
    </div>
  );
}
