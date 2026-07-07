const LUCIDE_CDN_URL = 'https://unpkg.com/lucide@latest'
const LUCIDE_BOOTSTRAP_ID = 'sf-lucide-bootstrap'
const LUCIDE_CDN_RE = /https:\/\/unpkg\.com\/lucide@latest/i
const LUCIDE_BOOTSTRAP_OPEN_RE = new RegExp(
  `<script\\b[^>]*id=(["'])${LUCIDE_BOOTSTRAP_ID}\\1[^>]*>`,
  'i',
)
const LUCIDE_BOOTSTRAP_BLOCK_RE = new RegExp(
  `<script\\b[^>]*id=(["'])${LUCIDE_BOOTSTRAP_ID}\\1[^>]*>[\\s\\S]*?<\\/script>`,
  'gi',
)
const LUCIDE_PLACEHOLDER_RE =
  /<(i|span)\b[^>]*(data-lucide=|class=(["'])[^"'<>]*\blucide-[a-z0-9-]+\b[^"'<>]*\3)/i

const LUCIDE_BOOTSTRAP = `
<script id="${LUCIDE_BOOTSTRAP_ID}">
(() => {
  const NS = 'http://www.w3.org/2000/svg'
  const attr = 'data-lucide'
  const selector =
    'i[data-lucide], i[class*="lucide-"], span[data-lucide], span[class*="lucide-"]'
  const unresolvedSelector = 'i[data-lucide], span[data-lucide]'
  const aliases = {
    flower: 'flower-2',
    flower2: 'flower-2',
    insta: 'instagram',
    ig: 'instagram',
    'instagram-icon': 'instagram',
  }
  const brandNameMap = {
    discord: 'discord',
    facebook: 'facebook',
    instagram: 'instagram',
    insta: 'instagram',
    ig: 'instagram',
    linkedin: 'linkedin',
    pinterest: 'pinterest',
    threads: 'threads',
    tiktok: 'tiktok',
    twitter: 'x',
    'twitter-x': 'x',
    'x-twitter': 'x',
    whatsapp: 'whatsapp',
    youtube: 'youtube',
  }
  const socialHrefMap = [
    [/\\b(?:wa\\.me|api\\.whatsapp\\.com|whatsapp\\.com)\\b/i, 'whatsapp'],
    [/\\bfacebook\\.com\\b/i, 'facebook'],
    [/\\binstagram\\.com\\b/i, 'instagram'],
    [/\\blinkedin\\.com\\b/i, 'linkedin'],
    [/\\bpinterest\\.com\\b/i, 'pinterest'],
    [/\\bthreads\\.net\\b/i, 'threads'],
    [/\\btiktok\\.com\\b/i, 'tiktok'],
    [/\\b(?:x|twitter)\\.com\\b/i, 'x'],
    [/\\byoutube\\.com\\b|\\byoutu\\.be\\b/i, 'youtube'],
  ]
  const socialIconFallbacks = {
    discord: /^(message-circle|messages-square|messages-square|gamepad-2)$/i,
    facebook: /^(facebook|users|user-round)$/i,
    instagram: /^(camera|image|aperture)$/i,
    linkedin: /^(linkedin|briefcase|network)$/i,
    pinterest: /^(pinterest|pin|map-pin)$/i,
    threads: /^(threads|at-sign|hash)$/i,
    tiktok: /^(music|disc-3|play)$/i,
    whatsapp: /^(message-circle|message-circle-more|message-square|message-square-more|phone|send)$/i,
    x: /^(twitter|bird)$/i,
    youtube: /^(youtube|play|video)$/i,
  }
  const brandIcons = {
    discord: [
      ['path', { d: 'M7.5 8.5A12.5 12.5 0 0 1 12 7.7a12.5 12.5 0 0 1 4.5.8', stroke: 'currentColor' }],
      [
        'path',
        {
          d: 'M7 17c1.55 1.1 3.26 1.65 5 1.65S15.45 18.1 17 17c.74-1.4 1.24-2.87 1.5-4.4-.43-1.73-1.12-3.36-2.05-4.85a13.2 13.2 0 0 0-2.1.7l-.26.1-.18-.17a6.36 6.36 0 0 0-3.82 0l-.18.17-.26-.1a13.2 13.2 0 0 0-2.1-.7A14.75 14.75 0 0 0 5.5 12.6c.26 1.53.76 3 1.5 4.4Z',
        },
      ],
      ['circle', { cx: '10', cy: '12.2', r: '1', fill: 'currentColor', stroke: 'none' }],
      ['circle', { cx: '14', cy: '12.2', r: '1', fill: 'currentColor', stroke: 'none' }],
    ],
    facebook: [
      [
        'path',
        {
          d: 'M14 8h2V5h-2c-2.21 0-4 1.79-4 4v2H8v3h2v5h3v-5h2.2l.8-3H13V9c0-.55.45-1 1-1Z',
          fill: 'currentColor',
          stroke: 'none',
        },
      ],
    ],
    instagram: [
      ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '5', ry: '5' }],
      ['circle', { cx: '12', cy: '12', r: '4.25' }],
      ['circle', { cx: '17.25', cy: '6.75', r: '1.1' }],
    ],
    linkedin: [
      ['rect', { x: '4', y: '4', width: '16', height: '16', rx: '2', ry: '2' }],
      ['circle', { cx: '8', cy: '9', r: '1', fill: 'currentColor', stroke: 'none' }],
      ['path', { d: 'M7 11v5', stroke: 'currentColor' }],
      ['path', { d: 'M11 16v-5h2.2a2.8 2.8 0 0 1 2.8 2.8V16', stroke: 'currentColor' }],
      ['path', { d: 'M11 13.2A2.2 2.2 0 0 1 13.2 11', stroke: 'currentColor' }],
    ],
    pinterest: [
      ['circle', { cx: '12', cy: '12', r: '8.5' }],
      [
        'path',
        {
          d: 'M10.7 18.2c.45-1.78.9-3.56 1.06-5.39.33.63 1.17 1.09 2.07 1.09 2.72 0 4.55-2.47 4.55-5.78 0-2.5-2.12-4.84-5.35-4.84-4.01 0-6.03 2.88-6.03 5.27 0 1.45.55 2.74 1.72 3.22.19.08.36 0 .41-.2.04-.14.13-.48.17-.62.06-.2.04-.28-.11-.46-.34-.4-.56-.93-.56-1.68 0-2.16 1.61-4.1 4.2-4.1 2.29 0 3.55 1.4 3.55 3.27 0 2.46-1.09 4.54-2.71 4.54-.89 0-1.55-.74-1.34-1.65.26-1.09.76-2.27.76-3.06 0-.71-.38-1.3-1.17-1.3-.93 0-1.68.96-1.68 2.24 0 .82.28 1.37.28 1.37s-.96 4.06-1.13 4.78c-.34 1.43-.05 3.18-.03 3.36',
          fill: 'currentColor',
          stroke: 'none',
        },
      ],
    ],
    threads: [
      [
        'path',
        {
          d: 'M15.4 10.1c-.24-.11-.49-.2-.76-.27-.13-1.5-1.25-2.34-3.12-2.34-2.07 0-3.39 1.08-3.39 2.75 0 1.25.7 2.07 2.12 2.46l1.52.42c.97.27 1.36.54 1.36 1.06 0 .58-.52.97-1.34.97-.97 0-1.55-.46-1.67-1.31H8.03c.14 1.93 1.55 3.02 3.78 3.02 2.09 0 3.46-1.08 3.46-2.74 0-1.2-.67-1.95-2.16-2.37l-1.49-.41c-.88-.25-1.28-.54-1.28-1.06 0-.57.5-.94 1.28-.94.87 0 1.39.38 1.52 1.11a5.63 5.63 0 0 0-2.78.9c-.91.61-1.38 1.42-1.38 2.37 0 1.61 1.2 2.73 2.95 2.73 1.28 0 2.27-.55 2.95-1.64.49-.79.74-1.77.74-2.92 0-.06 0-.12-.01-.18.75.45 1.16 1.17 1.16 2.06 0 1.66-1.42 3.02-3.63 3.02-2.63 0-4.47-1.83-4.47-4.54 0-2.93 1.98-4.93 4.83-4.93 2.48 0 4.08 1.29 4.39 3.51',
          fill: 'currentColor',
          stroke: 'none',
        },
      ],
    ],
    tiktok: [
      [
        'path',
        {
          d: 'M14.5 4c.28 1.58 1.22 2.72 2.8 3.4V10a6.1 6.1 0 0 1-2.8-.95v4.9a4.95 4.95 0 1 1-4.95-4.95c.22 0 .43.02.64.05v2.54a2.33 2.33 0 1 0 1.69 2.24V4h2.62Z',
          fill: 'currentColor',
          stroke: 'none',
        },
      ],
    ],
    whatsapp: [
      ['path', { d: 'M12 21a8.8 8.8 0 0 1-4.24-1.08L3.8 21l1.08-3.84A8.95 8.95 0 1 1 12 21Z' }],
      [
        'path',
        {
          d: 'M9.59 8.69c-.18-.4-.37-.4-.53-.41h-.45a.83.83 0 0 0-.61.28c-.21.23-.84.82-.84 2s.85 2.32.97 2.47c.12.15 1.67 2.69 4.13 3.66 2.04.81 2.45.65 2.9.61.44-.04 1.43-.58 1.64-1.14.21-.56.21-1.04.15-1.14-.06-.1-.21-.15-.44-.26-.24-.12-1.43-.71-1.65-.79-.22-.08-.38-.12-.53.12-.16.24-.62.79-.76.95-.14.15-.29.18-.53.06-.24-.12-1.03-.38-1.95-1.19-.72-.64-1.21-1.44-1.35-1.67-.15-.24-.03-.37.09-.49.11-.11.24-.29.35-.44.12-.15.15-.25.23-.41.08-.16.04-.31-.01-.43-.06-.12-.53-1.32-.71-1.75Z',
          fill: 'currentColor',
          stroke: 'none',
        },
      ],
    ],
    x: [
      [
        'path',
        {
          d: 'M4 4h3.4l5.2 7.3L17.6 4H20l-6.2 7.1L20 20h-3.4l-5.5-7.7L6.4 20H4l6-6.8L4 4Z',
          fill: 'currentColor',
          stroke: 'none',
        },
      ],
    ],
    youtube: [
      ['rect', { x: '3', y: '6', width: '18', height: '12', rx: '4', ry: '4' }],
      ['path', { d: 'm10 9 5 3-5 3Z', fill: 'currentColor', stroke: 'none' }],
    ],
  }
  const fallback = 'circle'
  let raf = 0

  function getLinkedHref(node) {
    const link = node.closest ? node.closest('a[href]') : null
    return String(link?.getAttribute('href') || '').trim()
  }

  function getNearbyHref(node) {
    const direct = getLinkedHref(node)
    if (direct) return direct

    let current = node.parentElement
    for (let depth = 0; current && depth < 3; depth += 1) {
      const link = current.querySelector ? current.querySelector('a[href]') : null
      const href = String(link?.getAttribute('href') || '').trim()
      if (href) return href
      current = current.parentElement
    }

    return ''
  }

  function getContextText(node) {
    const parts = []
    let current = node
    for (let depth = 0; current && depth < 4; depth += 1) {
      parts.push(String(current.className || ''))
      parts.push(String(current.getAttribute?.('aria-label') || ''))
      parts.push(String(current.textContent || '').slice(0, 240))
      current = current.parentElement
    }
    return parts.join(' ').toLowerCase()
  }

  function isSocialContext(node) {
    const href = getNearbyHref(node)
    if (href && socialHrefMap.some(([pattern]) => pattern.test(href))) return true

    if (node.closest?.('footer, [class*="social"], [id*="social"], [aria-label*="social"]')) {
      return true
    }

    return /\\b(follow|social|instagram|twitter|facebook|linkedin|youtube|pinterest|threads|tiktok|discord|whatsapp|chat with us|support)\\b/i.test(
      getContextText(node),
    )
  }

  function resolveIconName(node) {
    const current = String(node.getAttribute(attr) || '')
      .trim()
      .toLowerCase()
    if (!current) return ''

    return aliases[current] || current
  }

  function resolveBrandIconName(node) {
    const current = resolveIconName(node)
    if (!current) return ''

    const href = getNearbyHref(node)
    if (brandNameMap[current]) {
      const brand = brandNameMap[current]
      if (brand === 'x') return isSocialContext(node) ? 'x' : ''
      if (brand === 'whatsapp') return isSocialContext(node) ? 'whatsapp' : ''
      return brand
    }

    for (const [pattern, brand] of socialHrefMap) {
      if (pattern.test(href) && socialIconFallbacks[brand]?.test(current)) {
        return brand
      }
    }

    if (socialIconFallbacks.whatsapp.test(current) && /\\bwhatsapp\\b/i.test(getContextText(node))) {
      return 'whatsapp'
    }

    return ''
  }

  function hasLucideIcon(name) {
    const registry = window.lucide?.icons
    if (!registry || typeof registry !== 'object') return true

    const raw = String(name || '').trim()
    if (!raw) return false

    const camel = raw.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
    const pascal = raw
      .split('-')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('')

    return Boolean(registry[raw] || registry[camel] || registry[pascal])
  }

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

      const current = resolveIconName(node)
      if (current) node.setAttribute(attr, current)
    })
  }

  function createSvgNode(node, name) {
    const parts = brandIcons[name]
    if (!parts?.length) return null

    const svg = document.createElementNS(NS, 'svg')
    svg.setAttribute('xmlns', NS)
    svg.setAttribute('viewBox', '0 0 24 24')
    svg.setAttribute('fill', 'none')
    svg.setAttribute('stroke', 'currentColor')
    svg.setAttribute('stroke-width', '2')
    svg.setAttribute('stroke-linecap', 'round')
    svg.setAttribute('stroke-linejoin', 'round')
    svg.setAttribute('width', node.getAttribute('width') || '24')
    svg.setAttribute('height', node.getAttribute('height') || '24')

    Array.from(node.attributes || []).forEach(({ name: attributeName, value }) => {
      if (!attributeName || attributeName === attr) return
      if (attributeName === 'class') {
        const cleaned = String(value || '')
          .replace(/\\blucide-[a-z0-9-]+\\b/g, ' ')
          .replace(/\\s+/g, ' ')
          .trim()
        svg.setAttribute(
          'class',
          [cleaned, 'sf-brand-icon', 'sf-brand-icon-' + name].filter(Boolean).join(' '),
        )
        return
      }
      svg.setAttribute(attributeName, value)
    })

    if (!svg.getAttribute('class')) {
      svg.setAttribute('class', 'sf-brand-icon sf-brand-icon-' + name)
    }

    if (!svg.hasAttribute('aria-hidden') && !svg.hasAttribute('aria-label')) {
      svg.setAttribute('aria-hidden', 'true')
    }

    parts.forEach(([tagName, attributes]) => {
      const child = document.createElementNS(NS, tagName)
      Object.entries(attributes || {}).forEach(([attributeName, value]) => {
        child.setAttribute(attributeName, String(value))
      })
      svg.appendChild(child)
    })

    return svg
  }

  function preparePlaceholders(root = document, fallbackUnknown = false) {
    let changed = false
    const nodes = root.querySelectorAll ? root.querySelectorAll(selector) : []
    nodes.forEach((node) => {
      const current = resolveIconName(node)
      if (!current) return
      node.setAttribute(attr, current)

      const brandName = resolveBrandIconName(node)
      if (brandName && brandIcons[brandName]) {
        const svg = createSvgNode(node, brandName)
        if (svg) {
          node.replaceWith(svg)
          changed = true
        }
        return
      }

      if (fallbackUnknown && !hasLucideIcon(current)) {
        node.setAttribute(attr, fallback)
        changed = true
      }
    })
    return changed
  }

  function schedule() {
    if (raf) return
    raf = window.requestAnimationFrame(render)
  }

  function render() {
    raf = 0
    normalize(document)
    preparePlaceholders(document, true)

    const pending = document.querySelectorAll(selector)
    if (!pending.length) return

    if (!window.lucide || typeof window.lucide.createIcons !== 'function') {
      window.setTimeout(schedule, 120)
      return
    }

    try {
      window.lucide.createIcons()
    } catch {
      preparePlaceholders(document, true)
      document.querySelectorAll(unresolvedSelector).forEach((node) => {
        const current = resolveIconName(node)
        if (!current) return
        node.setAttribute(attr, fallback)
      })
      if (document.querySelectorAll(selector).length) {
        try {
          window.lucide.createIcons()
        } catch {}
      }
    }

    let changed = false
    document.querySelectorAll(unresolvedSelector).forEach((node) => {
      const current = resolveIconName(node)
      if (!current) return
      node.setAttribute(attr, current)

      const brandName = resolveBrandIconName(node)
      if (brandName && brandIcons[brandName]) {
        const svg = createSvgNode(node, brandName)
        if (svg) {
          node.replaceWith(svg)
          changed = true
        }
        return
      }

      if (current !== fallback) {
        node.setAttribute(attr, fallback)
        changed = true
      }
    })

    if (changed) {
      normalize(document)
      preparePlaceholders(document, true)
      if (document.querySelectorAll(selector).length) {
        try {
          window.lucide.createIcons()
        } catch {}
      }
    }
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

function injectBeforeClosingTag(
  html: string,
  tagName: string,
  snippet: string,
) {
  const pattern = new RegExp(`</${tagName}>`, 'i')
  if (pattern.test(html))
    return html.replace(pattern, `${snippet}\n</${tagName}>`)
  return `${html}\n${snippet}`
}

function stripExistingBootstrap(html: string) {
  const next = html.replace(LUCIDE_BOOTSTRAP_BLOCK_RE, '')
  const orphanMatch = next.match(LUCIDE_BOOTSTRAP_OPEN_RE)
  if (!orphanMatch) return next

  const orphanIndex = orphanMatch.index ?? next.indexOf(orphanMatch[0])
  const bodyCloseIdx = next.search(/<\/body>/i)
  if (bodyCloseIdx === -1) {
    const afterOpen = orphanIndex + orphanMatch[0].length
    const resume = next
      .slice(afterOpen)
      .search(/<(?:main|section|aside|footer|div|\/html)\b/i)
    if (resume >= 0)
      return `${next.slice(0, orphanIndex)}${next.slice(afterOpen + resume)}`
    return next.slice(0, orphanIndex)
  }
  return `${next.slice(0, orphanIndex)}${next.slice(bodyCloseIdx)}`
}

export function ensureLucideIconRuntime(
  html: string,
  log: ((msg: string) => void) | null = null,
) {
  if (!html || typeof html !== 'string') return html

  const needsLucide =
    LUCIDE_CDN_RE.test(html) || LUCIDE_PLACEHOLDER_RE.test(html)
  if (!needsLucide) return html

  let next = stripExistingBootstrap(html)
  let changed = next !== html

  if (!LUCIDE_CDN_RE.test(next)) {
    next = injectBeforeClosingTag(
      next,
      'head',
      `<script src="${LUCIDE_CDN_URL}"></script>`,
    )
    changed = true
  }

  if (!LUCIDE_BOOTSTRAP_OPEN_RE.test(next)) {
    next = injectBeforeClosingTag(next, 'body', LUCIDE_BOOTSTRAP)
    changed = true
  }

  if (changed && typeof log === 'function') {
    log('  ✓ Lucide icon runtime injected')
  }

  return next
}
