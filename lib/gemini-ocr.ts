/**
 * Módulo de OCR usando Google Gemini para processar PDFs e imagens
 * Extrai dados estruturados de documentos financeiros
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

interface ExtractedRow {
  cpf?: string
  nome_cliente?: string
  contrato?: string
  produto?: string
  status_operacao?: string
  valor_principal?: number
  valor_parcela?: number
  data_operacao?: string
  data_pagamento?: string
  [key: string]: unknown
}

interface GeminiOCRResult {
  success: boolean
  rows: ExtractedRow[]
  raw_text?: string
  error?: string
  columns?: string[]
}

export async function extractDataFromPDF(
  fileBuffer: Buffer,
  mimeType: string,
  filename: string
): Promise<GeminiOCRResult> {
  if (!GEMINI_API_KEY) {
    return { success: false, rows: [], error: 'GEMINI_API_KEY não configurada' }
  }

  try {
    const base64Data = fileBuffer.toString('base64')

    const prompt = `Você é um especialista em extração de dados de documentos financeiros brasileiros.

Analise este documento (${filename}) e extraia TODOS os registros/linhas de dados encontrados.

Para cada registro, extraia os seguintes campos quando disponíveis:
- cpf: CPF do cliente (formato: 000.000.000-00)
- nome_cliente: Nome completo do cliente
- contrato: Número do contrato ou operação
- produto: Tipo de produto/serviço financeiro
- status_operacao: Status da operação (ativo, quitado, em atraso, etc.)
- valor_principal: Valor principal/financiado (número decimal)
- valor_parcela: Valor da parcela (número decimal)
- data_operacao: Data da operação (formato: YYYY-MM-DD)
- data_pagamento: Data de pagamento (formato: YYYY-MM-DD)

Se o documento contiver outros campos relevantes, inclua-os também.

IMPORTANTE:
- Retorne APENAS um JSON válido, sem markdown ou texto adicional
- O JSON deve ser um array de objetos, cada objeto representando uma linha/registro
- Valores monetários devem ser números (sem R$, sem pontos de milhar, use ponto como decimal)
- Datas devem estar no formato YYYY-MM-DD
- Se um campo não estiver disponível, omita-o do objeto
- Extraia TODOS os registros, não apenas uma amostra

Formato esperado:
[
  {"cpf": "123.456.789-00", "nome_cliente": "João Silva", "contrato": "12345", "valor_principal": 10000.00, ...},
  ...
]`

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data,
                },
              },
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 65536,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', errorText)
      return { success: false, rows: [], error: `Erro na API Gemini: ${response.status}` }
    }

    const result = await response.json()
    const textContent = result.candidates?.[0]?.content?.parts?.[0]?.text || ''

    // Extrair JSON do texto (pode vir com markdown code blocks)
    let jsonStr = textContent
    const jsonMatch = textContent.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim()
    } else {
      // Tentar encontrar array JSON diretamente
      const arrayMatch = textContent.match(/\[[\s\S]*\]/)
      if (arrayMatch) {
        jsonStr = arrayMatch[0]
      }
    }

    try {
      const parsed = JSON.parse(jsonStr)
      const rows = Array.isArray(parsed) ? parsed : [parsed]

      // Normalizar valores
      const normalizedRows = rows.map((row: Record<string, unknown>) => {
        const normalized: ExtractedRow = {}
        for (const [key, value] of Object.entries(row)) {
          const normalizedKey = key
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9_]/g, '_')
          normalized[normalizedKey] = value
        }

        // Garantir campos padrão
        return {
          cpf: String(normalized.cpf || normalized.cpf_cliente || '').trim() || undefined,
          nome_cliente: String(normalized.nome_cliente || normalized.nome || normalized.cliente || '').trim() || undefined,
          contrato: String(normalized.contrato || normalized.numero_contrato || normalized.numero_operacao || '').trim() || undefined,
          produto: String(normalized.produto || normalized.tipo_servico || normalized.nome_servico || '').trim() || undefined,
          status_operacao: String(normalized.status_operacao || normalized.status || normalized.situacao || '').trim() || undefined,
          valor_principal: typeof normalized.valor_principal === 'number' ? normalized.valor_principal :
            typeof normalized.valor_financiado === 'number' ? normalized.valor_financiado :
            typeof normalized.valor === 'number' ? normalized.valor : undefined,
          valor_parcela: typeof normalized.valor_parcela === 'number' ? normalized.valor_parcela :
            typeof normalized.parcela === 'number' ? normalized.parcela : undefined,
          data_operacao: String(normalized.data_operacao || normalized.dt_operacao || '').trim() || undefined,
          data_pagamento: String(normalized.data_pagamento || normalized.dt_pagamento || '').trim() || undefined,
          ...normalized,
        } as ExtractedRow
      })

      // Extrair nomes de colunas
      const allKeys = new Set<string>()
      normalizedRows.forEach(row => {
        Object.keys(row).forEach(k => {
          if (row[k] !== undefined && row[k] !== null && row[k] !== '') {
            allKeys.add(k)
          }
        })
      })

      return {
        success: true,
        rows: normalizedRows,
        raw_text: textContent,
        columns: Array.from(allKeys),
      }
    } catch (parseError) {
      console.error('Erro ao parsear JSON do Gemini:', parseError)
      return {
        success: true,
        rows: [],
        raw_text: textContent,
        error: 'Não foi possível estruturar os dados extraídos. O texto bruto foi salvo.',
      }
    }
  } catch (error) {
    console.error('Erro no OCR Gemini:', error)
    return {
      success: false,
      rows: [],
      error: error instanceof Error ? error.message : 'Erro desconhecido no processamento',
    }
  }
}
