"use client"

import { useState, useCallback, useEffect } from "react"
import { type Fortune } from "@/data/fortunes"

export interface HistoryEntry {
  fortune: Fortune
  timestamp: number
}

const STORAGE_KEY = "fortune_history"
const MAX_ENTRIES = 10

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setHistory(JSON.parse(raw))
    } catch {}
  }, [])

  const addEntry = useCallback((fortune: Fortune) => {
    setHistory((prev) => {
      const entry: HistoryEntry = { fortune, timestamp: Date.now() }
      const next = [entry, ...prev].slice(0, MAX_ENTRIES)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
  }, [])

  return { history, addEntry, clearHistory }
}
