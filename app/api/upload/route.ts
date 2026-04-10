import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import pool from '@/lib/db'
import { extractDataFromPDF } from '@/lib/gemini-ocr'

export const config = {
  api: {
    bodyParser: false,
  },
}

// URL do Python Processor (pandas + Vertex AI) — configurada como variável de ambiente no Cloud Run
const PYTHON_PROCESSOR_URL = process.env.PYTHON_PROCESSOR_URL || ''

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

// Processar planilha delegando ao Python Processor (pandas + Vertex AI)
async function processSpreadsheet(buffer: Buffer, filename: string) {
  if (!PYTHON_PROCESSOR_URL) {
    throw new Error('PYTHON_PROCESSOR_URL não configurada. O serviço Python Processor não está disponível.')
  }

  const form = new FormData()
  form.append('file', new Blob([buffer as unknown as ArrayBuffer]), filename)

  const resp = await fetch(`${PYTHON_PROCESSOR_URL}/process?gerar_relatorio_ia=true`, {
    method: 'POST',
    body: form,
  })

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ detail: resp.statusText }))
    throw new Error(err.detail || `Python Processor retornou ${resp.status}`)
  }

  const data = await resp.json() as {
    rows: Record<string, unknown>[]
    columns: string[]
    resumo: Record<string, unknown>
    analise_por_status: unknown[]
    layout_camila_detectado: boolean
    relatorio_ia: string | null
    mapeamento_realizado: Record<string, string>
  }

  // Adaptar rows para o formato esperado pela etapa de inserção no banco
  const processedRows = data.rows.map((row) => ({
    raw: row,
    processed: {
      cpf: (row.cpf as string | null) ?? null,
      nome_cliente: (row.nome_cliente as string | null) ?? null,
      contrato: (row.contrato as string | null) ?? null,
      produto: (row.produto as string | null) ?? null,
      status_operacao: (row.status_operacao as string | null) ?? null,
      valor_principal: typeof row.valor_principal === 'number' ? row.valor_principal : null,
      valor_parcela: typeof row.valor_parcela === 'number' ? row.valor_parcela : null,
      data_operacao: (row.data_operacao as string | null) ?? null,
      data_pagamento: (row.data_pagamento as string | null) ?? null,
    },
  }))

  return {
    rows: processedRows,
    columns: data.columns,
    source: 'pandas_vertex' as const,
    resumo: data.resumo,
    analise_por_status: data.analise_por_status,
    layout_camila_detectado: data.layout_camila_detectado,
    relatorio_ia: data.relatorio_ia,
  }
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
      result = await processSpreadsheet(buffer, file.name)
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
            resumo: 'resumo' in result ? result.resumo : undefined,
            layout_camila_detectado: 'layout_camila_detectado' in result ? result.layout_camila_detectado : undefined,
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
        ...('resumo' in result && result.resumo ? { resumo: result.resumo } : {}),
        ...('analise_por_status' in result && result.analise_por_status
          ? { analise_por_status: result.analise_por_status }
          : {}),
        ...('layout_camila_detectado' in result
          ? { layout_camila_detectado: result.layout_camila_detectado }
          : {}),
        ...('relatorio_ia' in result && result.relatorio_ia
          ? { relatorio_ia: result.relatorio_ia }
          : {}),
        message: result.source === 'gemini_ocr'
          ? `Documento processado via OCR inteligente. ${result.rows.length} registros extraídos.`
          : result.source === 'pandas_vertex'
            ? `Planilha processada com pandas + Vertex AI. ${result.rows.length} registros importados.`
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
