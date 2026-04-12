export const ECOMMERCE_INSPIRATION_MODE = 'text'

export const isEcommerceVisionReferencePipelineEnabled = () =>
  String(process.env.SHIP_FAST_ECOMMERCE_VISION_REFERENCES || '').trim() === '1'

export const resolveEcommerceVisionReferenceImageUrls = async () => []

export const ECOMMERCE_CURATED_STYLE_ANCHORS =
  'Curated abstract anchors (invent original execution; never clone a specific portfolio shot): ' +
  'editorial mega-hero with split grid or offset columns; ' +
  'floating product cards with soft glass or paper shadows; ' +
  'horizontal discovery rails (new arrivals, trending, complete the look); ' +
  'sale or urgency ribbon on key tiles without cluttering the whole grid; ' +
  'testimonial or press strip as a single bold typographic band; ' +
  'newsletter band with contrasting background and single strong field + CTA.'

export const DESIGN_REFERENCE_LEGAL_BLOCK =
  'Produce original UI: do not copy third-party logos, marks, photography, or distinctive proprietary artwork. Links inform abstract structure, hierarchy, spacing, and mood only.'

const humanizePathSegment = (s) =>
  decodeURIComponent(String(s || ''))
    .replace(/[-_]+/g, ' ')
    .replace(/[^a-z0-9\s]/gi, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, 140)

export const inferPathHintFromReferenceUrl = (rawUrl) => {
  try {
    const u = new URL(String(rawUrl).trim())
    const path = u.pathname.replace(/\/+$/, '')
    const dribbble = path.match(/\/shots\/\d+-([^/?#]+)/i)
    if (dribbble?.[1]) return humanizePathSegment(dribbble[1])
    const segments = path.split('/').filter(Boolean)
    let last = segments[segments.length - 1] || ''
    if (/^\d+-/i.test(last)) last = last.replace(/^\d+-/i, '')
    last = last.replace(/\.(html?|php)$/i, '')
    if (last && !/^\d+$/.test(last)) return humanizePathSegment(last)
  } catch {
    return ''
  }
  return ''
}

export const formatDesignReferenceUrlsForPrompt = (urls = []) => {
  const list = (Array.isArray(urls) ? urls : [])
    .map((u) => String(u || '').trim())
    .filter(Boolean)
  if (!list.length) return ''
  const numbered = list
    .map((u, i) => {
      const hint = inferPathHintFromReferenceUrl(u)
      const hintLine = hint ? `\n   Path hint (from URL only): ${hint}` : ''
      return `${i + 1}. ${u}${hintLine}`
    })
    .join('\n')
  return (
    `\n\n── Primary stylistic direction (user-supplied reference links) ──\n` +
    `You cannot open these URLs. Infer intent from the user's prompt plus each path hint below (derived only from the link path, not from guessing site content). When this block conflicts with generic ecommerce exemplar language elsewhere in system instructions, follow the user's prompt and these hints for header, hero, navigation emphasis, rhythm, and palette family—while still meeting storefront section depth when the project is a shop.\n` +
    `${DESIGN_REFERENCE_LEGAL_BLOCK}\n\n` +
    `${numbered}\n`
  )
}
