'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'

interface TooltipProps {
  text: string
  children: ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
}

export default function Tooltip({ text, children, position = 'top', delay = 300 }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function show() {
    timeoutRef.current = setTimeout(() => setVisible(true), delay)
  }

  function hide() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setVisible(false)
  }

  useEffect(() => {
    if (visible && triggerRef.current && tooltipRef.current) {
      const tr = triggerRef.current.getBoundingClientRect()
      const tt = tooltipRef.current.getBoundingClientRect()
      let top = 0, left = 0

      switch (position) {
        case 'top':
          top = tr.top - tt.height - 8
          left = tr.left + tr.width / 2 - tt.width / 2
          break
        case 'bottom':
          top = tr.bottom + 8
          left = tr.left + tr.width / 2 - tt.width / 2
          break
        case 'left':
          top = tr.top + tr.height / 2 - tt.height / 2
          left = tr.left - tt.width - 8
          break
        case 'right':
          top = tr.top + tr.height / 2 - tt.height / 2
          left = tr.right + 8
          break
      }

      // Clamp to viewport
      left = Math.max(8, Math.min(left, window.innerWidth - tt.width - 8))
      top = Math.max(8, Math.min(top, window.innerHeight - tt.height - 8))

      setCoords({ top, left })
    }
  }, [visible, position])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <div
      ref={triggerRef}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      className="inline-flex"
    >
      {children}
      {visible && (
        <div
          ref={tooltipRef}
          className="tooltip-popup"
          style={{
            position: 'fixed',
            top: coords.top,
            left: coords.left,
            zIndex: 9999,
          }}
        >
          {text}
          <div className={`tooltip-arrow tooltip-arrow-${position}`} />
        </div>
      )}
    </div>
  )
}
