export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getClientData, getAllClients, getClientIds } from "@/lib/data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("client");
  const section = searchParams.get("section");

  // Lista de clientes
  if (!clientId) {
    return NextResponse.json({
      clients: getAllClients(),
      ids: getClientIds(),
    });
  }

  const data = getClientData(clientId);
  if (!data) {
    return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
  }

  // Seção específica
  if (section) {
    const sectionData = (data as any)[section];
    if (sectionData === undefined) {
      return NextResponse.json({ error: "Seção não encontrada" }, { status: 404 });
    }
    return NextResponse.json({ [section]: sectionData });
  }

  // Dados completos
  return NextResponse.json(data);
}
