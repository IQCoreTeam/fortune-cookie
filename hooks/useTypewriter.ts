"use client"

import { useState, useEffect, useRef } from "react"

export function useTypewriter(text: string, active: boolean, charDelay = 40) {
  const [displayed, setDisplayed] = useState("")
  const [done, setDone] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!active) {
      setDisplayed("")
      setDone(false)
      return
    }

    // respect prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayed(text)
      setDone(true)
      return
    }

    setDisplayed("")
    setDone(false)
    let i = 0
    intervalRef.current = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(intervalRef.current!)
        setDone(true)
      }
    }, charDelay)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [text, active, charDelay])

  return { displayed, done }
}
