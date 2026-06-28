/**
 * Replace href values in OpenUI source code.
 *
 * Links appear as:
 * 1. String arguments: FoodDeliveryFooter("name", "/old", "desc", ...)
 * 2. JSON objects: {"label":"Home","href":"/old"}
 */

export function findHrefOccurrences(source: string, href: string): number {
  let count = 0
  // Match href as a quoted string value (both " and ' quotes)
  const doubleQuoted = `"${href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`
  const singleQuoted = `'${href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`

  // Count all occurrences in the source
  let idx = 0
  while ((idx = source.indexOf(doubleQuoted, idx)) !== -1) {
    count++
    idx += doubleQuoted.length
  }
  idx = 0
  while ((idx = source.indexOf(singleQuoted, idx)) !== -1) {
    count++
    idx += singleQuoted.length
  }
  return count
}

export function replaceHrefInSource(
  source: string,
  oldHref: string,
  newHref: string,
  occurrenceIndex = 0,
): { source: string; replaced: boolean } {
  const escaped = oldHref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // Match oldHref inside quotes (both " and ')
  const pattern = new RegExp(`(["'])${escaped}(["'])`, 'g')

  let match: RegExpExecArray | null
  let count = 0
  let result = source

  while ((match = pattern.exec(source)) !== null) {
    if (count === occurrenceIndex) {
      const quote = match[1]
      result =
        source.slice(0, match.index) +
        quote +
        newHref +
        quote +
        source.slice(match.index + match[0].length)
      return { source: result, replaced: true }
    }
    count++
  }

  return { source, replaced: false }
}
