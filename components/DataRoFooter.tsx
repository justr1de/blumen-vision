import Image from 'next/image'

export default function DataRoFooter() {
  return (
    <footer
      className="w-full flex items-center justify-center gap-2 py-2 px-4"
      style={{
        borderTop: '1px solid var(--border-primary)',
        background: 'var(--bg-secondary)',
        opacity: 0.7,
      }}
    >
      <a
        href="https://www.dataro-it.com.br"
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0"
        aria-label="DATA-RO Inteligência Territorial"
      >
        <Image
          src="/logo-data-ro.png"
          alt="DATA-RO"
          width={22}
          height={22}
          className="w-auto"
          style={{ height: '22px' }}
        />
      </a>
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.65rem',
          color: 'var(--text-muted)',
          letterSpacing: '0.02em',
          whiteSpace: 'nowrap',
        }}
      >
        Desenvolvido por{' '}
        <a
          href="https://www.dataro-it.com.br"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--text-tertiary)', fontWeight: 600, textDecoration: 'none' }}
        >
          DATA-RO Inteligência Territorial
        </a>
        . 2026.
      </span>
    </footer>
  )
}
