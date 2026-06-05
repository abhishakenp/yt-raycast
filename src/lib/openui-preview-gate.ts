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
  
  // Additional check: ensure arrays look more complete by counting brackets
  // This prevents rendering when arrays are mid-stream (e.g., [Item1, Item2, null)
  const openBrackets = (t.match(/\[/g) || []).length
  const closeBrackets = (t.match(/\]/g) || []).length
  const openParens = (t.match(/\(/g) || []).length
  const closeParens = (t.match(/\)/g) || []).length
  
  // Allow some imbalance during streaming, but not too much
  // This prevents rendering when we're in the middle of a large array definition
  if (openBrackets - closeBrackets > 2) return false
  if (openParens - closeParens > 3) return false
  
  return true
}
