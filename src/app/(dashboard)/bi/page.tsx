"use client";
import { useAuth } from "../layout";
import { BarChart3 } from "lucide-react";

export default function BIPage() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold font-serif">BI Gerencial</h1>
          <p className="text-sm text-muted-foreground mt-1">Business Intelligence e indicadores estratégicos</p>
        </div>
      </div>
      <div className="bg-card rounded-xl shadow-sm p-8 border border-border/50 flex items-center justify-center min-h-[400px]">
        <div className="text-center text-muted-foreground">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <h3 className="text-lg font-medium mb-2">Dashboards de BI</h3>
          <p className="text-sm max-w-md">Os dashboards interativos serão gerados após a importação e processamento dos dados financeiros.</p>
        </div>
      </div>
    </div>
  );
}
