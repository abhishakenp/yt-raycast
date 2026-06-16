import type { Doc } from '../_generated/dataModel'

type JsonObject = Record<string, unknown>

const normalizeSpaces = (value: string): string =>
  value.replace(/\s+/g, ' ').trim()

const isJsonObject = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

export const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const SCRIPT_STYLE_BLOCK_RE =
  /<(script|style|noscript|template)\b[\s\S]*?<\/\1>/gi

const createWhitespaceTolerantTextPattern = (
  value: string,
): RegExp | null => {
  const tokens = value.trim().split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return null

  return new RegExp(tokens.map(escapeRegExp).join('\\s+'))
}

export const applyPreviewTextEdit = (
  html: string,
  oldText: string | undefined,
  newText: string | undefined,
): { html: string; replaced: boolean } => {
  const from = String(oldText ?? '')
  const to = String(newText ?? '')
  if (!html.trim() || !from.trim()) return { html, replaced: false }
  const blocks: Array<{ token: string; value: string }> = []
  const protectedHtml = html.replace(SCRIPT_STYLE_BLOCK_RE, (value) => {
    const token = `__SHIP_FAST_PROTECTED_${blocks.length}__`
    blocks.push({ token, value })
    return token
  })
  const index = protectedHtml.indexOf(from)
  if (index >= 0) {
    const edited = `${protectedHtml.slice(0, index)}${to}${protectedHtml.slice(index + from.length)}`
    return {
      html: blocks.reduce(
        (current, block) => current.replace(block.token, block.value),
        edited,
      ),
      replaced: true,
    }
  }

  const tolerantPattern = createWhitespaceTolerantTextPattern(from)
  const tolerantMatch =
    tolerantPattern === null ? null : protectedHtml.match(tolerantPattern)
  if (
    tolerantMatch === null ||
    tolerantMatch.index === undefined ||
    tolerantMatch[0].length === 0
  ) {
    return { html, replaced: false }
  }

  const edited = `${protectedHtml.slice(0, tolerantMatch.index)}${to}${protectedHtml.slice(tolerantMatch.index + tolerantMatch[0].length)}`
  return {
    html: blocks.reduce(
      (current, block) => current.replace(block.token, block.value),
      edited,
    ),
    replaced: true,
  }
}

export type CmsBindingType = 'text' | 'richtext' | 'image' | 'link'

export type CmsBindingCandidate = {
  selector: string
  type: CmsBindingType
  field?: string
  content?: string
  contentType?: string
}

export const cmsSiteSpecSkipKeys = new Set([
  '_id',
  'id',
  'key',
  'kind',
  'type',
  'variant',
  'template',
  'component',
  'layout',
  'style',
  'className',
  'theme',
])

export const CMS_SITE_SPEC_MAX_DEPTH = 6
export const CMS_SITE_SPEC_MAX_CANDIDATES = 120

export const stripHtml = (value: string): string =>
  value
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export const readHtmlAttribute = (
  attributes: string,
  name: string,
): string | undefined => {
  const match = attributes.match(
    new RegExp(`\\s${name}\\s*=\\s*["']([^"']+)["']`, 'i'),
  )
  return match?.[1]?.trim() || undefined
}

export const inferCmsBindingType = (field: string | undefined): CmsBindingType => {
  const normalized =
    field?.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase() ?? ''
  if (
    /\b(image|img|photo|avatar|logo|media|poster|thumbnail)\b/.test(normalized)
  )
    return 'image'
  if (/\b(url|href|link|cta|button)\b/.test(normalized)) return 'link'
  if (
    /\b(body|content|summary|description|paragraph|story|bio|faq|answer|excerpt)\b/.test(
      normalized,
    )
  )
    return 'richtext'
  return 'text'
}

