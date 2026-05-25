"use client"

import { useEffect } from "react"
import confetti from "canvas-confetti"

interface Props {
  trigger: boolean
}

export default function Confetti({ trigger }: Props) {
  useEffect(() => {
    if (!trigger) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const fire = (opts: confetti.Options) =>
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.55 },
        colors: ["#FF9F43", "#FFD700", "#A78BFA", "#FFF5E4", "#FF6B9D"],
        ...opts,
      })

    fire({ angle: 60, origin: { x: 0.35, y: 0.55 } })
    fire({ angle: 120, origin: { x: 0.65, y: 0.55 } })
    setTimeout(() => fire({ angle: 90, particleCount: 40, origin: { x: 0.5, y: 0.5 } }), 200)
  }, [trigger])

  return null
}
