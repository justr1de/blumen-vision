"use client";
import { useAuth } from "../layout";
import { CreditCard } from "lucide-react";

export default function CrediarioPage() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CreditCard className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold font-serif">Crediário</h1>
          <p className="text-sm text-muted-foreground mt-1">Contas a receber e financiamentos</p>
        </div>
      </div>
      <div className="bg-card rounded-xl shadow-sm p-8 border border-border/50 flex items-center justify-center min-h-[400px]">
        <div className="text-center text-muted-foreground">
          <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <h3 className="text-lg font-medium mb-2">Dados de crediário</h3>
          <p className="text-sm max-w-md">Informações de crediário serão exibidas após importação dos dados.</p>
        </div>
      </div>
    </div>
  );
}
