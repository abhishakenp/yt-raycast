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
  /** OpenUI capsule name (from data-openui-component) — undefined for HTML sessions. */
  openuiComponent?: string
  /** OpenUI source variable name (from data-openui-var) — undefined for HTML sessions. */
  openuiVar?: string
}

const normalizeText = (value: string | null) =>
  value?.trim().replace(/\s+/g, ' ') ?? ''

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
    outerHTML: element.outerHTML.slice(0, 4000),
    boundingBox: {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    },
    openuiComponent: openui?.openuiComponent,
    openuiVar: openui?.openuiVar,
  }
}
