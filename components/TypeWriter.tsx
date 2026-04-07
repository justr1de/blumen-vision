'use client'

import { useState, useEffect, useRef } from 'react'


interface TypeWriterProps {
  text: string
  speed?: number
  className?: string
  style?: React.CSSProperties
  onComplete?: () => void
}

export default function TypeWriter({ text, speed = 80, className = '', style = {}, onComplete }: TypeWriterProps) {
  const [displayed, setDisplayed] = useState('')
  const [started, setStarted] = useState(false)
  const [done, setDone] = useState(false)
  const ref = useRef<HTMLDivElement>(null)


  // Intersection Observer — inicia quando o elemento entra na viewport
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [started])

  // Efeito de digitação com som
  useEffect(() => {
    if (!started || done) return

    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))

      if (i >= text.length) {
        clearInterval(interval)
        setDone(true)
        onComplete?.()
      }
    }, speed)

    return () => clearInterval(interval)
  }, [started, text, speed, done, onComplete])

  return (
    <div ref={ref} className={className} style={style}>
      {displayed}
      {started && !done && (
        <span
          className="inline-block w-[3px] h-[1em] ml-1 align-text-bottom animate-pulse"
          style={{ background: 'var(--olive)' }}
        />
      )}
    </div>
  )
}
