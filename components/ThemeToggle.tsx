'use client'

import { useTheme } from './ThemeProvider'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center cursor-pointer transition-all duration-300"
      style={{
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        border: '1px solid var(--border-secondary)',
        background: 'transparent',
        color: 'var(--text-muted)',
        opacity: 0.6,
      }}
      aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
      title={theme === 'light' ? 'Modo escuro' : 'Modo claro'}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = '1'
        e.currentTarget.style.borderColor = 'var(--text-tertiary)'
        e.currentTarget.style.color = 'var(--text-secondary)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '0.6'
        e.currentTarget.style.borderColor = 'var(--border-secondary)'
        e.currentTarget.style.color = 'var(--text-muted)'
      }}
    >
      {theme === 'light' ? (
        <Moon className="w-3.5 h-3.5" />
      ) : (
        <Sun className="w-3.5 h-3.5" />
      )}
    </button>
  )
}
