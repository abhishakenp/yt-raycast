/**
 * Reorder elements in OpenUI Stack([...]) and PageSwitch([...]) arrays.
 *
 * OpenUI source pattern:
 *   home_hero = FoodDeliveryHero(...)
 *   home_hero_anchor = SectionAnchor("home_hero", home_hero, "scroll-mt-28")
 *   home = Stack([home_navbar_anchor, home_hero_anchor, home_features_anchor, ...])
 *
 * To move "home_hero" up, we swap "home_hero_anchor" with the item before it
 * in the Stack array.
 */

/**
 * Find the Stack([...]) or PageSwitch([...]) line and parse its array items.
 * Returns the variable name (e.g. "home") and the array items, or null if not found.
 */
function findStackArray(
  source: string,
  varName: string,
): {
  line: string
  items: string[]
  arrayStart: number
  arrayEnd: number
} | null {
  const anchorVar = `${varName}_anchor`
  const lines = source.split('\n')

  for (const line of lines) {
    // Match patterns like: home = Stack([home_navbar_anchor, home_hero_anchor, ...])
    // or: root = PageSwitch([...], [home], ...)
    const stackMatch = line.match(/^(\w+)\s*=\s*Stack\(\[([^\]]+)\]\)/)
    if (stackMatch) {
      const items = stackMatch[2].split(',').map((s) => s.trim())
      if (items.includes(anchorVar)) {
        const arrayStart = line.indexOf('[', line.indexOf('Stack('))
        const arrayEnd = line.indexOf(']', arrayStart)
        return { line, items, arrayStart, arrayEnd }
      }
    }

    // Also check PageSwitch second array argument
    const pageSwitchMatch = line.match(/^(\w+)\s*=\s*PageSwitch\(/)
    if (pageSwitchMatch) {
      // Find the second array in the PageSwitch call
      const firstArrayEnd = line.indexOf(']')
      if (firstArrayEnd === -1) continue
      const secondArrayStart = line.indexOf('[', firstArrayEnd)
      const secondArrayEnd = line.indexOf(']', secondArrayStart)
      if (secondArrayStart === -1 || secondArrayEnd === -1) continue
      const arrayContent = line.slice(secondArrayStart + 1, secondArrayEnd)
      const items = arrayContent.split(',').map((s) => s.trim())
      if (items.includes(varName)) {
        return {
          line,
          items,
          arrayStart: secondArrayStart,
          arrayEnd: secondArrayEnd,
        }
      }
    }
  }

  return null
}

export function reorderInStack(
  source: string,
  varName: string,
  direction: 'up' | 'down',
): { source: string; reordered: boolean } {
  const stackInfo = findStackArray(source, varName)
  if (!stackInfo) return { source, reordered: false }

  const anchorVar = `${varName}_anchor`
  const items = stackInfo.items
  const targetItem = items.includes(anchorVar) ? anchorVar : varName
  const idx = items.indexOf(targetItem)

  if (idx === -1) return { source, reordered: false }

  if (direction === 'up') {
    if (idx === 0)
      return { source, reordered: false }
      // Swap with previous
    ;[items[idx - 1], items[idx]] = [items[idx], items[idx - 1]]
  } else {
    if (idx === items.length - 1)
      return { source, reordered: false }
      // Swap with next
    ;[items[idx + 1], items[idx]] = [items[idx], items[idx + 1]]
  }

  const newArrayContent = items.join(', ')
  const line = stackInfo.line
  const newLine =
    line.slice(0, stackInfo.arrayStart + 1) +
    newArrayContent +
    line.slice(stackInfo.arrayEnd)

  const lines = source.split('\n')
  const lineIdx = lines.indexOf(line)
  lines[lineIdx] = newLine

  return { source: lines.join('\n'), reordered: true }
}
