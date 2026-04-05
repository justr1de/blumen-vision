'use client'

import { useEffect, useRef } from 'react'

export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = document.documentElement.scrollHeight
    }
    resize()

    // Recalcular quando o conteúdo muda de tamanho
    const resizeObserver = new ResizeObserver(() => {
      canvas.width = window.innerWidth
      canvas.height = document.documentElement.scrollHeight
    })
    resizeObserver.observe(document.documentElement)

    window.addEventListener('resize', resize)

    // Caracteres contábeis sutis
    const chars = [
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
      ',', '.', '%', 'R$',
    ]

    const fontSize = 14
    const columnWidth = fontSize + 8
    const columns = Math.ceil(canvas.width / columnWidth)

    // Cada coluna tem posição Y, velocidade e opacidade próprias
    const drops: { y: number; speed: number; opacity: number; char: string }[] = []

    for (let i = 0; i < columns; i++) {
      drops.push({
        y: Math.random() * -canvas.height, // começa acima da tela em posição aleatória
        speed: 0.15 + Math.random() * 0.4, // muito lento
        opacity: 0.02 + Math.random() * 0.03, // muito sutil
        char: chars[Math.floor(Math.random() * chars.length)],
      })
    }

    let animFrame: number

    const draw = () => {
      const isDark = document.documentElement.classList.contains('dark')
      const pageHeight = document.documentElement.scrollHeight

      // Atualizar canvas height se necessário
      if (canvas.height !== pageHeight) {
        canvas.height = pageHeight
      }

      // Limpar canvas completamente
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      ctx.font = `300 ${fontSize}px "Courier New", monospace`
      ctx.textAlign = 'center'

      for (let i = 0; i < drops.length; i++) {
        const drop = drops[i]
        const x = i * columnWidth + columnWidth / 2

        // Cor baseada no fundo — degradê sutil como marca d'água
        if (isDark) {
          // No escuro: números em tom navy claro, quase invisíveis
          ctx.fillStyle = `rgba(110, 140, 168, ${drop.opacity})`
        } else {
          // No claro: números em tom navy, quase invisíveis
          ctx.fillStyle = `rgba(29, 59, 95, ${drop.opacity})`
        }

        ctx.fillText(drop.char, x, drop.y)

        // Mover para baixo lentamente
        drop.y += drop.speed

        // Trocar caractere ocasionalmente
        if (Math.random() > 0.995) {
          drop.char = chars[Math.floor(Math.random() * chars.length)]
        }

        // Quando sai da página, reinicia no topo com nova configuração
        if (drop.y > pageHeight + 50) {
          drop.y = Math.random() * -200
          drop.speed = 0.15 + Math.random() * 0.4
          drop.opacity = 0.02 + Math.random() * 0.03
          drop.char = chars[Math.floor(Math.random() * chars.length)]
        }
      }

      animFrame = requestAnimationFrame(draw)
    }

    animFrame = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animFrame)
      window.removeEventListener('resize', resize)
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity: 1 }}
    />
  )
}
