import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import pool from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  try {
    // Buscar uploads do tenant (usando colunas reais: filename, mime_type, size, resultado)
    const uploads = await pool.query(
      `SELECT id, filename, mime_type, size, resultado, created_at
       FROM uploads WHERE tenant_id = $1 AND status = 'completed'
       ORDER BY created_at DESC`,
      [session.tenantId]
    )

    // Buscar dados processados (report_data)
    const data = await pool.query(
      `SELECT rd.id, rd.row_number, rd.cpf, rd.nome_cliente, rd.contrato,
              rd.produto, rd.status_operacao, rd.valor_principal, rd.valor_parcela,
              rd.data_operacao, rd.data_pagamento, u.filename
       FROM report_data rd
       JOIN uploads u ON rd.upload_id = u.id
       WHERE rd.tenant_id = $1
       ORDER BY u.created_at DESC, rd.row_number ASC
       LIMIT 500`,
      [session.tenantId]
    )

    return NextResponse.json({
      uploads: uploads.rows,
      data: data.rows,
      error: null,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    console.error('[API Dados] Erro:', message)

    if (message.includes('does not exist') || message.includes('relation')) {
      return NextResponse.json({ uploads: [], data: [], error: 'tables_missing' })
    }
    return NextResponse.json({ uploads: [], data: [], error: 'unknown' })
  }
}
