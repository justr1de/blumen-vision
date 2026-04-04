import { createContext, useContext, useState, type ReactNode } from "react";

export type ClientId = "imediata" | "tijolos";

interface ClientInfo {
  id: ClientId;
  nome: string;
  periodo: string;
  tipo: string;
}

const clients: Record<ClientId, ClientInfo> = {
  imediata: {
    id: "imediata",
    nome: "Grupo Imediata",
    periodo: "Mai/2025 — Jan/2026",
    tipo: "Financeira",
  },
  tijolos: {
    id: "tijolos",
    nome: "Indústria de Tijolos",
    periodo: "Ago/2022 — Dez/2022",
    tipo: "Indústria Cerâmica",
  },
};

interface ClientContextType {
  clientId: ClientId;
  client: ClientInfo;
  setClientId: (id: ClientId) => void;
  allClients: ClientInfo[];
}

const ClientContext = createContext<ClientContextType | null>(null);

export function ClientProvider({ children }: { children: ReactNode }) {
  const [clientId, setClientId] = useState<ClientId>("tijolos");
  const client = clients[clientId];
  const allClients = Object.values(clients);

  return (
    <ClientContext.Provider value={{ clientId, client, setClientId, allClients }}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClient() {
  const ctx = useContext(ClientContext);
  if (!ctx) throw new Error("useClient must be used within ClientProvider");
  return ctx;
}
