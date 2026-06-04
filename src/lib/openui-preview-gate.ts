import { openUIComponentOpenPatternSource } from '@ship-fast/blocks'

/**
 * Heuristic: enough OpenUI source has arrived that the shell can show a first
 * meaningful layout (avoids flashing partial/invalid token soup).
 */
const COMPONENT_OPEN = new RegExp(`\\b(${openUIComponentOpenPatternSource})\\s*\\(`)

export function openUIPreviewReadyToDisplay(raw: string): boolean {
  const t = raw.trim()
  if (t.length < 10) return false // Reduced threshold from 22 to 10 for faster initial display
  if (!/\broot\s*=/.test(t)) return false
  if (!COMPONENT_OPEN.test(t)) return false
  return true
}
