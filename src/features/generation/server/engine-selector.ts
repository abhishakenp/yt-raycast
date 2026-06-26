import { runAll, runAllV2 } from '@ship-fast/engine'
import type { RunShipFastEngine } from './ship-fast-engine-adapter'

const engineFlag = process.env.SHIP_FAST_ENGINE?.trim().toLowerCase()

export const getSelectedEngine = (
  version: 'v1' | 'v2' = 'v1',
): RunShipFastEngine => {
  // If version is explicitly provided, use it. Otherwise fall back to env var.
  if (version === 'v2') return runAllV2
  if (engineFlag === 'v2') return runAllV2
  return runAll
}

export const selectedEngine: RunShipFastEngine = getSelectedEngine()
export const engineVersion = engineFlag === 'v2' ? 'v2' : 'v1'
