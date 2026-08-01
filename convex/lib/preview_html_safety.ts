/**
 * Detects HTML fragments that could execute script when a saved preview edit
 * is rendered.
 *
 * Lives in `convex/lib` on purpose: the check has to run inside the
 * `sessions.createEdit` mutation, not only in the HTTP route. A browser can
 * call the Convex mutation directly, so any validation that exists only at the
 * HTTP layer is decoration.
 *
 * This is a *detector*, not a sanitizer: a fragment that trips any rule is
 * rejected outright rather than cleaned up. Rejecting is safe here because the
 * fragments come from our own inline editor, which never produces these
 * constructs.
 */

/**
 * Elements that can execute script, load remote code, or retarget the
 * document. SMIL (`animate`/`set`) belongs here because it can rewrite an
 * `href` to `javascript:` after the document has been parsed.
 *
 * Deliberately NOT listed: `svg`, `style`, `form`, `math`, `link`, `meta`.
 * (`link rel=preload` and ordinary `meta` tags are in every rendered page;
 * their dangerous forms — `meta http-equiv=refresh` and `link rel=import` —
 * have their own rules below.) A saved edit's
 * `afterHtml` is a full SSR-rendered page, and those elements appear in
 * perfectly ordinary output (icon sprites, scoped styles, contact forms).
 * Their dangerous uses are caught by the other rules instead — `@import` and
 * `expression()` by the CSS rule, `<foreignObject>`/`<animate>` inside an svg
 * by this list, `action="javascript:"` by the URL rule, and the classic
 * math+style mutation-XSS payload by the event-handler rule (it needs an
 * `onerror=` to do anything).
 */
const DANGEROUS_ELEMENTS = [
  'animate',
  'animatetransform',
  'applet',
  'base',
  'embed',
  'foreignobject',
  'frame',
  'frameset',
  'handler',
  'iframe',
  'object',
  'portal',
  'script',
  'set',
  'template',
]

// `<` may be followed by `/`, whitespace, or nothing; the tag name may be
// terminated by whitespace, `/`, or `>`. `<svg/onload=...>` uses `/` as the
// separator, which a `\s`-only pattern misses entirely.
const DANGEROUS_ELEMENT_PATTERN = new RegExp(
  `<\\s*/?\\s*(?:${DANGEROUS_ELEMENTS.join('|')})(?=[\\s/>]|$)`,
  'i',
)

// Event handlers. The separator class must include `/` and the HTML5 space
// characters, otherwise `<svg/onload=alert(1)>` and `<img\ttitle=x onerror=y>`
// slip through.
const EVENT_HANDLER_PATTERN = /[\s/\f\v\0]on[a-z]+\s*=/i

/**
 * Attributes whose value is fetched or navigated to. `values`/`from`/`to`/`by`
 * are SMIL animation targets — `<animate attributeName="href" values="javascript:...">`
 * rewrites a link's href after the document is parsed.
 */
const URL_ATTRIBUTES = [
  'action',
  'background',
  'by',
  'codebase',
  'data',
  'dynsrc',
  'formaction',
  'from',
  'href',
  'lowsrc',
  'ping',
  'poster',
  'src',
  'srcdoc',
  'srcset',
  'to',
  'values',
  'xlink:href',
]

const DANGEROUS_URL_PATTERN = new RegExp(
  `[\\s/](?:${URL_ATTRIBUTES.join('|').replace(/:/g, '\\:')})\\s*=\\s*["']?\\s*(?:(?:javascript|vbscript|livescript|mocha)\\s*:|data\\s*:\\s*[^,;"']*(?:text/html|image/svg\\+xml))`,
  'i',
)

/** `srcdoc` is a whole nested document; never allow it regardless of value. */
const SRCDOC_PATTERN = /[\s/]srcdoc\s*=/i

/** `<meta http-equiv="refresh">` navigates the page; `<link rel="import">` executes. */
const DANGEROUS_HEAD_TAG_PATTERN =
  /<\s*meta[^>]*http-equiv\s*=\s*["']?\s*refresh|<\s*link[^>]*\srel\s*=\s*["']?\s*import\b/i

/** CSS that pulls in remote stylesheets or evaluates expressions. */
const DANGEROUS_CSS_PATTERN = /@import\b|expression\s*\(|(?:-moz-)?binding\s*:/i

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  apos: "'",
  colon: ':',
  gt: '>',
  lpar: '(',
  lt: '<',
  newline: '\n',
  nbsp: ' ',
  quot: '"',
  rpar: ')',
  sol: '/',
  tab: '\t',
}

function decodeOnce(html: string): string {
  return html
    .replace(/&#x([0-9a-f]+);?/gi, (match, hex: string) => {
      const code = Number.parseInt(hex, 16)
      return Number.isFinite(code) && code >= 0 && code <= 0x10ffff
        ? String.fromCodePoint(code)
        : match
    })
    .replace(/&#(\d+);?/g, (match, dec: string) => {
      const code = Number.parseInt(dec, 10)
      return Number.isFinite(code) && code >= 0 && code <= 0x10ffff
        ? String.fromCodePoint(code)
        : match
    })
    .replace(
      /&([a-z]+);?/gi,
      (match, name: string) => NAMED_ENTITIES[name.toLowerCase()] ?? match,
    )
}

/**
 * Produce every string a browser might end up parsing: the raw input, the
 * input with entities decoded (repeatedly, since `&amp;#106;` decodes twice),
 * and a variant with control characters and HTML comments removed — attackers
 * split keywords with NUL bytes or `<!-- -->` to break naive scanners.
 */
function normalizedVariants(html: string): string[] {
  const variants = new Set<string>([html])
  let decoded = html
  for (let pass = 0; pass < 3; pass += 1) {
    const next = decodeOnce(decoded)
    if (next === decoded) break
    decoded = next
    variants.add(decoded)
  }
  for (const variant of [...variants]) {
    variants.add(stripControlCharacters(variant))
    variants.add(variant.replace(/<!--[\s\S]*?-->/g, ''))
  }
  return [...variants]
}

const stripControlCharacters = (value: string) =>
  Array.from(value, (character) => {
    const code = character.charCodeAt(0)
    return (code >= 0 && code <= 8) ||
      code === 11 ||
      code === 12 ||
      (code >= 14 && code <= 31) ||
      code === 127
      ? ''
      : character
  }).join('')

const RULES = [
  DANGEROUS_ELEMENT_PATTERN,
  DANGEROUS_HEAD_TAG_PATTERN,
  EVENT_HANDLER_PATTERN,
  DANGEROUS_URL_PATTERN,
  SRCDOC_PATTERN,
  DANGEROUS_CSS_PATTERN,
]

export function containsExecutablePreviewFragment(html: string): boolean {
  if (typeof html !== 'string' || html.length === 0) return false
  return normalizedVariants(html).some((variant) =>
    RULES.some((rule) => rule.test(variant)),
  )
}
