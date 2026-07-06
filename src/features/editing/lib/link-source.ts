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

type LinkSourceUpdate = {
  oldHref: string
  newHref: string
  oldText?: string
  newText?: string
  target?: string | null
  rel?: string
  occurrenceIndex?: number
}

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const escapeStringValue = (value: string): string =>
  value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')

const quotedHrefPattern = (href: string): RegExp =>
  new RegExp(`(["'])${escapeRegExp(href)}\\1`, 'g')

const replaceNearestQuotedText = (
  source: string,
  oldText: string,
  newText: string,
  anchorIndex: number,
): { source: string; replaced: boolean } => {
  if (!oldText || oldText === newText) return { source, replaced: false }

  const pattern = new RegExp(`(["'])${escapeRegExp(oldText)}\\1`, 'g')
  let best: RegExpExecArray | null = null
  let bestDistance = Number.POSITIVE_INFINITY
  let match: RegExpExecArray | null

  while ((match = pattern.exec(source)) !== null) {
    const distance = Math.abs(match.index - anchorIndex)
    if (distance < bestDistance) {
      best = match
      bestDistance = distance
    }
  }

  if (!best) return { source, replaced: false }
  const quote = best[1]
  return {
    source:
      source.slice(0, best.index) +
      quote +
      newText +
      quote +
      source.slice(best.index + best[0].length),
    replaced: true,
  }
}

const removeStringProperty = (objectSource: string, prop: string): string =>
  objectSource
    .replace(new RegExp(`,?\\s*${prop}\\s*:\\s*(["']).*?\\1`, 'g'), '')
    .replace(/\{\s*,\s*/g, '{ ')
    .replace(/,\s*\}/g, ' }')

const upsertStringProperty = (
  objectSource: string,
  prop: string,
  value: string | null | undefined,
): string => {
  if (value === undefined) return objectSource
  if (value === null || value === '')
    return removeStringProperty(objectSource, prop)

  const escapedValue = escapeStringValue(value)
  const propPattern = new RegExp(`(${prop}\\s*:\\s*)(["']).*?\\2`)
  if (propPattern.test(objectSource)) {
    return objectSource.replace(propPattern, `$1"${escapedValue}"`)
  }

  const closeIndex = objectSource.lastIndexOf('}')
  if (closeIndex === -1) return objectSource
  const needsComma = /[^\s{]\s*$/.test(objectSource.slice(0, closeIndex))
  return `${objectSource.slice(0, closeIndex)}${needsComma ? ', ' : ''}${prop}: "${escapedValue}"${objectSource.slice(closeIndex)}`
}

const updateObjectLinkAttributes = (
  source: string,
  hrefIndex: number,
  target: string | null | undefined,
  rel: string | undefined,
): { source: string; replaced: boolean } => {
  if (target === undefined && rel === undefined) {
    return { source, replaced: false }
  }

  const start = source.lastIndexOf('{', hrefIndex)
  const end = source.indexOf('}', hrefIndex)
  if (start === -1 || end === -1 || start > hrefIndex) {
    return { source, replaced: false }
  }

  let objectSource = source.slice(start, end + 1)
  const original = objectSource
  objectSource = upsertStringProperty(objectSource, 'target', target)
  objectSource = upsertStringProperty(objectSource, 'rel', rel)
  if (objectSource === original) return { source, replaced: false }

  return {
    source: source.slice(0, start) + objectSource + source.slice(end + 1),
    replaced: true,
  }
}

const upsertHtmlAttribute = (
  tagSource: string,
  attr: string,
  value: string | null | undefined,
): string => {
  if (value === undefined) return tagSource

  const pattern = new RegExp(`\\s${attr}\\s*=\\s*(["']).*?\\1`, 'i')
  if (value === null || value === '') {
    return tagSource.replace(pattern, '')
  }

  const escapedValue = escapeStringValue(value)
  if (pattern.test(tagSource)) {
    return tagSource.replace(pattern, ` ${attr}="${escapedValue}"`)
  }

  return tagSource.replace(
    /\/?>$/,
    (ending) => ` ${attr}="${escapedValue}"${ending}`,
  )
}

const updateHtmlLinkAttributes = (
  source: string,
  hrefIndex: number,
  target: string | null | undefined,
  rel: string | undefined,
): { source: string; replaced: boolean } => {
  if (target === undefined && rel === undefined) {
    return { source, replaced: false }
  }

  const start = source.lastIndexOf('<a', hrefIndex)
  const end = source.indexOf('>', hrefIndex)
  if (start === -1 || end === -1 || start > hrefIndex) {
    return { source, replaced: false }
  }

  let tagSource = source.slice(start, end + 1)
  if (!/\bhref\s*=/.test(tagSource)) {
    return { source, replaced: false }
  }

  const original = tagSource
  tagSource = upsertHtmlAttribute(tagSource, 'target', target)
  tagSource = upsertHtmlAttribute(tagSource, 'rel', rel)
  if (tagSource === original) return { source, replaced: false }

  return {
    source: source.slice(0, start) + tagSource + source.slice(end + 1),
    replaced: true,
  }
}

export function updateLinkInSource(
  source: string,
  update: LinkSourceUpdate,
): { source: string; replaced: boolean } {
  const occurrenceIndex = update.occurrenceIndex ?? 0
  const pattern = quotedHrefPattern(update.oldHref)
  let match: RegExpExecArray | null
  let count = 0

  while ((match = pattern.exec(source)) !== null) {
    if (count !== occurrenceIndex) {
      count++
      continue
    }

    const quote = match[1]
    let nextSource =
      source.slice(0, match.index) +
      quote +
      update.newHref +
      quote +
      source.slice(match.index + match[0].length)
    const hrefIndex = match.index
    let replaced =
      update.oldHref !== update.newHref ||
      update.target !== undefined ||
      update.rel !== undefined

    const textUpdate = replaceNearestQuotedText(
      nextSource,
      update.oldText ?? '',
      update.newText ?? update.oldText ?? '',
      hrefIndex,
    )
    if (textUpdate.replaced) {
      nextSource = textUpdate.source
      replaced = true
    }

    const attrUpdate = updateObjectLinkAttributes(
      nextSource,
      hrefIndex,
      update.target,
      update.rel,
    )
    if (attrUpdate.replaced) {
      nextSource = attrUpdate.source
      replaced = true
    }

    const htmlAttrUpdate = updateHtmlLinkAttributes(
      nextSource,
      hrefIndex,
      update.target,
      update.rel,
    )
    if (htmlAttrUpdate.replaced) {
      nextSource = htmlAttrUpdate.source
      replaced = true
    }

    return { source: nextSource, replaced }
  }

  return { source, replaced: false }
}
