'use client'

import { useState } from 'react'
import Link from 'next/link'
import Tooltip from '@/components/Tooltip'
import {
  ChevronLeft,
  Download,
  Filter,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Building2,
} from 'lucide-react'

/* ─── Dados mockados ─── */

interface ExtratoItem {
  id: string
  data: string
  descricao: string
  tipo: 'credito' | 'debito'
  valor: number
  saldo: number
}

const contas = [
  { id: 'bb', nome: 'Banco do Brasil', agencia: '1234-5', conta: '12345-6', saldo: 187350 },
  { id: 'itau', nome: 'Itaú', agencia: '0987-6', conta: '98765-4', saldo: 215000 },
  { id: 'caixa', nome: 'Caixa Econômica', agencia: '4567-8', conta: '45678-9', saldo: 85000 },
]

const mockExtrato: ExtratoItem[] = [
  { id: '1', data: '2026-04-04', descricao: 'TED Recebida — Cliente XYZ S.A.', tipo: 'credito', valor: 28000, saldo: 215350 },
  { id: '2', data: '2026-04-04', descricao: 'Pagamento Boleto — Fornecedor ABC', tipo: 'debito', valor: 12500, saldo: 187350 },
  { id: '3', data: '2026-04-03', descricao: 'Depósito em conta', tipo: 'credito', valor: 50000, saldo: 199850 },
  { id: '4', data: '2026-04-03', descricao: 'Tarifa bancária', tipo: 'debito', valor: 150, saldo: 149850 },
  { id: '5', data: '2026-04-02', descricao: 'Recebível Cartão Visa', tipo: 'credito', valor: 45000, saldo: 150000 },
  { id: '6', data: '2026-04-02', descricao: 'Pagamento Aluguel', tipo: 'debito', valor: 8500, saldo: 105000 },
  { id: '7', data: '2026-04-01', descricao: 'TED Recebida — Cliente DEF', tipo: 'credito', valor: 18500, saldo: 113500 },
  { id: '8', data: '2026-04-01', descricao: 'Pagamento Energia', tipo: 'debito', valor: 4200, saldo: 95000 },
]

/* ─── Helpers ─── */

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('pt-BR')
}

/* ─── Componente ─── */

export default function ExtratoPage() {
  const [contaSelecionada, setContaSelecionada] = useState('bb')
  const contaAtual = contas.find((c) => c.id === contaSelecionada)!

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Tooltip text="Voltar ao painel do caixa" position="right">
            <Link href="/painel/caixa" className="btn-glass btn-glass-sm">
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </Tooltip>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Extrato Bancário
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              Movimentações por conta bancária
            </p>
          </div>
        </div>
        <Tooltip text="Exportar extrato em PDF" position="bottom">
          <button className="btn-glass btn-glass-sm flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </Tooltip>
      </div>

      {/* Seletor de Contas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {contas.map((conta) => (
          <Tooltip key={conta.id} text={`Ag: ${conta.agencia} | Cc: ${conta.conta}`} position="bottom">
            <button
              onClick={() => setContaSelecionada(conta.id)}
              className={`card-glass p-4 text-left w-full transition-all duration-300 ${
                contaSelecionada === conta.id ? 'ring-2' : ''
              }`}
              style={{
                borderLeft: contaSelecionada === conta.id ? '3px solid var(--olive)' : '3px solid transparent',
                ...(contaSelecionada === conta.id ? { '--tw-ring-color': 'var(--olive)' } as any : {}),
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4" style={{ color: contaSelecionada === conta.id ? 'var(--olive)' : 'var(--text-muted)' }} />
                <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{conta.nome}</span>
              </div>
              <p className="text-lg font-extrabold" style={{ color: conta.saldo >= 0 ? 'var(--olive)' : '#dc2626', fontFamily: 'var(--font-display)' }}>
                {formatCurrency(conta.saldo)}
              </p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                Ag: {conta.agencia} | Cc: {conta.conta}
              </p>
            </button>
          </Tooltip>
        ))}
      </div>

      {/* Saldo atual da conta */}
      <div className="card-glass p-5 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--navy), var(--navy-light))' }}
          >
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Saldo Atual — {contaAtual.nome}
            </p>
            <p className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              {formatCurrency(contaAtual.saldo)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          <Calendar className="w-4 h-4" />
          Atualizado em {new Date().toLocaleDateString('pt-BR')}
        </div>
      </div>

      {/* Extrato */}
      <div className="card-glass overflow-hidden">
        <div className="p-5 border-b" style={{ borderColor: 'var(--border-primary)' }}>
          <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
            Movimentações
          </h2>
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--border-primary)' }}>
          {mockExtrato.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 transition-all duration-200 hover:bg-[var(--bg-hover)]"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: item.tipo === 'credito'
                      ? 'linear-gradient(135deg, var(--olive), var(--olive-light))'
                      : 'linear-gradient(135deg, #dc2626, #ef4444)',
                  }}
                >
                  {item.tipo === 'credito' ? (
                    <ArrowUpRight className="w-4 h-4 text-white" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-white" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {item.descricao}
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    {formatDate(item.data)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className="text-sm font-extrabold font-mono"
                  style={{
                    color: item.tipo === 'credito' ? 'var(--olive)' : '#dc2626',
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  {item.tipo === 'credito' ? '+' : '-'} {formatCurrency(item.valor)}
                </p>
                <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                  Saldo: {formatCurrency(item.saldo)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
