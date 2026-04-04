'use client';

import { Brain } from 'lucide-react';

export default function VisionDecisaoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Vision Decisão</h1>
        <p className="text-sm text-muted-foreground mt-1">Análises preditivas e suporte à decisão com IA</p>
      </div>
      <div className="bg-card rounded-xl border border-border p-12 text-center">
        <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
        <p className="text-muted-foreground">Módulo de decisão com inteligência artificial</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Cenários, projeções e recomendações baseadas em dados</p>
      </div>
    </div>
  );
}
