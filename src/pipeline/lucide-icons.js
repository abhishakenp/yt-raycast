const LUCIDE_CDN_URL = 'https://unpkg.com/lucide@latest'
const LUCIDE_BOOTSTRAP_ID = 'sf-lucide-bootstrap'
const LUCIDE_CDN_RE = /https:\/\/unpkg\.com\/lucide@latest/i
const LUCIDE_PLACEHOLDER_RE =
  /<(i|span)\b[^>]*(data-lucide=|class=(["'])[^"'<>]*\blucide-[a-z0-9-]+\b[^"'<>]*\3)/i

const LUCIDE_BOOTSTRAP = `
<script id="${LUCIDE_BOOTSTRAP_ID}">
(() => {
  const attr = 'data-lucide'
  const selector =
    'i[data-lucide], i[class*="lucide-"], span[data-lucide], span[class*="lucide-"]'
  const unresolvedSelector = 'i[data-lucide], span[data-lucide]'
  const aliases = { flower: 'flower-2' }
  const fallback = 'circle'
  let raf = 0

  function normalize(root = document) {
    const nodes = root.querySelectorAll ? root.querySelectorAll(selector) : []
    nodes.forEach((node) => {
      if (!node.getAttribute(attr)) {
        const match = String(node.className || '').match(/\\blucide-([a-z0-9-]+)\\b/)
        if (match?.[1]) {
          node.setAttribute(attr, match[1])
          node.className = String(node.className || '')
            .replace(match[0], ' ')
            .replace(/\\s+/g, ' ')
            .trim()
        }
      }

      const current = String(node.getAttribute(attr) || '').trim()
      if (current && aliases[current]) node.setAttribute(attr, aliases[current])
    })
  }

  function schedule() {
    if (raf) return
    raf = window.requestAnimationFrame(render)
  }

  function render() {
    raf = 0
    normalize(document)

    const pending = document.querySelectorAll(selector)
    if (!pending.length) return

    if (!window.lucide || typeof window.lucide.createIcons !== 'function') {
      window.setTimeout(schedule, 120)
      return
    }

    window.lucide.createIcons()

    let changed = false
    document.querySelectorAll(unresolvedSelector).forEach((node) => {
      const current = String(node.getAttribute(attr) || '').trim()
      if (!current) return
      const next = aliases[current] || fallback
      if (next && next !== current) {
        node.setAttribute(attr, next)
        changed = true
      }
    })

    if (changed) window.lucide.createIcons()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', schedule, { once: true })
  } else {
    schedule()
  }

  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList' && mutation.addedNodes.length) {
        schedule()
        return
      }

      if (mutation.type === 'attributes') {
        schedule()
        return
      }
    }
  }).observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['class', attr],
  })
})()
</script>`

function injectBeforeClosingTag(html, tagName, snippet) {
  const pattern = new RegExp(`</${tagName}>`, 'i')
  if (pattern.test(html)) return html.replace(pattern, `${snippet}\n</${tagName}>`)
  return `${html}\n${snippet}`
}

export function ensureLucideIconRuntime(html, log = null) {
  if (!html || typeof html !== 'string') return html

  const needsLucide = LUCIDE_CDN_RE.test(html) || LUCIDE_PLACEHOLDER_RE.test(html)
  if (!needsLucide) return html

  let next = html
  let changed = false

  if (!LUCIDE_CDN_RE.test(next)) {
    next = injectBeforeClosingTag(next, 'head', `<script src="${LUCIDE_CDN_URL}"></script>`)
    changed = true
  }

  if (!next.includes(LUCIDE_BOOTSTRAP_ID)) {
    next = injectBeforeClosingTag(next, 'body', LUCIDE_BOOTSTRAP)
    changed = true
  }

  if (changed && typeof log === 'function') {
    log('  ✓ Lucide icon runtime injected')
  }

  return next
}
