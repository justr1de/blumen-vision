import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import pool from '@/lib/db'
import * as XLSX from 'xlsx'

export const config = {
  api: {
    bodyParser: false,
  },
}

// Normalizar nome de coluna para facilitar mapeamento
function normalizeCol(col: string): string {
  return col
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
}

// Tentar extrair campos comuns de uma linha
function extractCommonFields(row: Record<string, unknown>, colMap: Record<string, string>) {
  const get = (keys: string[]): string | null => {
    for (const k of keys) {
      const mapped = colMap[k]
      if (mapped && row[mapped] != null && String(row[mapped]).trim() !== '') {
        return String(row[mapped]).trim()
      }
    }
    return null
  }

  const getNum = (keys: string[]): number | null => {
    const v = get(keys)
    if (!v) return null
    const n = parseFloat(v.replace(/[^\d.,-]/g, '').replace(',', '.'))
    return isNaN(n) ? null : n
  }

  const getDate = (keys: string[]): string | null => {
    const v = get(keys)
    if (!v) return null
    // Tentar parse de data dd/mm/yyyy
    const match = v.match(/(\d{2})\/(\d{2})\/(\d{4})/)
    if (match) return `${match[3]}-${match[2]}-${match[1]}`
    // Tentar yyyy-mm-dd
    if (v.match(/\d{4}-\d{2}-\d{2}/)) return v.substring(0, 10)
    return null
  }

  return {
    cpf: get(['cpf', 'cpf_cliente', 'cpf_do_cliente', 'cpf_agente']),
    nome_cliente: get(['nome_cliente', 'cliente', 'nome', 'nome_do_cliente', 'nome_completo']),
    contrato: get(['contrato', 'numero_contrato', 'nro_contrato', 'numero_operacao', 'numero_operacao_bmg', 'numero_da_operacao_no_bmg']),
    produto: get(['produto', 'nome_servico', 'nome_do_servico', 'tipo_servico', 'tipo_do_servico']),
    status_operacao: get(['status', 'status_operacao', 'status_da_operacao', 'situacao']),
    valor_principal: getNum(['valor_financiado', 'vlr_base', 'valor', 'valor_total', 'valor_total_emprestimo', 'valor_do_emprestimo']),
    valor_parcela: getNum(['valor_parcela', 'vlr_parcela', 'parcela']),
    data_operacao: getDate(['data_operacao', 'dt_operacao', 'data_entrada', 'data_entrada_pn', 'data_de_entrada_na_pn']),
    data_pagamento: getDate(['data_pagamento', 'dt_pagamento', 'data_de_pagamento']),
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    // Verificar tamanho (32MB para Cloud Run)
    if (file.size > 32 * 1024 * 1024) {
      return NextResponse.json({ error: 'Arquivo muito grande. Máximo 32MB.' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['xlsx', 'xls', 'csv'].includes(ext || '')) {
      return NextResponse.json({ error: 'Formato não suportado. Use .xlsx, .xls ou .csv' }, { status: 400 })
    }

    // Ler arquivo
    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' }) as Record<string, unknown>[]

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Planilha vazia ou sem dados válidos' }, { status: 400 })
    }

    // Mapear colunas normalizadas para nomes originais
    const originalCols = Object.keys(rows[0])
    const colMap: Record<string, string> = {}
    for (const col of originalCols) {
      colMap[normalizeCol(col)] = col
    }

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // Criar registro de upload
      const storedFilename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
      const uploadResult = await client.query(
        `INSERT INTO uploads (tenant_id, user_id, original_filename, stored_filename, file_size, file_type, status, row_count, processed_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'completed', $7, NOW())
         RETURNING id`,
        [session.tenantId, session.id, file.name, storedFilename, file.size, ext, rows.length]
      )
      const uploadId = uploadResult.rows[0].id

      // Processar cada linha
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const common = extractCommonFields(row, colMap)

        await client.query(
          `INSERT INTO report_data (tenant_id, upload_id, row_number, cpf, nome_cliente, contrato, produto, status_operacao, valor_principal, valor_parcela, data_operacao, data_pagamento, raw_data, processed_data)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
          [
            session.tenantId,
            uploadId,
            i + 1,
            common.cpf,
            common.nome_cliente,
            common.contrato,
            common.produto,
            common.status_operacao,
            common.valor_principal,
            common.valor_parcela,
            common.data_operacao,
            common.data_pagamento,
            JSON.stringify(row),
            JSON.stringify(common),
          ]
        )
      }

      await client.query('COMMIT')

      return NextResponse.json({
        ok: true,
        uploadId,
        rowCount: rows.length,
        columns: originalCols,
      })
    } catch (error) {
      await client.query('ROLLBACK')
      console.error('DB error:', error)
      return NextResponse.json({ error: 'Erro ao salvar dados no banco' }, { status: 500 })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Erro ao processar arquivo' }, { status: 500 })
  }
}
