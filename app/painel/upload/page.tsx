'use client'

import { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X, Trash2, Send } from 'lucide-react'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string; rowCount?: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
  ]

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f && (allowedTypes.includes(f.type) || f.name.match(/\.(xlsx|xls|csv)$/i))) {
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
        setResult({ ok: true, message: `Planilha processada com sucesso! ${data.rowCount || 0} registros importados.`, rowCount: data.rowCount })
        setFile(null)
      } else {
        setResult({ ok: false, message: data.error || 'Erro ao processar a planilha' })
      }
    } catch {
      setResult({ ok: false, message: 'Erro de conexão. Tente novamente.' })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Enviar Planilha</h1>
        <p className="text-[var(--text-tertiary)] text-sm mt-1">
          Faça upload da sua planilha financeira. Aceitamos arquivos .xlsx, .xls e .csv
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
          accept=".xlsx,.xls,.csv"
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
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Formatos aceitos: .xlsx, .xls, .csv (máx. 4.5MB)</p>
      </div>

      {/* Arquivo selecionado */}
      {file && (
        <div className="mt-4 card-glass p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, var(--olive), var(--olive-light))',
                boxShadow: '0 4px 12px rgba(111, 150, 62, 0.25)',
              }}
            >
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{file.name}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{(file.size / 1024).toFixed(1)} KB</p>
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
              title="Enviar planilha para processamento"
            >
              {uploading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {uploading ? 'Processando...' : 'Enviar'}
            </button>
          </div>
        </div>
      )}

      {/* Instruções */}
      <div className="mt-8 card-glass p-6">
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Como funciona</h3>
        <div className="space-y-3">
          {[
            { step: '1', text: 'Selecione a planilha financeira que deseja organizar' },
            { step: '2', text: 'O sistema processa e identifica automaticamente as colunas e dados' },
            { step: '3', text: 'Os dados são organizados e disponibilizados nos relatórios gerenciais' },
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
