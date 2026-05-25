import { fetchFortunes, type FortuneRow } from "./sdk"
import { fortunes as localFortunes } from "@/data/fortunes"

interface Cache {
  rows: FortuneRow[]
  seenHashes: Set<string>
  lastRefresh: number
  ready: boolean
}

const REFRESH_INTERVAL_MS = 60_000

const cache: Cache = {
  rows: [],
  seenHashes: new Set(),
  lastRefresh: 0,
  ready: false,
}

let initPromise: Promise<void> | null = null

function localToFortuneRow(): FortuneRow[] {
  return localFortunes.map((f) => ({
    id: String(f.id),
    text: f.text,
    luckyNumbers: JSON.stringify(f.luckyNumbers),
    luckyColor: f.luckyColor,
    category: f.category,
    author: "anonymous",
    timestamp: 0,
  }))
}

function merge(txHash: string, data: FortuneRow): boolean {
  if (cache.seenHashes.has(txHash)) return false
  cache.seenHashes.add(txHash)
  cache.rows.push(data)
  return true
}

async function load() {
  try {
    const rows = await fetchFortunes(200)
    for (const { txHash, data } of rows) merge(txHash, data)
    cache.rows.sort((a, b) => b.timestamp - a.timestamp)
    cache.lastRefresh = Date.now()
    cache.ready = true
    console.log(`[fortuneCache] loaded ${cache.rows.length} on-chain fortunes`)
  } catch (err) {
    console.warn("[fortuneCache] fetch failed, using local fallback:", err)
    if (cache.rows.length === 0) {
      cache.rows = localToFortuneRow()
    }
    cache.ready = true
  }
}

export async function getCache(): Promise<Cache> {
  if (!cache.ready) {
    if (!initPromise) initPromise = load()
    await initPromise
  }
  // refresh every 60s
  if (cache.ready && Date.now() - cache.lastRefresh > REFRESH_INTERVAL_MS) {
    load().catch(() => {})
  }
  return cache
}

export async function getRandomFortune(): Promise<FortuneRow> {
  const c = await getCache()
  const pool = c.rows.length > 0 ? c.rows : localToFortuneRow()
  return pool[Math.floor(Math.random() * pool.length)]
}

export function upsertFortune(txHash: string, row: FortuneRow) {
  merge(txHash, row)
}
