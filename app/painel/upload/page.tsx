'use client'

import { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, FileText, Image, CheckCircle, AlertCircle, Trash2, Send, Sparkles } from 'lucide-react'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string; rowCount?: number; source?: string } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const allowedExts = ['xlsx', 'xls', 'csv', 'pdf', 'png', 'jpg', 'jpeg', 'webp']

  function getFileExt(name: string): string {
    return name.split('.').pop()?.toLowerCase() || ''
  }

  function isAllowed(f: File): boolean {
    return allowedExts.includes(getFileExt(f.name))
  }

  function getFileIcon(name: string) {
    const ext = getFileExt(name)
    if (['pdf'].includes(ext)) return FileText
    if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) return Image
    return FileSpreadsheet
  }

  function getFileTypeLabel(name: string): string {
    const ext = getFileExt(name)
    if (['pdf'].includes(ext)) return 'Documento PDF'
    if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) return 'Imagem'
    return 'Planilha'
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f && isAllowed(f)) {
      setFile(f)
      setResult(null)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) {
      setFile(f)
      setResult(null)
    }
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (res.ok) {
        setResult({
          ok: true,
          message: data.message || `Processado com sucesso! ${data.rowCount || 0} registros importados.`,
          rowCount: data.rowCount,
          source: data.source,
        })
        setFile(null)
      } else {
        setResult({ ok: false, message: data.error || 'Erro ao processar o arquivo' })
      }
    } catch {
      setResult({ ok: false, message: 'Erro de conexão. Tente novamente.' })
    } finally {
      setUploading(false)
    }
  }

  const FileIcon = file ? getFileIcon(file.name) : Upload
  const isPdfOrImage = file ? ['pdf', 'png', 'jpg', 'jpeg', 'webp'].includes(getFileExt(file.name)) : false

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Enviar Documentos</h1>
        <p className="text-[var(--text-tertiary)] text-sm mt-1">
          Faça upload de planilhas, PDFs ou imagens. O sistema reconhece e organiza automaticamente.
        </p>
      </div>

      {result && (
        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${
          result.ok ? 'bg-[var(--olive-50)] border border-green-200 text-green-700' : 'bg-[#fee2e2] border border-red-200 text-red-700'
        }`}>
          {result.ok ? <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
          <div>
            <p className="text-sm font-medium">{result.ok ? 'Sucesso!' : 'Erro'}</p>
            <p className="text-sm mt-0.5">{result.message}</p>
            {result.source === 'gemini_ocr' && (
              <p className="text-xs mt-1 flex items-center gap-1 opacity-75">
                <Sparkles className="w-3 h-3" /> Processado via OCR inteligente (Gemini)
              </p>
            )}
          </div>
        </div>
      )}

      {/* Dropzone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="card-glass p-12 text-center cursor-pointer border-2 border-dashed hover:border-[var(--navy)] transition-all group"
        title="Clique ou arraste um arquivo para fazer upload"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv,.pdf,.png,.jpg,.jpeg,.webp"
          onChange={handleFileChange}
          className="hidden"
        />
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110"
          style={{
            background: 'linear-gradient(135deg, var(--navy), var(--navy-light))',
            boxShadow: '0 4px 16px rgba(29, 59, 95, 0.25)',
          }}
        >
          <Upload className="w-7 h-7 text-white" />
        </div>
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
          Arraste o arquivo aqui ou clique para selecionar
        </p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Planilhas (.xlsx, .xls, .csv) · PDFs · Imagens (.png, .jpg) — máx. 32MB
        </p>
      </div>

      {/* Arquivo selecionado */}
      {file && (
        <div className="mt-4 card-glass p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: isPdfOrImage
                  ? 'linear-gradient(135deg, #6366F1, #818CF8)'
                  : 'linear-gradient(135deg, var(--olive), var(--olive-light))',
                boxShadow: isPdfOrImage
                  ? '0 4px 12px rgba(99, 102, 241, 0.25)'
                  : '0 4px 12px rgba(111, 150, 62, 0.25)',
              }}
            >
              <FileIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{file.name}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {getFileTypeLabel(file.name)} · {(file.size / 1024).toFixed(1)} KB
                {isPdfOrImage && (
                  <span className="ml-2 inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3" style={{ color: 'var(--olive)' }} />
                    <span style={{ color: 'var(--olive)' }}>OCR inteligente</span>
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFile(null)}
              className="btn-glass btn-glass-danger btn-glass-sm"
              title="Remover arquivo selecionado"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="btn-glass btn-glass-navy btn-glass-sm disabled:opacity-50"
              title="Enviar documento para processamento"
            >
              {uploading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {uploading ? (isPdfOrImage ? 'Analisando...' : 'Processando...') : 'Enviar'}
            </button>
          </div>
        </div>
      )}

      {/* Formatos suportados */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="card-glass p-4 text-center">
          <FileSpreadsheet className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--olive)' }} />
          <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Planilhas</p>
          <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>.xlsx, .xls, .csv</p>
        </div>
        <div className="card-glass p-4 text-center">
          <FileText className="w-6 h-6 mx-auto mb-2" style={{ color: '#6366F1' }} />
          <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Documentos PDF</p>
          <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>.pdf (OCR inteligente)</p>
        </div>
        <div className="card-glass p-4 text-center">
          <Image className="w-6 h-6 mx-auto mb-2" style={{ color: '#F59E0B' }} />
          <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Imagens</p>
          <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>.png, .jpg (OCR inteligente)</p>
        </div>
      </div>

      {/* Instruções */}
      <div className="mt-8 card-glass p-6">
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Como funciona</h3>
        <div className="space-y-3">
          {[
            { step: '1', text: 'Selecione o documento financeiro (planilha, PDF ou imagem)' },
            { step: '2', text: 'O sistema identifica o formato e processa automaticamente. PDFs e imagens passam por OCR inteligente via Gemini.' },
            { step: '3', text: 'Os dados são extraídos, organizados e disponibilizados nos relatórios e dashboards do seu painel.' },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, var(--navy), var(--navy-light))',
                  boxShadow: '0 2px 8px rgba(29, 59, 95, 0.2)',
                }}
              >
                {item.step}
              </div>
              <p className="text-sm pt-1" style={{ color: 'var(--text-secondary)' }}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
