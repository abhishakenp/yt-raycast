import { openUIComponentOpenPatternSource } from '@ship-fast/blocks'

/**
 * Heuristic: enough OpenUI source has arrived that the shell can show a first
 * meaningful layout (avoids flashing partial/invalid token soup).
 */
const COMPONENT_OPEN = new RegExp(`\\b(${openUIComponentOpenPatternSource})\\s*\\(`)

export function openUIPreviewReadyToDisplay(raw: string): boolean {
  const t = raw.trim()
  if (t.length < 22) return false
  if (!/\broot\s*=/.test(t)) return false
  if (!COMPONENT_OPEN.test(t)) return false
  return true
}
