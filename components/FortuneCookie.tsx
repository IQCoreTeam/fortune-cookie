"use client"

import { useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

export type CookieState = "idle" | "cracking" | "open" | "read"

interface Props {
  state: CookieState
  onClick: () => void
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export default function FortuneCookie({ state, onClick }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const tiltRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 })
  const rafRef = useRef<number | null>(null)

  // Mouse-tilt effect on idle/cracking states
  useEffect(() => {
    if (state !== "idle") return

    const el = wrapperRef.current
    if (!el) return

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      tiltRef.current.targetX = ((e.clientY - cy) / cy) * 8
      tiltRef.current.targetY = ((e.clientX - cx) / cx) * -8
    }
    const handleLeave = () => {
      tiltRef.current.targetX = 0
      tiltRef.current.targetY = 0
    }
    window.addEventListener("mousemove", handleMove)
    window.addEventListener("mouseleave", handleLeave)

    const animate = () => {
      const t = tiltRef.current
      t.x = lerp(t.x, t.targetX, 0.08)
      t.y = lerp(t.y, t.targetY, 0.08)
      if (el) {
        el.style.transform = `perspective(600px) rotateX(${t.x}deg) rotateY(${t.y}deg)`
      }
      rafRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener("mousemove", handleMove)
      window.removeEventListener("mouseleave", handleLeave)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (el) el.style.transform = ""
    }
  }, [state])

  const isClickable = state === "idle"

  return (
    <div
      ref={wrapperRef}
      className="relative select-none"
      style={{ width: 200, height: 180 }}
    >
      {/* Idle: whole cookie */}
      <AnimatePresence>
        {(state === "idle" || state === "cracking") && (
          <motion.div
            key="whole-cookie"
            className="absolute inset-0 flex items-center justify-center"
            animate={
              state === "cracking"
                ? {
                    rotate: [0, -8, 8, -6, 6, -3, 3, 0],
                    scale: [1, 1.04, 1.04, 1.02, 1.02, 1, 1],
                  }
                : {}
            }
            transition={{ duration: 0.7, ease: "easeInOut" }}
          >
            <button
              onClick={isClickable ? onClick : undefined}
              disabled={!isClickable}
              aria-label="Click to crack open your fortune cookie"
              className={`relative focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FF9F43]/60 rounded-full ${
                isClickable ? "cursor-pointer" : "cursor-default"
              }`}
              style={{ width: 200, height: 160, background: "transparent", border: "none" }}
            >
              <CookieWhole cracking={state === "cracking"} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Open: two halves */}
      <AnimatePresence>
        {(state === "open" || state === "read") && (
          <>
            {/* Top half */}
            <motion.div
              key="top-half"
              className="absolute left-1/2"
              style={{ top: 0, translateX: "-50%" }}
              initial={{ y: 0, rotate: 0, opacity: 0 }}
              animate={{ y: -55, rotate: -12, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.05 }}
            >
              <CookieHalf half="top" />
            </motion.div>

            {/* Bottom half */}
            <motion.div
              key="bottom-half"
              className="absolute left-1/2"
              style={{ bottom: 0, translateX: "-50%" }}
              initial={{ y: 0, rotate: 0, opacity: 0 }}
              animate={{ y: 60, rotate: 14, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.05 }}
            >
              <CookieHalf half="bottom" />
            </motion.div>

            {/* Paper slip */}
            <motion.div
              key="paper-slip"
              className="absolute left-1/2 z-10"
              style={{ top: "45%", translateX: "-50%", translateY: "-50%" }}
              initial={{ y: 20, opacity: 0, scaleY: 0.6 }}
              animate={{ y: -10, opacity: 1, scaleY: 1 }}
              transition={{ type: "spring", stiffness: 180, damping: 20, delay: 0.25 }}
            >
              <div
                className="w-32 h-8 rounded-sm"
                style={{
                  background: "#FFF8DC",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                  border: "1px solid #E8D5A0",
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Glow ring */}
      {state === "cracking" && (
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            animation: "cookieGlow 0.4s ease-in-out infinite alternate",
          }}
          aria-hidden="true"
        />
      )}
    </div>
  )
}

function CookieWhole({ cracking }: { cracking: boolean }) {
  return (
    <svg
      width="200"
      height="160"
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: `drop-shadow(0 0 ${cracking ? 28 : 18}px #FF9F43aa) drop-shadow(0 4px 16px rgba(0,0,0,0.4))`,
        transition: "filter 0.3s",
      }}
    >
      <defs>
        <radialGradient id="cookieGrad" cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#F5C842" />
          <stop offset="50%" stopColor="#E8A020" />
          <stop offset="100%" stopColor="#A85C00" />
        </radialGradient>
        <radialGradient id="shineGrad" cx="35%" cy="30%" r="40%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        {cracking && (
          <filter id="crackGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        )}
      </defs>

      {/* Cookie body — fortune cookie folded shape */}
      <path
        d="M100 20
           C 60 20, 20 50, 15 85
           C 10 115, 30 145, 60 148
           C 75 150, 88 142, 100 128
           C 112 142, 125 150, 140 148
           C 170 145, 190 115, 185 85
           C 180 50, 140 20, 100 20 Z"
        fill="url(#cookieGrad)"
      />

      {/* Fold crease */}
      <path
        d="M 55 95 Q 100 65 145 95"
        stroke="#A85C00"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />

      {/* Shine */}
      <path
        d="M100 20
           C 60 20, 20 50, 15 85
           C 10 115, 30 145, 60 148
           C 75 150, 88 142, 100 128
           C 112 142, 125 150, 140 148
           C 170 145, 190 115, 185 85
           C 180 50, 140 20, 100 20 Z"
        fill="url(#shineGrad)"
      />

      {/* Crack line appears when cracking */}
      {cracking && (
        <path
          d="M 88 68 L 95 88 L 100 80 L 108 100 L 112 90"
          stroke="#FFF8DC"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          filter="url(#crackGlow)"
          opacity="0.9"
        />
      )}
    </svg>
  )
}

function CookieHalf({ half }: { half: "top" | "bottom" }) {
  const isTop = half === "top"
  return (
    <svg
      width="120"
      height="90"
      viewBox="0 0 120 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: "drop-shadow(0 0 14px #FF9F4388) drop-shadow(0 4px 12px rgba(0,0,0,0.35))",
      }}
    >
      <defs>
        <radialGradient id={`halfGrad${half}`} cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#F5C842" />
          <stop offset="55%" stopColor="#E8A020" />
          <stop offset="100%" stopColor="#A85C00" />
        </radialGradient>
      </defs>
      {isTop ? (
        <path
          d="M10 80 Q 60 10 110 80 Q 80 90 60 82 Q 40 90 10 80 Z"
          fill={`url(#halfGrad${half})`}
        />
      ) : (
        <path
          d="M10 10 Q 40 0 60 8 Q 80 0 110 10 Q 60 80 10 10 Z"
          fill={`url(#halfGrad${half})`}
        />
      )}
    </svg>
  )
}
