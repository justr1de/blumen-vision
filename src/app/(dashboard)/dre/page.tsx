"use client";
import { useAuth } from "../layout";
import { FileSpreadsheet } from "lucide-react";

export default function DREPage() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileSpreadsheet className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold font-serif">DRE Gerencial</h1>
          <p className="text-sm text-muted-foreground mt-1">Demonstrativo de Resultado do Exercício</p>
        </div>
      </div>
      <div className="bg-card rounded-xl shadow-sm p-8 border border-border/50 flex items-center justify-center min-h-[400px]">
        <div className="text-center text-muted-foreground">
          <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <h3 className="text-lg font-medium mb-2">DRE será gerado após importação</h3>
          <p className="text-sm max-w-md">Faça upload das planilhas financeiras na seção Uploads para gerar o DRE automaticamente.</p>
        </div>
      </div>
    </div>
  );
}