export const replaceCmsBoundAttribute = (
  html: string,
  selector: string,
  attributeName: 'src' | 'href',
  newValue: string,
): { html: string; replaced: boolean } => {
  const selectorPattern = escapeRegExp(selector)
  const attributePattern = escapeRegExp(attributeName)
  const tagPattern = new RegExp(
    `<([a-z][a-z0-9:-]*)([^>]*\\sdata-cms\\s*=\\s*["']${selectorPattern}["'][^>]*)>`,
    'i',
  )
  const match = html.match(tagPattern)
  if (match === null) return { html, replaced: false }

  const attributes = match[2]
  const attrPattern = new RegExp(
    `(\\s${attributePattern}\\s*=\\s*)(["'])([^"']*)(\\2)`,
    'i',
  )
  const safeValue = escapeHtml(newValue)
  const nextAttributes = attrPattern.test(attributes)
    ? attributes.replace(attrPattern, `$1$2${safeValue}$4`)
    : `${attributes} ${attributeName}="${safeValue}"`

  return {
    html: html.replace(match[0], `<${match[1]}${nextAttributes}>`),
    replaced: true,
  }
}

export const isCmsSiteSpecContentPath = (path: string[]): boolean => {
  const leaf = path.at(-1)
  if (leaf === undefined) return false
  if (cmsSiteSpecSkipKeys.has(leaf)) return false
  if (/^(aria|data|meta|seo|schema|openGraph|twitter)$/i.test(path[0] ?? ''))
    return false
  return !/^[_$]/.test(leaf)
}

export const siteSpecContentType = (field: string, type: CmsBindingType): string =>
  type === 'image' || type === 'link'
    ? 'text/uri-list'
    : /\b(body|content|description|summary|excerpt|bio|answer|paragraph|copy)\b/i.test(
          field,
        )
      ? 'text/markdown'
      : 'text/plain'

export const addCmsSiteSpecLeafCandidate = (
  candidates: CmsBindingCandidate[],
  path: string[],
  value: unknown,
): void => {
  if (typeof value !== 'string') return
  const content = normalizeSpaces(value)
  if (content.length === 0) return
  if (!isCmsSiteSpecContentPath(path)) return

  const field = path.join('.')
  const type = inferCmsBindingType(field)
  candidates.push({
    selector: `field:${field}`,
    field,
    type,
    content,
    contentType: siteSpecContentType(field, type),
  })
}

export const collectCmsSiteSpecCandidates = (
  value: unknown,
  path: string[],
  candidates: CmsBindingCandidate[],
  depth = 0,
): void => {
  if (
    candidates.length >= CMS_SITE_SPEC_MAX_CANDIDATES ||
    depth > CMS_SITE_SPEC_MAX_DEPTH
  ) {
    return
  }

  if (typeof value === 'string') {
    addCmsSiteSpecLeafCandidate(candidates, path, value)
    return
  }

  if (Array.isArray(value)) {
    value.slice(0, 24).forEach((item, index) => {
      collectCmsSiteSpecCandidates(
        item,
        [...path, String(index)],
        candidates,
        depth + 1,
      )
    })
    return
  }

  if (!isJsonObject(value)) return

  Object.entries(value)
    .slice(0, 80)
    .forEach(([key, nested]) => {
      collectCmsSiteSpecCandidates(
        nested,
        [...path, key],
        candidates,
        depth + 1,
      )
    })
}

export const applyCmsPreviewEdit = (
  html: string,
  binding: Pick<Doc<'cmsBindings'>, 'selector' | 'type'>,
  oldContent: string | undefined,
  newContent: string,
): { html: string; replaced: boolean } => {
  if (binding.type === 'image') {
    const result = replaceCmsBoundAttribute(
      html,
      binding.selector,
      'src',
      newContent,
    )
    if (result.replaced) return result
  }

  if (binding.type === 'link') {
    const result = replaceCmsBoundAttribute(
      html,
      binding.selector,
      'href',
      newContent,
    )
    if (result.replaced) return result
  }

  return applyPreviewTextEdit(html, oldContent, newContent)
}

export const parseCmsSelector = (
  selector: string,
): Pick<CmsBindingCandidate, 'selector' | 'type' | 'field'> | null => {
  const normalized = selector.trim()
  if (normalized.length === 0) return null

  const type = normalized.match(
    /(?:^|\s)type:(text|richtext|image|link)(?:\s|$)/,
  )?.[1] as CmsBindingType | undefined
  const field =
    normalized.match(/(?:^|\s)field:([a-zA-Z0-9_.-]+)(?:\s|$)/)?.[1] ??
    (normalized.includes('type:') ? undefined : normalized)

  return {
    selector: normalized,
    type: type ?? inferCmsBindingType(field),
    field,
  }
}

