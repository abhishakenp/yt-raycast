export const userHits: Map<string, number[]> = new Map()
export const ipHits: Map<string, number[]> = new Map()
export const userMonthlyHits: Map<string, number[]> = new Map()
export const anonIpDailyHits: Map<string, number[]> = new Map()
export const exportHits: Map<string, number[]> = new Map()
export const ipMonthlyHits: Map<string, number[]> = new Map()
export const activeGenerations: Map<string, number> = new Map()

export function checkRateLimit(
  key: string,
  hitsMap: Map<string, number[]>,
  max: number,
  windowMs = 10 * 60 * 1000,
): boolean {
  const now = Date.now()
  const hits = (hitsMap.get(key) || []).filter((t) => now - t < windowMs)
  if (hits.length >= max) {
    hitsMap.set(key, hits)
    return false
  }
  hits.push(now)
  hitsMap.set(key, hits)
  return true
}

export function refundRateLimit(
  key: string,
  hitsMap: Map<string, number[]>,
): void {
  const hits = hitsMap.get(key)
  if (hits?.length) hits.pop()
}

export function cleanupMap(map: Map<string, number[]>, windowMs: number): void {
  const now = Date.now()
  for (const [key, hits] of map) {
    const valid = hits.filter((t) => now - t < windowMs)
    if (valid.length === 0) map.delete(key)
    else map.set(key, valid)
  }
}
