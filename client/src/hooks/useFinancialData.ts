import { useClient } from "@/contexts/ClientContext";
import imediataData from "@/data/financialData.json";
import tijolosData from "@/data/tijolosData.json";

export function useFinancialData() {
  const { clientId } = useClient();
  if (clientId === "tijolos") return tijolosData as any;
  return imediataData as any;
}
