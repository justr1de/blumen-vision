"use client";

import { useState, createContext, useContext, useCallback } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { getClientData, getAllClients } from "@/lib/data";
import type { ClientData } from "@/types/financial";

// ─── Client Context ──────────────────────────────────────────
interface ClientContextType {
  client: ClientData;
  clientId: string;
  setClientId: (id: string) => void;
  allClients: { id: string; nome: string; tipo: string; periodo: string }[];
}

const ClientContext = createContext<ClientContextType | null>(null);

export function useClient() {
  const ctx = useContext(ClientContext);
  if (!ctx) throw new Error("useClient must be used within DashboardLayout");
  return ctx;
}

// ─── Layout ──────────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [clientId, setClientId] = useState("imediata");
  const client = getClientData(clientId);
  const allClients = getAllClients();

  const handleClientChange = useCallback((id: string) => {
    setClientId(id);
  }, []);

  if (!client) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Carregando dados do cliente...</p>
      </div>
    );
  }

  const sidebarClients = allClients.map((c) => ({
    ...c,
    periodo: getClientData(c.id)?.periodo ?? "",
  }));

  const activeClient = {
    id: clientId,
    nome: client.nome,
    tipo: client.tipo,
    periodo: client.periodo,
  };

  return (
    <ClientContext.Provider value={{ client, clientId, setClientId: handleClientChange, allClients: sidebarClients }}>
      <div className="flex min-h-screen">
        <Sidebar
          clients={sidebarClients}
          activeClient={activeClient}
          onClientChange={handleClientChange}
        />
        <main className="flex-1 lg:ml-[260px] pt-14 lg:pt-0">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </ClientContext.Provider>
  );
}
