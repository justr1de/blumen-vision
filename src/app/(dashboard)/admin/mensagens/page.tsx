'use client';

import { MessageSquare } from 'lucide-react';

export default function MensagensPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Mensagens</h1>
        <p className="text-sm text-muted-foreground mt-1">Central de mensagens dos clientes</p>
      </div>
      <div className="bg-card rounded-xl border border-border p-12 text-center">
        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
        <p className="text-muted-foreground">Nenhuma mensagem recebida</p>
        <p className="text-xs text-muted-foreground/60 mt-1">As mensagens dos clientes aparecerão aqui</p>
      </div>
    </div>
  );
}
