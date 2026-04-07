import Image from 'next/image'

export default function DataRoFooter() {
  return (
    <footer
      className="w-full flex items-center justify-center gap-2 py-2 px-4"
      style={{
        opacity: 0.3,
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
          width={20}
          height={20}
          className="w-auto"
          style={{ height: '20px', borderRadius: '4px' }}
        />
      </a>
      <span
        style={{
          fontSize: '0.6rem',
          color: '#888',
          letterSpacing: '0.02em',
          whiteSpace: 'nowrap',
        }}
      >
        Desenvolvido por{' '}
        <a
          href="https://www.dataro-it.com.br"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#999', fontWeight: 600, textDecoration: 'none' }}
        >
          DATA-RO Inteligência Territorial
        </a>
        . 2026
      </span>
    </footer>
  )
}
