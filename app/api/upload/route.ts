import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import pool from '@/lib/db'
import * as XLSX from 'xlsx'
import { extractDataFromPDF } from '@/lib/gemini-ocr'

export const config = {
  api: {
    bodyParser: false,
  },
}

// Formatos suportados
const SPREADSHEET_EXTS = ['xlsx', 'xls', 'csv']
const PDF_EXTS = ['pdf']
const IMAGE_EXTS = ['png', 'jpg', 'jpeg', 'webp']
const ALL_SUPPORTED = [...SPREADSHEET_EXTS, ...PDF_EXTS, ...IMAGE_EXTS]

const MIME_MAP: Record<string, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xls: 'application/vnd.ms-excel',
  csv: 'text/csv',
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

// Tentar extrair campos comuns de uma linha de planilha
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
    const match = v.match(/(\d{2})\/(\d{2})\/(\d{4})/)
    if (match) return `${match[3]}-${match[2]}-${match[1]}`
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

// Processar planilha (xlsx, xls, csv)
async function processSpreadsheet(buffer: Buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' }) as Record<string, unknown>[]

  if (rows.length === 0) {
    throw new Error('Planilha vazia ou sem dados válidos')
  }

  const originalCols = Object.keys(rows[0])
  const colMap: Record<string, string> = {}
  for (const col of originalCols) {
    colMap[normalizeCol(col)] = col
  }

  const processedRows = rows.map((row) => {
    const common = extractCommonFields(row, colMap)
    return { raw: row, processed: common }
  })

  return { rows: processedRows, columns: originalCols, source: 'spreadsheet' as const }
}

// Processar PDF/imagem via Gemini OCR
async function processDocument(buffer: Buffer, mimeType: string, filename: string) {
  const result = await extractDataFromPDF(buffer, mimeType, filename)

  if (!result.success && result.rows.length === 0) {
    throw new Error(result.error || 'Falha ao processar documento via OCR')
  }

  const processedRows = result.rows.map((row) => ({
    raw: row,
    processed: {
      cpf: row.cpf || null,
      nome_cliente: row.nome_cliente || null,
      contrato: row.contrato || null,
      produto: row.produto || null,
      status_operacao: row.status_operacao || null,
      valor_principal: typeof row.valor_principal === 'number' ? row.valor_principal : null,
      valor_parcela: typeof row.valor_parcela === 'number' ? row.valor_parcela : null,
      data_operacao: row.data_operacao || null,
      data_pagamento: row.data_pagamento || null,
    },
  }))

  return {
    rows: processedRows,
    columns: result.columns || [],
    source: 'gemini_ocr' as const,
    raw_text: result.raw_text,
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

    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    if (!ALL_SUPPORTED.includes(ext)) {
      return NextResponse.json({
        error: `Formato .${ext} não suportado. Use: ${ALL_SUPPORTED.join(', ')}`,
      }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    // Processar conforme tipo
    let result
    if (SPREADSHEET_EXTS.includes(ext)) {
      result = await processSpreadsheet(buffer)
    } else {
      const mimeType = MIME_MAP[ext] || 'application/octet-stream'
      result = await processDocument(buffer, mimeType, file.name)
    }

    if (result.rows.length === 0) {
      return NextResponse.json({
        error: 'Nenhum dado foi extraído do documento. Verifique se o arquivo contém dados tabulares.',
      }, { status: 400 })
    }

    // Salvar no banco de dados (isolado por tenant)
    // Tabela uploads real: id, tenant_id, user_id, filename, file_url, file_key, mime_type, size, status, resultado, created_at, updated_at
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const fileKey = `uploads/${session.tenantId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
      const mimeType = MIME_MAP[ext] || 'application/octet-stream'

      const uploadResult = await client.query(
        `INSERT INTO uploads (tenant_id, user_id, filename, file_url, file_key, mime_type, size, status, resultado, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'completed', $8, NOW(), NOW())
         RETURNING id`,
        [
          session.tenantId,
          session.id,
          file.name,
          fileKey,
          fileKey,
          mimeType,
          file.size,
          JSON.stringify({
            row_count: result.rows.length,
            columns: result.columns,
            source: result.source,
          }),
        ]
      )
      const uploadId = uploadResult.rows[0].id

      // Inserir cada linha processada na tabela report_data
      for (let i = 0; i < result.rows.length; i++) {
        const { raw, processed } = result.rows[i]

        await client.query(
          `INSERT INTO report_data (
            tenant_id, upload_id, row_number,
            cpf, nome_cliente, contrato, produto, status_operacao,
            valor_principal, valor_parcela, data_operacao, data_pagamento,
            raw_data, processed_data
          )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
          [
            session.tenantId,
            uploadId,
            i + 1,
            processed.cpf,
            processed.nome_cliente,
            processed.contrato,
            processed.produto,
            processed.status_operacao,
            processed.valor_principal,
            processed.valor_parcela,
            processed.data_operacao,
            processed.data_pagamento,
            JSON.stringify(raw),
            JSON.stringify(processed),
          ]
        )
      }

      await client.query('COMMIT')

      return NextResponse.json({
        ok: true,
        uploadId,
        rowCount: result.rows.length,
        columns: result.columns,
        source: result.source,
        message: result.source === 'gemini_ocr'
          ? `Documento processado via OCR inteligente. ${result.rows.length} registros extraídos.`
          : `Planilha processada. ${result.rows.length} registros importados.`,
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
    const message = error instanceof Error ? error.message : 'Erro ao processar arquivo'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
