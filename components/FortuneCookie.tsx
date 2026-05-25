"use client"

import { useEffect, useRef } from "react"
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

  useEffect(() => {
    if (state !== "idle") return
    const el = wrapperRef.current
    if (!el) return

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      tiltRef.current.targetX = ((e.clientY - cy) / (window.innerHeight / 2)) * 10
      tiltRef.current.targetY = ((e.clientX - cx) / (window.innerWidth / 2)) * -10
    }
    const handleLeave = () => { tiltRef.current.targetX = 0; tiltRef.current.targetY = 0 }

    window.addEventListener("mousemove", handleMove)
    window.addEventListener("mouseleave", handleLeave)

    const tick = () => {
      const t = tiltRef.current
      t.x = lerp(t.x, t.targetX, 0.07)
      t.y = lerp(t.y, t.targetY, 0.07)
      if (el) el.style.transform = `perspective(700px) rotateX(${t.x}deg) rotateY(${t.y}deg)`
      rafRef.current = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      window.removeEventListener("mousemove", handleMove)
      window.removeEventListener("mouseleave", handleLeave)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (el) el.style.transform = ""
    }
  }, [state])

  return (
    <div
      ref={wrapperRef}
      className="relative select-none"
      style={{ width: 240, height: 200 }}
    >
      {/* ── Whole cookie (idle + cracking) ── */}
      <AnimatePresence>
        {(state === "idle" || state === "cracking") && (
          <motion.div
            key="whole"
            className="absolute inset-0 flex items-center justify-center"
            animate={
              state === "cracking"
                ? { rotate: [0, -9, 9, -7, 7, -4, 4, -2, 2, 0], scale: [1, 1.06, 1.06, 1.03, 1.03, 1, 1] }
                : {}
            }
            transition={{ duration: 0.75, ease: "easeInOut" }}
          >
            {/* Inner glow bloom on crack */}
            {state === "cracking" && (
              <motion.div
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: 120, height: 30,
                  background: "radial-gradient(ellipse, #FFE58A 0%, #FF9F43 40%, transparent 75%)",
                  top: "47%", left: "50%",
                  transform: "translate(-50%, -50%)",
                  filter: "blur(10px)",
                }}
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: [0, 1, 0.7, 1], scaleX: [0, 1.2, 0.9, 1.1] }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
            )}

            <button
              onClick={state === "idle" ? onClick : undefined}
              disabled={state !== "idle"}
              aria-label="Click to crack open your fortune cookie"
              className={`relative focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FF9F43]/60 rounded-full ${
                state === "idle" ? "cursor-pointer" : "cursor-default"
              }`}
              style={{ width: 240, height: 180, background: "transparent", border: "none" }}
            >
              <CookieWhole cracking={state === "cracking"} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Split halves (open + read) ── */}
      <AnimatePresence>
        {(state === "open" || state === "read") && (
          <>
            {/* Top half — flies up, tilts back to reveal inner face */}
            <motion.div
              key="top"
              className="absolute"
              style={{ left: "50%", top: "50%", translateX: "-50%", translateY: "-50%", transformOrigin: "center bottom", zIndex: 2 }}
              initial={{ y: 0, rotateX: 0, rotate: 0, opacity: 1 }}
              animate={{ y: -72, rotateX: -32, rotate: -10, opacity: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 20, delay: 0.04 }}
            >
              <CookieTopHalf />
            </motion.div>

            {/* Bottom half — falls down, tilts forward */}
            <motion.div
              key="bottom"
              className="absolute"
              style={{ left: "50%", top: "50%", translateX: "-50%", translateY: "-50%", transformOrigin: "center top", zIndex: 2 }}
              initial={{ y: 0, rotateX: 0, rotate: 0, opacity: 1 }}
              animate={{ y: 72, rotateX: 28, rotate: 12, opacity: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 20, delay: 0.04 }}
            >
              <CookieBottomHalf />
            </motion.div>

            {/* Inner light bloom at the break */}
            <motion.div
              key="bloom"
              className="absolute pointer-events-none"
              style={{ left: "50%", top: "50%", translateX: "-50%", translateY: "-50%", zIndex: 1 }}
              initial={{ opacity: 0, scale: 0.2 }}
              animate={{ opacity: [0, 1, 0.6, 0] }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
            >
              <div
                style={{
                  width: 160, height: 50,
                  background: "radial-gradient(ellipse, #FFF5C0 0%, #FFD060 35%, #FF9F43 65%, transparent 100%)",
                  filter: "blur(12px)",
                  borderRadius: "50%",
                }}
              />
            </motion.div>

            {/* Fortune paper slipping out */}
            <motion.div
              key="slip"
              className="absolute z-10"
              style={{ left: "50%", top: "48%", translateX: "-50%", translateY: "-50%" }}
              initial={{ y: 10, opacity: 0, scaleY: 0.4, scaleX: 0.7 }}
              animate={{ y: -4, opacity: 1, scaleY: 1, scaleX: 1 }}
              transition={{ type: "spring", stiffness: 160, damping: 18, delay: 0.28 }}
            >
              <FortuneSlipStub />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Cookie Whole ─────────────────────────────────────────────── */
function CookieWhole({ cracking }: { cracking: boolean }) {
  const id = "cw"
  return (
    <svg
      width="240" height="180" viewBox="0 0 240 180" fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: `drop-shadow(0 8px 24px rgba(0,0,0,0.55)) drop-shadow(0 0 ${cracking ? 36 : 22}px #FF9F43bb)`,
        transition: "filter 0.25s",
      }}
    >
      <defs>
        {/* Main body gradient */}
        <radialGradient id={`${id}-body`} cx="42%" cy="36%" r="62%">
          <stop offset="0%"  stopColor="#F8D060" />
          <stop offset="30%" stopColor="#E8980C" />
          <stop offset="70%" stopColor="#C06800" />
          <stop offset="100%" stopColor="#7A3800" />
        </radialGradient>
        {/* Specular highlight */}
        <radialGradient id={`${id}-shine`} cx="38%" cy="28%" r="38%">
          <stop offset="0%"  stopColor="rgba(255,255,220,0.55)" />
          <stop offset="60%" stopColor="rgba(255,220,140,0.15)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        {/* Edge rim darkening */}
        <radialGradient id={`${id}-rim`} cx="50%" cy="50%" r="50%">
          <stop offset="60%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.45)" />
        </radialGradient>
        {/* Crease shadow */}
        <linearGradient id={`${id}-crease`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="rgba(255,200,80,0.4)" />
          <stop offset="50%" stopColor="rgba(80,30,0,0.5)" />
          <stop offset="100%" stopColor="rgba(255,200,80,0.25)" />
        </linearGradient>
        {cracking && (
          <>
            <filter id={`${id}-crackglow`} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <radialGradient id={`${id}-innerlight`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFACC" stopOpacity="1" />
              <stop offset="100%" stopColor="#FFB830" stopOpacity="0" />
            </radialGradient>
          </>
        )}
      </defs>

      {/* ── Main body ── */}
      {/* Fortune cookie silhouette: pinched waist at sides, arched top & bottom */}
      <path
        d="
          M 32 90
          C 22 65, 62 14, 120 11
          C 178 14, 218 65, 208 90
          C 218 115, 178 162, 120 165
          C 62 162, 22 115, 32 90 Z
        "
        fill={`url(#${id}-body)`}
      />

      {/* Rim darkening for depth */}
      <path
        d="
          M 32 90
          C 22 65, 62 14, 120 11
          C 178 14, 218 65, 208 90
          C 218 115, 178 162, 120 165
          C 62 162, 22 115, 32 90 Z
        "
        fill={`url(#${id}-rim)`}
      />

      {/* Fold crease band — dark shadow below the fold line */}
      <path
        d="M 42 88 Q 120 72 198 88 Q 120 104 42 88 Z"
        fill="rgba(90,35,0,0.45)"
      />

      {/* Fold crease highlight (thin bright line above the shadow) */}
      <path
        d="M 44 84 Q 120 69 196 84"
        stroke="rgba(255,220,100,0.65)"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Specular shine on top-left */}
      <path
        d="
          M 32 90
          C 22 65, 62 14, 120 11
          C 178 14, 218 65, 208 90
          C 218 115, 178 162, 120 165
          C 62 162, 22 115, 32 90 Z
        "
        fill={`url(#${id}-shine)`}
      />

      {/* Second smaller specular hotspot */}
      <ellipse cx="88" cy="50" rx="28" ry="16" fill="rgba(255,255,230,0.22)" style={{ transform: "rotate(-18deg)", transformOrigin: "88px 50px" }} />

      {/* ── Crack ── */}
      {cracking && (
        <>
          {/* Light bleed through crack */}
          <path
            d="M 104 72 Q 115 88 120 84 Q 126 80 136 96"
            stroke="#FFF8A0"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            opacity="0.9"
            filter={`url(#${id}-crackglow)`}
          />
          {/* Crack line itself */}
          <path
            d="M 106 74 L 112 86 L 120 82 L 128 90 L 134 94"
            stroke="#FFE060"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            filter={`url(#${id}-crackglow)`}
          />
          {/* Inner light leaking out */}
          <ellipse
            cx="120" cy="86"
            rx="22" ry="9"
            fill={`url(#${id}-innerlight)`}
            opacity="0.8"
          />
        </>
      )}
    </svg>
  )
}

/* ── Top Half (flies upward, shows inner concave face tilted back) ── */
function CookieTopHalf() {
  const id = "ct"
  return (
    <svg
      width="220" height="110" viewBox="0 0 220 110" fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: "drop-shadow(0 -6px 18px rgba(0,0,0,0.5)) drop-shadow(0 0 14px #FF9F4366)",
        overflow: "visible",
      }}
    >
      <defs>
        <radialGradient id={`${id}-outer`} cx="42%" cy="30%" r="65%">
          <stop offset="0%"  stopColor="#F8D060" />
          <stop offset="40%" stopColor="#E0900A" />
          <stop offset="100%" stopColor="#7A3800" />
        </radialGradient>
        {/* Inner (concave) face — lighter, toasted cream */}
        <radialGradient id={`${id}-inner`} cx="50%" cy="80%" r="55%">
          <stop offset="0%"  stopColor="#FFF4CC" />
          <stop offset="50%" stopColor="#F5D888" />
          <stop offset="100%" stopColor="#C87C20" />
        </radialGradient>
        <radialGradient id={`${id}-shine`} cx="36%" cy="25%" r="40%">
          <stop offset="0%"  stopColor="rgba(255,255,220,0.5)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <radialGradient id={`${id}-rim`} cx="50%" cy="50%" r="50%">
          <stop offset="55%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.4)" />
        </radialGradient>
      </defs>

      {/* Outer face — top half of the cookie */}
      <path
        d="M 18 92 C 12 65, 50 12, 110 9 C 170 12, 208 65, 202 92 Q 160 80 110 78 Q 60 80 18 92 Z"
        fill={`url(#${id}-outer)`}
      />
      {/* Rim */}
      <path
        d="M 18 92 C 12 65, 50 12, 110 9 C 170 12, 208 65, 202 92 Q 160 80 110 78 Q 60 80 18 92 Z"
        fill={`url(#${id}-rim)`}
      />

      {/* Inner concave face — visible because half is tilted back */}
      <path
        d="M 18 92 Q 60 82 110 80 Q 160 82 202 92 Q 170 106 110 108 Q 50 106 18 92 Z"
        fill={`url(#${id}-inner)`}
      />
      {/* Inner face depth lines */}
      <path d="M 35 96 Q 110 88 185 96" stroke="rgba(160,100,20,0.3)" strokeWidth="1" fill="none" />
      <path d="M 50 100 Q 110 93 170 100" stroke="rgba(160,100,20,0.2)" strokeWidth="0.8" fill="none" />

      {/* Broken edge highlight */}
      <path
        d="M 18 92 Q 60 80 110 78 Q 160 80 202 92"
        stroke="rgba(255,230,120,0.7)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Specular shine */}
      <path
        d="M 18 92 C 12 65, 50 12, 110 9 C 170 12, 208 65, 202 92 Q 160 80 110 78 Q 60 80 18 92 Z"
        fill={`url(#${id}-shine)`}
      />
    </svg>
  )
}

