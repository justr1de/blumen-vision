'use client'

import { useState, useEffect, useRef } from 'react'
import { useKeySound } from '@/hooks/useKeySound'

interface Message {
  role: 'user' | 'system'
  text: string
}

const conversation: Message[] = [
  {
    role: 'user',
    text: 'Por que os relatórios financeiros vêm com tantos erros?',
  },
  {
    role: 'system',
    text: 'Financeiras e instituições geram relatórios com dezenas de tipos de transação. Mudanças nas regras de abatimento, pagamento e conciliação entre a financeira e o banco criam lançamentos inconsistentes.',
  },
  {
    role: 'user',
    text: 'E qual o impacto disso para o cliente?',
  },
  {
    role: 'system',
    text: 'Dívidas surgem indevidamente. Valores são lançados de forma errada. A auditoria manual consome horas e ainda assim deixa passar erros críticos.',
  },
  {
    role: 'user',
    text: 'Existe uma forma de resolver isso automaticamente?',
  },
  {
    role: 'system',
    text: 'A Blúmen Biz automatiza esse processo inteiro. O motor de conciliação cruza cada lançamento, identifica divergências e gera relatórios gerenciais em segundos.',
  },
]

export default function ChatConversation() {
  const [visibleCount, setVisibleCount] = useState(0)
  const [typingIndex, setTypingIndex] = useState(-1)
  const [typedTexts, setTypedTexts] = useState<string[]>([])
  const [started, setStarted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const playKeySound = useKeySound(0.03)

  // Intersection Observer
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true)
        }
      },
      { threshold: 0.15 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [started])

  // Controla a sequência de mensagens — 2x mais rápido
  useEffect(() => {
    if (!started) return
    if (visibleCount >= conversation.length) return

    const delay = visibleCount === 0 ? 560 : 840
    const timer = setTimeout(() => {
      setTypingIndex(visibleCount)
    }, delay)

    return () => clearTimeout(timer)
  }, [started, visibleCount])

  // Efeito de digitação — 2x mais rápido + som de tecla
  useEffect(() => {
    if (typingIndex < 0 || typingIndex >= conversation.length) return

    const msg = conversation[typingIndex]
    const fullText = msg.text
    let charIndex = 0
    const speed = msg.role === 'user' ? 38 : 28

    const interval = setInterval(() => {
      charIndex++
      setTypedTexts((prev) => {
        const copy = [...prev]
        copy[typingIndex] = fullText.slice(0, charIndex)
        return copy
      })

      // Tocar som de tecla (pular espaços para soar mais natural)
      if (fullText[charIndex - 1] !== ' ') {
        playKeySound()
      }

      if (charIndex >= fullText.length) {
        clearInterval(interval)
        setTimeout(() => {
          setVisibleCount((prev) => prev + 1)
        }, 490)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [typingIndex, playKeySound])

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [typedTexts, visibleCount])

  return (
    <div ref={containerRef} className="w-full">
      <div
        className="rounded-2xl border overflow-hidden"
        style={{
          background: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Header do chat */}
        <div
          className="flex items-center gap-3 px-5 py-3.5 border-b"
          style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-tertiary)' }}
        >
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--olive)' }} />
          <span
            className="text-[11px] tracking-widest uppercase"
            style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-body)', fontWeight: 700 }}
          >
            Assistente Bl&uacute;men Biz
          </span>
        </div>

        {/* Área de mensagens */}
        <div
          ref={scrollRef}
          className="px-5 py-6 space-y-4 overflow-y-auto"
          style={{ maxHeight: '380px', minHeight: '380px' }}
        >
          {conversation.map((msg, i) => {
            const text = typedTexts[i]
            if (text === undefined && i >= visibleCount) return null
            const isTyping = i === typingIndex && (text?.length || 0) < msg.text.length

            if (msg.role === 'user') {
              return (
                <div key={i} className="flex justify-end">
                  <div
                    className="max-w-[80%] px-4 py-3 rounded-2xl rounded-br-md text-sm leading-relaxed"
                    style={{
                      background: 'var(--navy)',
                      color: '#ffffff',
                      fontFamily: 'var(--font-body)',
                      fontWeight: 600,
                    }}
                  >
                    {text || ''}
                    {isTyping && (
                      <span
                        className="inline-block w-[2px] h-[0.9em] ml-0.5 align-text-bottom animate-pulse"
                        style={{ background: 'rgba(255,255,255,0.7)' }}
                      />
                    )}
                  </div>
                </div>
              )
            }

            return (
              <div key={i} className="flex justify-start">
                <div className="flex gap-3 max-w-[85%]">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'var(--olive)', color: '#ffffff' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <div
                    className="px-4 py-3 rounded-2xl rounded-bl-md text-sm leading-relaxed"
                    style={{
                      background: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    {text || ''}
                    {isTyping && (
                      <span
                        className="inline-block w-[2px] h-[0.9em] ml-0.5 align-text-bottom animate-pulse"
                        style={{ background: 'var(--olive)' }}
                      />
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Indicador de digitação */}
          {visibleCount < conversation.length && typingIndex < visibleCount && started && (
            <div className={`flex ${conversation[visibleCount]?.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className="px-4 py-3 rounded-2xl"
                style={{ background: conversation[visibleCount]?.role === 'user' ? 'var(--navy)' : 'var(--bg-tertiary)' }}
              >
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--text-muted)', animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--text-muted)', animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--text-muted)', animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