export const extractCmsBindingCandidatesFromHtml = (
  html: string,
): CmsBindingCandidate[] => {
  const candidates = new Map<string, CmsBindingCandidate>()
  const pairedTagPattern =
    /<([a-z][a-z0-9:-]*)([^>]*\sdata-cms\s*=\s*(["'])(.*?)\3[^>]*)>([\s\S]*?)<\/\1>/gi
  let pairedMatch: RegExpExecArray | null

  while ((pairedMatch = pairedTagPattern.exec(html)) !== null) {
    const parsed = parseCmsSelector(pairedMatch[4])
    if (parsed === null) continue

    const attributes = pairedMatch[2]
    const attributeContent =
      parsed.type === 'image'
        ? readHtmlAttribute(attributes, 'src')
        : parsed.type === 'link'
          ? readHtmlAttribute(attributes, 'href')
          : undefined
    const textContent = stripHtml(pairedMatch[5])
    candidates.set(parsed.selector, {
      ...parsed,
      content: attributeContent ?? textContent,
      contentType:
        parsed.type === 'image' || parsed.type === 'link'
          ? 'text/uri-list'
          : 'text/plain',
    })
  }

  const tagPattern =
    /<([a-z][a-z0-9:-]*)([^>]*\sdata-cms\s*=\s*(["'])(.*?)\3[^>]*)\/?>/gi
  let tagMatch: RegExpExecArray | null

  while ((tagMatch = tagPattern.exec(html)) !== null) {
    const parsed = parseCmsSelector(tagMatch[4])
    if (parsed === null || candidates.has(parsed.selector)) continue

    const attributes = tagMatch[2]
    const attributeContent =
      parsed.type === 'image'
        ? readHtmlAttribute(attributes, 'src')
        : parsed.type === 'link'
          ? readHtmlAttribute(attributes, 'href')
          : undefined

    candidates.set(parsed.selector, {
      ...parsed,
      content: attributeContent,
      contentType:
        parsed.type === 'image' || parsed.type === 'link'
          ? 'text/uri-list'
          : 'text/plain',
    })
  }

  return Array.from(candidates.values()).slice(0, 120)
}

export const extractCmsBindingCandidatesFromSiteSpec = (
  siteSpecJson: string | undefined,
): CmsBindingCandidate[] => {
  if (siteSpecJson === undefined) return []

  try {
    const spec = JSON.parse(siteSpecJson) as Record<string, unknown>
    const candidates: CmsBindingCandidate[] = []
    const add = (
      field: string,
      value: unknown,
      type: CmsBindingType = inferCmsBindingType(field),
    ) => {
      if (typeof value !== 'string' || value.trim().length === 0) return
      candidates.push({
        selector: `field:${field}`,
        field,
        type,
        content: value.trim(),
        contentType: 'text/plain',
      })
    }

    add('brand.name', spec.brand ?? spec.projectName ?? spec.name)
    add('site.title', spec.title ?? spec.projectName ?? spec.brand)
    add('site.tagline', spec.tagline ?? spec.description, 'richtext')

    const hero =
      typeof spec.hero === 'object' && spec.hero !== null
        ? (spec.hero as Record<string, unknown>)
        : undefined
    if (hero !== undefined) {
      add('hero.headline', hero.headline ?? hero.title)
      add('hero.subheadline', hero.subheadline ?? hero.description, 'richtext')
      add('hero.cta', hero.cta ?? hero.primaryCta ?? hero.primaryCTA, 'link')
    }

    const pages = Array.isArray(spec.pages) ? spec.pages : []
    const home = pages.find(
      (page): page is Record<string, unknown> =>
        typeof page === 'object' && page !== null,
    )
    if (home !== undefined) {
      add('home.title', home.title ?? home.name)
      add('home.description', home.description, 'richtext')
    }

    collectCmsSiteSpecCandidates(spec, [], candidates)

    return candidates.slice(0, CMS_SITE_SPEC_MAX_CANDIDATES)
  } catch {
    return []
  }
}

export const escapeOpenUiText = (value: string): string =>
  value.replaceAll('\\', '\\\\').replaceAll('"', '\\"').replaceAll('\n', '\\n')
