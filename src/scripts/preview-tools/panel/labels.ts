const TAG_LABELS: Record<string, string> = {
  NAV: 'Menu bar',
  HEADER: 'Top bar',
  FOOTER: 'Footer',
  SECTION: 'Section',
  ARTICLE: 'Article',
  MAIN: 'Main area',
  ASIDE: 'Sidebar',
  A: 'Link',
  BUTTON: 'Button',
  H1: 'Headline',
  H2: 'Heading',
  H3: 'Subheading',
  H4: 'Small heading',
  H5: 'Small heading',
  H6: 'Small heading',
  P: 'Text',
  SPAN: 'Text',
  STRONG: 'Text',
  EM: 'Text',
  IMG: 'Image',
  UL: 'List',
  OL: 'List',
  LI: 'List item',
  FIGURE: 'Image block',
  FIGCAPTION: 'Caption',
  INPUT: 'Input',
  TEXTAREA: 'Text area',
  SELECT: 'Dropdown',
  LABEL: 'Label',
}

const SEMANTIC_TAGS = new Set<string>([
  'NAV',
  'HEADER',
  'FOOTER',
  'SECTION',
  'ARTICLE',
  'MAIN',
  'ASIDE',
  'A',
  'BUTTON',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'P',
  'IMG',
  'UL',
  'OL',
  'LI',
  'FIGURE',
  'FIGCAPTION',
  'INPUT',
  'TEXTAREA',
  'SELECT',
  'LABEL',
])

function firstElementChildDirect(el: Element): Element | null {
  for (let i = 0; i < el.children.length; i++) {
    const c = el.children[i]
    if (c.nodeType === 1) return c
  }
  return null
}

function directElementChildCount(el: Element): number {
  let n = 0
  for (let i = 0; i < el.children.length; i++) {
    if (el.children[i].nodeType === 1) n++
  }
  return n
}

function hasVisibleSurface(el: Element): boolean {
  if (typeof window === 'undefined') return false
  let cs: CSSStyleDeclaration
  try {
    cs = getComputedStyle(el)
  } catch {
    return false
  }
  const bg = cs.backgroundColor
  const hasBg =
    !!bg && bg !== 'transparent' && !/rgba?\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)/i.test(bg)
  const hasBorder =
    parseFloat(cs.borderTopWidth || '0') > 0 ||
    parseFloat(cs.borderRightWidth || '0') > 0 ||
    parseFloat(cs.borderBottomWidth || '0') > 0 ||
    parseFloat(cs.borderLeftWidth || '0') > 0
  return hasBg || hasBorder
}

export function friendlyLabel(el: Element): string {
  if (!el || el.nodeType !== 1) return 'Thing'
  const tag = el.tagName
  const mapped = TAG_LABELS[tag]
  if (mapped) return mapped
  if (tag === 'DIV') {
    if (directElementChildCount(el) === 1) {
      const child = firstElementChildDirect(el)
      if (child && SEMANTIC_TAGS.has(child.tagName)) {
        const childLabel = TAG_LABELS[child.tagName]
        if (childLabel) return childLabel
      }
    }
    return hasVisibleSurface(el) ? 'Card' : 'Group'
  }
  return tag.toLowerCase()
}
