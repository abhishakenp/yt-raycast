const AURORA_BASE_SCRIPT_ID = 'sf-aurora-base-config'

export const enforceAuroraHomepageBaseline = (html, log) => {
  if (!html || typeof html !== 'string') return html

  let out = html

  const baseScript = `<script id="${AURORA_BASE_SCRIPT_ID}">
(function () {
  function merge() {
    if (typeof tailwind === 'undefined') {
      setTimeout(merge, 0)
      return
    }
    tailwind.config = tailwind.config || { theme: { extend: {} } }
    tailwind.config.theme.extend = tailwind.config.theme.extend || {}
    const c = tailwind.config.theme.extend.colors || {}
    tailwind.config.theme.extend.colors = {
      ...c,
      bg: c.bg || '#0a0e1f',
      surface: c.surface || '#0f1428',
      elevated: c.elevated || '#141a2e',
      inset: c.inset || '#070a17',
      primary: c.primary || '#7c5cf5',
      'primary-hover': c['primary-hover'] || '#a594ff',
      'primary-active': c['primary-active'] || '#5d4cf5',
      head: c.head || '#ffffff',
      body: c.body || '#cbd5e1',
      muted: c.muted || '#94a3b8',
    }
  }
  merge()
})()
</script>`

  if (!out.includes(`id="${AURORA_BASE_SCRIPT_ID}"`)) {
    const cdnRe = /(<script[^>]*src\s*=\s*["'][^"']*cdn\.tailwindcss\.com[^"']*["'][^>]*>\s*<\/script>)/i
    if (cdnRe.test(out)) {
      out = out.replace(cdnRe, `$1\n${baseScript}`)
    } else if (/<\/head>/i.test(out)) {
      out = out.replace(/<\/head>/i, `${baseScript}\n</head>`)
    } else {
      out = `${baseScript}\n${out}`
    }
  }

  out = out.replace(
    /<body\b([^>]*)>/i,
    (m, attrs) => {
      if (/\bclass\s*=/.test(attrs)) {
        return m.replace(/\bclass\s*=\s*(["'])([^"']*)(\1)/i, (_m, q, cls) => {
          if (/\bbg-bg\b/.test(cls) || /\bbg-\[#0a0e1f\]/i.test(cls)) return m
          const merged = `${cls} min-h-screen bg-bg text-body`.trim()
          return `class=${q}${merged}${q}`
        })
      }
      return `<body${attrs} class="min-h-screen bg-bg text-body">`
    },
  )

  const hasHeroSection = /<section\b[^>]*\bclass\s*=\s*["'][^"']*\bhero\b/i.test(out)
  const firstSectionRe = /<section\b[^>]*>/i

  if (!hasHeroSection && firstSectionRe.test(out)) {
    out = out.replace(firstSectionRe, (open) => {
      if (/\bclass\s*=/.test(open)) {
        return open.replace(/\bclass\s*=\s*(["'])([^"']*)(\1)/i, (_m, q, cls) => {
          const next = cls.split(/\s+/).includes('hero') ? cls : `${cls} hero`
          return `class=${q}${next.trim()}${q}`
        })
      }
      return open.replace('<section', '<section class="hero"')
    })
  }

  const heroOpenRe = /<section\b[^>]*\bclass\s*=\s*["'][^"']*\bhero\b[^"']*["'][^>]*>/i
  if (heroOpenRe.test(out) && !/<div[^>]*\bhero-grid\b/i.test(out)) {
    out = out.replace(heroOpenRe, (open) => `${open}<div class="hero-grid"></div>`)
  }

  log?.('  homepage: aurora baseline enforced (tailwind config + hero scaffold)')
  return out
}
