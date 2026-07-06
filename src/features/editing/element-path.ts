export const getElementIndex = (element: HTMLElement) => {
  const parent = element.parentElement
  if (!parent) return 1

  return (
    Array.from(parent.children)
      .filter((child) => child.tagName === element.tagName)
      .indexOf(element) + 1
  )
}

export const getElementPath = (
  root: HTMLElement,
  element: HTMLElement,
): string => {
  const parts: string[] = []
  let current: HTMLElement | null = element

  while (current && current !== root) {
    const tagName = current.tagName.toLowerCase()
    const id = current.id ? `#${current.id}` : ''
    const index = id ? '' : `:nth-of-type(${getElementIndex(current)})`
    parts.unshift(`${tagName}${id}${index}`)
    current = current.parentElement
  }

  return parts.join(' > ') || element.tagName.toLowerCase()
}

export type InspectorSelection = {
  tag: string
  elementPath: string
  textContent: string
  outerHTML: string
  boundingBox: { x: number; y: number; width: number; height: number }
  /** Exported page label (from nearest data-sf-export-page ancestor). */
  pageLabel?: string
  /** Durable style anchor for the nearest editable section ancestor. */
  sectionAnchor?: string
  /** OpenUI capsule name (from data-openui-component) — undefined for HTML sessions. */
  openuiComponent?: string
  /** OpenUI source variable name (from data-openui-var) — undefined for HTML sessions. */
  openuiVar?: string
}

const normalizeText = (value: string | null) =>
  value?.trim().replace(/\s+/g, ' ') ?? ''

export const sanitizeInlineEditorElement = (element: HTMLElement) => {
  const hadTranslationShimmer = element.classList.contains('shimmer')
  element.removeAttribute('contenteditable')
  element.removeAttribute('data-ship-fast-inline-editing')
  if (hadTranslationShimmer) {
    element.classList.remove('shimmer')
    element.classList.remove('text-muted-foreground')
  }
  if (element.hasAttribute('class') && !element.className.trim()) {
    element.removeAttribute('class')
  }

  if (!element.hasAttribute('style')) return

  const outline = element.style.outline
  if (outline.includes('hsl(var(--primary))') || outline.includes('primary')) {
    element.style.outline = ''
  }
  if (element.style.outlineOffset === '2px') {
    element.style.outlineOffset = ''
  }
  if (element.style.cursor === 'text') {
    element.style.cursor = ''
  }
  const looksLikeTranslationShimmer =
    hadTranslationShimmer ||
    (element.style.color === 'transparent' &&
      element.style.backgroundImage.toLowerCase().includes('currentcolor'))
  if (looksLikeTranslationShimmer && element.style.color === 'transparent') {
    element.style.color = ''
  }
  if (looksLikeTranslationShimmer && element.style.backgroundClip === 'text') {
    element.style.backgroundClip = ''
  }
  if (
    looksLikeTranslationShimmer &&
    element.style.webkitBackgroundClip === 'text'
  ) {
    element.style.webkitBackgroundClip = ''
  }
  const backgroundImage = element.style.backgroundImage
  if (
    looksLikeTranslationShimmer &&
    backgroundImage.toLowerCase().includes('currentcolor')
  ) {
    element.style.backgroundImage = ''
  }
  if (!element.getAttribute('style')?.trim()) {
    element.removeAttribute('style')
  }
}

const serializeElementForSelection = (element: HTMLElement): string => {
  const clone = element.cloneNode(true)
  if (!(clone instanceof HTMLElement)) return element.outerHTML

  sanitizeInlineEditorElement(clone)
  clone
    .querySelectorAll<HTMLElement>(
      '[contenteditable], [data-ship-fast-inline-editing]',
    )
    .forEach(sanitizeInlineEditorElement)
  clone
    .querySelectorAll<HTMLElement>('.shimmer')
    .forEach(sanitizeInlineEditorElement)

  return clone.outerHTML
}

/** Walk up from `element` to the nearest ancestor (inclusive) carrying
 *  `data-openui-component`. Returns the capsule name + source variable, or
 *  `undefined` if no OpenUI capsule marker is found (HTML sessions). */
const findOpenUICapsule = (
  element: HTMLElement,
): { openuiComponent: string; openuiVar?: string } | undefined => {
  let current: HTMLElement | null = element
  while (current) {
    const component = current.getAttribute('data-openui-component')
    if (component) {
      return {
        openuiComponent: component,
        openuiVar: current.getAttribute('data-openui-var') ?? undefined,
      }
    }
    current = current.parentElement
  }
  return undefined
}

const findExportedPageLabel = (element: HTMLElement): string | undefined => {
  const pageElement = element.closest('[data-sf-export-page]')
  if (!(pageElement instanceof HTMLElement)) return undefined
  return pageElement.getAttribute('data-sf-export-page') ?? undefined
}

const cssAttributeSelectorValue = (value: string): string =>
  value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')

const cssIdSelectorValue = (value: string): string =>
  globalThis.CSS?.escape
    ? globalThis.CSS.escape(value)
    : value.replace(/([^\w-])/g, '\\$1')

const getElementStyleAnchor = (element: HTMLElement): string | undefined => {
  const openuiVar = element.getAttribute('data-openui-var')
  if (openuiVar) {
    return `[data-openui-var="${cssAttributeSelectorValue(openuiVar)}"]`
  }

  const exportPage = element.getAttribute('data-sf-export-page')
  if (exportPage) {
    return `[data-sf-export-page="${cssAttributeSelectorValue(exportPage)}"]`
  }

  if (element.id) {
    return `#${cssIdSelectorValue(element.id)}`
  }

  const className = element.getAttribute('class')?.trim()
  return className || undefined
}

const findSectionAnchor = (element: HTMLElement): string | undefined => {
  let current: HTMLElement | null = element.closest(
    'section, article, aside, footer, header, main, [role="region"]',
  )
  while (current) {
    const anchor = getElementStyleAnchor(current)
    if (anchor) return anchor
    current =
      current.parentElement?.closest(
        'section, article, aside, footer, header, main, [role="region"]',
      ) ?? null
  }
  return undefined
}

/** Build a serializable description of `element` relative to `root`, suitable
 *  for feeding an AI section-patcher later. Pure function — no DOM mutation. */
export const buildInspectorSelection = (
  root: HTMLElement,
  element: HTMLElement,
): InspectorSelection => {
  const rect = element.getBoundingClientRect()
  const openui = findOpenUICapsule(element)
  return {
    tag: element.tagName.toLowerCase(),
    elementPath: getElementPath(root, element),
    textContent: normalizeText(element.textContent).slice(0, 500),
    outerHTML: serializeElementForSelection(element).slice(0, 4000),
    boundingBox: {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    },
    pageLabel: findExportedPageLabel(element),
    sectionAnchor: findSectionAnchor(element),
    openuiComponent: openui?.openuiComponent,
    openuiVar: openui?.openuiVar,
  }
}
