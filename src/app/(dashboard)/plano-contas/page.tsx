"use client";
import { useAuth } from "../layout";
import { List } from "lucide-react";

export default function PlanoContasPage() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <List className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold font-serif">Plano de Contas</h1>
          <p className="text-sm text-muted-foreground mt-1">Estrutura hierárquica de contas contábeis</p>
        </div>
      </div>
      <div className="bg-card rounded-xl shadow-sm p-8 border border-border/50 flex items-center justify-center min-h-[400px]">
        <div className="text-center text-muted-foreground">
          <List className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <h3 className="text-lg font-medium mb-2">Plano de contas será configurado</h3>
          <p className="text-sm max-w-md">A estrutura de contas será gerada automaticamente a partir das planilhas importadas.</p>
        </div>
      </div>
    </div>
  );
}
