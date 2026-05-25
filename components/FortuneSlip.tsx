"use client"

import { useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { useTypewriter } from "@/hooks/useTypewriter"
import { type Fortune } from "@/data/fortunes"

interface Props {
  fortune: Fortune
  active: boolean
  onDone?: () => void
  compact?: boolean
}

export default function FortuneSlip({ fortune, active, onDone, compact = false }: Props) {
  const { displayed, done } = useTypewriter(fortune.text, active, 40)
  const calledDone = useRef(false)

  useEffect(() => {
    if (done && !calledDone.current) {
      calledDone.current = true
      onDone?.()
    }
  }, [done, onDone])

  useEffect(() => {
    calledDone.current = false
  }, [fortune.id])

  if (compact) {
    return (
      <div
        className="relative rounded-lg px-4 py-3"
        style={{
          background: "#FFF8DC",
          border: "1px solid #E8D5A0",
          boxShadow: "2px 2px 8px rgba(0,0,0,0.18)",
          transform: "rotate(-1deg)",
          maxWidth: 320,
        }}
      >
        <p
          className="text-sm leading-snug mb-2"
          style={{ fontFamily: "var(--font-nunito)", color: "#3D2B00" }}
        >
          {fortune.text}
        </p>
        <div className="flex items-center gap-2 text-xs" style={{ color: "#7A5C20" }}>
          <span>{fortune.luckyEmoji}</span>
          <span style={{ fontFamily: "var(--font-vt323)", fontSize: "0.95rem" }}>
            {fortune.luckyNumbers.join(" · ")}
          </span>
          <span className="ml-auto">{fortune.luckyColor}</span>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: -2 }}
      animate={{ opacity: 1, y: 0, rotate: -1.5 }}
      exit={{ opacity: 0, y: -20, rotate: 2 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
      className="relative rounded-xl px-8 py-7"
      style={{
        background: "#FFF8DC",
        backgroundImage:
          "repeating-linear-gradient(transparent, transparent 27px, #E8D5A088 28px)",
        boxShadow:
          "3px 4px 20px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.6)",
        border: "1px solid #E8C87A",
        maxWidth: 360,
        width: "100%",
      }}
      id="fortune-slip"
    >
      {/* Fortune text */}
      <div
        className="min-h-[5rem] mb-5"
        style={{ fontFamily: "var(--font-nunito)", color: "#3D2B00" }}
      >
        <p className="text-lg leading-relaxed font-semibold">
          {displayed}
          {!done && (
            <span
              className="inline-block ml-0.5 w-[2px] h-5 align-middle"
              style={{
                background: "#A85C00",
                animation: "blink 1s step-end infinite",
              }}
              aria-hidden="true"
            />
          )}
        </p>
      </div>

      {/* Divider */}
      <div
        className="mb-4 border-t border-dashed"
        style={{ borderColor: "#C8A85A" }}
        aria-hidden="true"
      />

      {/* Lucky numbers */}
      <div className="flex flex-wrap gap-2 mb-4">
        {fortune.luckyNumbers.map((n) => (
          <span
            key={n}
            className="px-2.5 py-1 rounded-full text-sm"
            style={{
              fontFamily: "var(--font-vt323)",
              fontSize: "1.05rem",
              background: "#FFD700",
              color: "#3D2B00",
              boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
              letterSpacing: "0.05em",
            }}
          >
            {n}
          </span>
        ))}
      </div>

      {/* Footer: color + emoji */}
      <div
        className="flex items-center gap-2 text-sm"
        style={{ fontFamily: "var(--font-nunito)", color: "#7A5C20" }}
      >
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{
            background: colorMap[fortune.luckyColor] ?? "#A78BFA",
            boxShadow: `0 0 6px ${colorMap[fortune.luckyColor] ?? "#A78BFA"}88`,
          }}
        />
        <span>Lucky Color: <strong>{fortune.luckyColor}</strong></span>
        <span className="ml-auto text-base">{fortune.luckyEmoji}</span>
      </div>
    </motion.div>
  )
}

const colorMap: Record<string, string> = {
  Indigo: "#4338CA",
  Sage: "#87A96B",
  Amber: "#F59E0B",
  Teal: "#0D9488",
  Violet: "#7C3AED",
  Rose: "#F43F5E",
  Terracotta: "#C1440E",
  Pearl: "#F0EAD6",
  Copper: "#B87333",
  Gold: "#FFD700",
  Slate: "#64748B",
  Stone: "#78716C",
  Charcoal: "#374151",
  Silver: "#C0C0C0",
  Parchment: "#F1E9C9",
  Midnight: "#1E1B4B",
  Moss: "#4A7C59",
  Forest: "#228B22",
  Ivory: "#FFFFF0",
  Obsidian: "#1C1917",
  Crimson: "#DC143C",
  Summit: "#8BA7C7",
  Spark: "#FFA500",
  Bronze: "#CD7F32",
  Sunrise: "#FF6B35",
  Steel: "#71797E",
  Electric: "#7DF9FF",
  Citrine: "#E4D00A",
  Ocean: "#006994",
  Cosmic: "#0B0C10",
  Dusk: "#4A3728",
  Ethereal: "#D4C5F9",
  Phantom: "#2D1B69",
  Parallel: "#1A1033",
  Cyan: "#22D3EE",
}
