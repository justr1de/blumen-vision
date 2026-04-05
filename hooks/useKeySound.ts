'use client'

import { useRef, useCallback } from 'react'

/**
 * Hook que gera som de tecla mecânica via Web Audio API.
 * Leve, sem dependências externas, sem arquivos de áudio.
 */
export function useKeySound(volume = 0.06) {
  const ctxRef = useRef<AudioContext | null>(null)
  const lastPlayRef = useRef(0)

  const play = useCallback(() => {
    // Throttle: mínimo 20ms entre sons para evitar sobrecarga
    const now = performance.now()
    if (now - lastPlayRef.current < 20) return
    lastPlayRef.current = now

    try {
      if (!ctxRef.current) {
        ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      const ctx = ctxRef.current

      // Criar um "click" curto simulando tecla mecânica
      const duration = 0.035
      const t = ctx.currentTime

      // Oscilador principal — frequência alta e curta (click)
      const osc = ctx.createOscillator()
      osc.type = 'square'
      osc.frequency.setValueAtTime(1800 + Math.random() * 600, t)
      osc.frequency.exponentialRampToValueAtTime(400, t + duration)

      // Gain envelope — ataque rápido, decay rápido
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(volume, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration)

      // Noise burst para textura mecânica
      const bufferSize = ctx.sampleRate * duration
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = noiseBuffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.3
      }
      const noise = ctx.createBufferSource()
      noise.buffer = noiseBuffer
      const noiseGain = ctx.createGain()
      noiseGain.gain.setValueAtTime(volume * 0.5, t)
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + duration * 0.8)

      // Conectar
      osc.connect(gain)
      gain.connect(ctx.destination)
      noise.connect(noiseGain)
      noiseGain.connect(ctx.destination)

      // Tocar
      osc.start(t)
      osc.stop(t + duration)
      noise.start(t)
      noise.stop(t + duration)
    } catch {
      // Silenciosamente ignora se AudioContext não estiver disponível
    }
  }, [volume])

  return play
}
