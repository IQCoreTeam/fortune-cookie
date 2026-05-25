"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { type Fortune, fortunes as localFortunes } from "@/data/fortunes"
import { getRandomFortune } from "@/lib/fortuneCache"
import { type FortuneRow } from "@/lib/sdk"

const categoryEmoji: Record<string, string> = {
  wisdom:     "🌿",
  humor:      "😄",
  motivation: "🔥",
  mystery:    "🌌",
}

function adaptRow(row: FortuneRow): Fortune {
  const nums = (() => {
    try { return JSON.parse(row.luckyNumbers) as number[] }
    catch { return [7, 14, 21] }
  })()
  return {
    id: typeof row.id === "number" ? row.id : parseInt(row.id, 10) || Math.random() * 9999 | 0,
    text: row.text,
    luckyNumbers: nums,
    luckyColor: row.luckyColor || "Gold",
    luckyEmoji: categoryEmoji[row.category] ?? "✨",
    category: row.category,
  }
}

export function useFortune() {
  const [current, setCurrent] = useState<Fortune | null>(null)
  const seenIds = useRef<Set<string>>(new Set())
  const [cacheReady, setCacheReady] = useState(false)

  // Prime the cache in the background once on mount
  useEffect(() => {
    getRandomFortune().then(() => setCacheReady(true)).catch(() => setCacheReady(true))
  }, [])

  const pickFortune = useCallback(async (): Promise<Fortune> => {
    try {
      const row = await getRandomFortune()
      const adapted = adaptRow(row)
      setCurrent(adapted)
      return adapted
    } catch {
      // fallback to local array
      const unseen = localFortunes.filter((f) => !seenIds.current.has(String(f.id)))
      const pool = unseen.length > 0 ? unseen : localFortunes
      const pick = pool[Math.floor(Math.random() * pool.length)]
      seenIds.current.add(String(pick.id))
      if (seenIds.current.size >= localFortunes.length) seenIds.current.clear()
      setCurrent(pick)
      return pick
    }
  }, [])

  return { current, pickFortune, cacheReady }
}
