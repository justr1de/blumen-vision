'use client'

import { useState } from 'react'
import DarkLogo from '@/components/DarkLogo'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao fazer login')
        setLoading(false)
        return
      }
      // Todos os usuários vão para a página de sistemas após login
      router.push('/sistemas')
    } catch {
      setError('Erro de conexão. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative" style={{ background: 'var(--bg-primary)' }}>
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <DarkLogo lightSrc="/logo-blumen-biz.png" darkSrc="/logo-blumen-biz-white.png" alt="Blúmen Biz" width={160} height={48} className="h-10 w-auto mx-auto" />
          <p
            className="text-xs mt-3 tracking-[0.2em] uppercase"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 600 }}
          >
            Plataforma de Auditoria Financeira
          </p>
        </div>

        <div className="card p-8">
          <h2
            className="text-xl mb-1"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--text-primary)' }}
          >
            Entrar na plataforma
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-body)' }}>
            Insira suas credenciais para acessar o sistema
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm font-semibold" style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.15)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-xs mb-1.5 tracking-wide uppercase"
                style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.65rem' }}
              >
                E-mail
              </label>
              <input type="email" className="input" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label
                className="block text-xs mb-1.5 tracking-wide uppercase"
                style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.65rem' }}
              >
                Senha
              </label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="input pr-10" placeholder="Sua senha" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-70 transition-opacity">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full btn-lg disabled:opacity-50 mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--text-muted)', borderTopColor: 'var(--navy)' }} />
                  Entrando...
                </span>
              ) : (
                'Entrar'
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-8">
          <DarkLogo lightSrc="/logo-camila-arnuti.png" darkSrc="/logo-camila-arnuti-white.png" alt="Camila Arnuti" width={100} height={30} className="h-5 w-auto mx-auto opacity-30" />
        </div>
      </div>
    </div>
  )
}
