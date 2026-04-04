"use client";
import { useAuth } from "../layout";
import { Receipt } from "lucide-react";

export default function MovimentoPage() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Receipt className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold font-serif">Movimento Analítico</h1>
          <p className="text-sm text-muted-foreground mt-1">Lançamentos financeiros detalhados</p>
        </div>
      </div>
      <div className="bg-card rounded-xl shadow-sm p-8 border border-border/50 flex items-center justify-center min-h-[400px]">
        <div className="text-center text-muted-foreground">
          <Receipt className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <h3 className="text-lg font-medium mb-2">Nenhum lançamento importado</h3>
          <p className="text-sm max-w-md">Os lançamentos serão exibidos após o processamento das planilhas financeiras.</p>
        </div>
      </div>
    </div>
  );
}
