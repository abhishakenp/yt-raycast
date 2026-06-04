/**
 * Heuristic: enough OpenUI source has arrived that the shell can show a first
 * meaningful layout (avoids flashing partial/invalid token soup).
 */
const COMPONENT_OPEN = /\b[A-Z][A-Za-z0-9_]*\s*\(/

export function openUIPreviewReadyToDisplay(raw: string): boolean {
  const t = raw.trim()
  if (t.length < 22) return false
  if (!/\broot\s*=/.test(t)) return false
  if (!COMPONENT_OPEN.test(t)) return false
  return true
}