/* ── Bottom Half (falls downward, shows inner concave face tilted forward) ── */
function CookieBottomHalf() {
  const id = "cb"
  return (
    <svg
      width="220" height="110" viewBox="0 0 220 110" fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.55)) drop-shadow(0 0 14px #FF9F4355)",
        overflow: "visible",
      }}
    >
      <defs>
        <radialGradient id={`${id}-outer`} cx="42%" cy="65%" r="65%">
          <stop offset="0%"  stopColor="#F0C040" />
          <stop offset="45%" stopColor="#D07808" />
          <stop offset="100%" stopColor="#6A2800" />
        </radialGradient>
        <radialGradient id={`${id}-inner`} cx="50%" cy="20%" r="55%">
          <stop offset="0%"  stopColor="#FFF4CC" />
          <stop offset="50%" stopColor="#F5D888" />
          <stop offset="100%" stopColor="#C87C20" />
        </radialGradient>
        <radialGradient id={`${id}-shine`} cx="38%" cy="70%" r="40%">
          <stop offset="0%"  stopColor="rgba(255,255,200,0.35)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <radialGradient id={`${id}-rim`} cx="50%" cy="50%" r="50%">
          <stop offset="55%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.45)" />
        </radialGradient>
      </defs>

      {/* Inner concave face — faces viewer as bottom half tilts forward */}
      <path
        d="M 18 18 Q 60 6 110 4 Q 160 6 202 18 Q 160 30 110 32 Q 60 30 18 18 Z"
        fill={`url(#${id}-inner)`}
      />
      {/* Inner face depth lines */}
      <path d="M 35 22 Q 110 14 185 22" stroke="rgba(160,100,20,0.3)" strokeWidth="1" fill="none" />
      <path d="M 50 26 Q 110 19 170 26" stroke="rgba(160,100,20,0.2)" strokeWidth="0.8" fill="none" />

      {/* Outer face */}
      <path
        d="M 18 18 Q 60 30 110 32 Q 160 30 202 18 C 208 45, 170 98, 110 101 C 50 98, 12 45, 18 18 Z"
        fill={`url(#${id}-outer)`}
      />
      <path
        d="M 18 18 Q 60 30 110 32 Q 160 30 202 18 C 208 45, 170 98, 110 101 C 50 98, 12 45, 18 18 Z"
        fill={`url(#${id}-rim)`}
      />
      <path
        d="M 18 18 Q 60 30 110 32 Q 160 30 202 18 C 208 45, 170 98, 110 101 C 50 98, 12 45, 18 18 Z"
        fill={`url(#${id}-shine)`}
      />

      {/* Broken edge highlight */}
      <path
        d="M 18 18 Q 60 30 110 32 Q 160 30 202 18"
        stroke="rgba(255,230,120,0.65)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

/* ── Fortune paper stub visible in the split ── */
function FortuneSlipStub() {
  return (
    <div
      style={{
        width: 130,
        height: 36,
        background: "linear-gradient(180deg, #FFFEF5 0%, #FFF8DC 60%, #F5E8A8 100%)",
        borderRadius: "3px 3px 2px 2px",
        boxShadow: "0 3px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.8)",
        border: "1px solid #E8D080",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Lined paper texture */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "repeating-linear-gradient(transparent, transparent 9px, rgba(180,150,60,0.2) 10px)",
        backgroundSize: "100% 10px",
      }} />
      {/* Subtle text hint lines */}
      <div style={{
        position: "absolute", top: 8, left: 10, right: 10, height: 2,
        background: "rgba(160,120,40,0.18)", borderRadius: 1,
      }} />
      <div style={{
        position: "absolute", top: 20, left: 10, right: 28, height: 2,
        background: "rgba(160,120,40,0.13)", borderRadius: 1,
      }} />
    </div>
  )
}
