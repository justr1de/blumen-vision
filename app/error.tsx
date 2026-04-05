'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="text-center">
        <h1
          className="text-4xl mb-4"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 300, color: 'var(--text-primary)' }}
        >
          Algo deu errado
        </h1>
        <p
          className="text-lg mb-8"
          style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-body)' }}
        >
          Ocorreu um erro inesperado
        </p>
        <button
          onClick={reset}
          className="btn-glass btn-glass-navy btn-glass-lg"
          style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
}
