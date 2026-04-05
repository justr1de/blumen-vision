import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="text-center">
        <h1
          className="text-6xl mb-4"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 300, color: 'var(--text-primary)' }}
        >
          404
        </h1>
        <p
          className="text-lg mb-8"
          style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-body)' }}
        >
          Página não encontrada
        </p>
        <Link
          href="/"
          className="btn-glass btn-glass-navy btn-glass-lg"
          style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  )
}
