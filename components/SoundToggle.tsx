"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react"

interface SoundAPI {
  playCrack: () => void
  playChime: () => void
}

export function useSoundEngine(enabled: boolean): SoundAPI {
  const ctxRef = useRef<AudioContext | null>(null)

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext()
    }
    return ctxRef.current
  }, [])

  const playCrack = useCallback(() => {
    if (!enabled) return
    try {
      const ctx = getCtx()
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate)
      const data = buf.getChannelData(0)
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.04))
      }
      const src = ctx.createBufferSource()
      src.buffer = buf
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.25, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15)
      const filter = ctx.createBiquadFilter()
      filter.type = "highpass"
      filter.frequency.value = 800
      src.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)
      src.start()
    } catch {}
  }, [enabled, getCtx])

  const playChime = useCallback(() => {
    if (!enabled) return
    try {
      const ctx = getCtx()
      const freqs = [523.25, 659.25, 783.99, 1046.5]
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = "sine"
        osc.frequency.value = freq
        const t = ctx.currentTime + i * 0.1
        gain.gain.setValueAtTime(0, t)
        gain.gain.linearRampToValueAtTime(0.15, t + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(t)
        osc.stop(t + 0.65)
      })
    } catch {}
  }, [enabled, getCtx])

  useEffect(() => {
    return () => {
      ctxRef.current?.close()
    }
  }, [])

  return { playCrack, playChime }
}

interface Props {
  enabled: boolean
  onToggle: (v: boolean) => void
}

export default function SoundToggle({ enabled, onToggle }: Props) {
  return (
    <motion.button
      onClick={() => onToggle(!enabled)}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      className="flex items-center justify-center w-11 h-11 rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FF9F43]/60"
      style={{
        background: "rgba(255,159,67,0.12)",
        border: "1px solid rgba(255,159,67,0.3)",
        color: enabled ? "#FF9F43" : "#6B5E4F",
      }}
      aria-label={enabled ? "Mute sounds" : "Enable sounds"}
      title={enabled ? "Sound on" : "Sound off"}
    >
      {enabled ? (
        <SpeakerHigh weight="bold" size={18} />
      ) : (
        <SpeakerSlash weight="bold" size={18} />
      )}
    </motion.button>
  )
}
