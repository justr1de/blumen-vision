'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface DarkLogoProps {
  lightSrc: string
  darkSrc: string
  alt: string
  width?: number
  height?: number
  className?: string
  style?: React.CSSProperties
}

export default function DarkLogo({ lightSrc, darkSrc, alt, width = 120, height = 36, className = '', style }: DarkLogoProps) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const check = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    check()

    // Observar mudanças na classe do html
    const observer = new MutationObserver(check)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    return () => observer.disconnect()
  }, [])

  return (
    <Image
      src={isDark ? darkSrc : lightSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
    />
  )
}
