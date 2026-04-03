import financialData from "@/data/financialData.json";
import tijolosData from "@/data/tijolosData.json";
import type { ClientData } from "@/types/financial";

const clients: Record<string, ClientData> = {
  imediata: financialData as unknown as ClientData,
  tijolos: tijolosData as unknown as ClientData,
};

export function getClientIds(): string[] {
  return Object.keys(clients);
}

export function getClientData(clientId: string): ClientData | null {
  return clients[clientId] || null;
}

export function getAllClients(): { id: string; nome: string; tipo: string }[] {
  return Object.entries(clients).map(([id, data]) => ({
    id,
    nome: data.nome,
    tipo: data.tipo,
  }));
}
