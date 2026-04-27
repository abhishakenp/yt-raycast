import { groqHomepage } from '../llm/groq.js'
import { readDesignRefFromWorkspace } from '../prompts/design-refs.js'
import {
  VAGUE_MARKETING_HOMEPAGE_APPENDIX,
  shouldExpandVagueMarketing,
} from '../prompts/vague-marketing-brief.js'
import { inferSiteTypeHint } from '../lib/infer-site-type.js'
import { readDesignReferenceUrlsFromWorkspace } from './ecommerce-design-references.js'
import { SHIP_FAST_SITE_URL, shipFastFooterLogoMarkup } from '../marketing.js'
import { translateHtml } from '../llm/translator.js'
import { stripFences, formatTps } from '../llm/utils.js'
import {
  alignGeneratedImagesToContext,
  hydrateStorefrontGradientSlots,
  injectEcommerceHeroResponsiveCss,
  verifyTrustedStockImageUrls,
} from './image-hints.js'
import { ensureLucideIconRuntime } from './lucide-icons.js'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { htmlLooksDegenerate } from './homepage-degeneracy.js'
import { writeFile } from './workspace.js'

const SHIPFAST_FOOTER_STYLE_ID = 'sf-footer-branding-style'
const SHIPFAST_FOOTER_MARKER = 'data-sf-footer-branding'
const INSTITUTIONAL_CHROME_STYLE_ID = 'sf-institutional-chrome'

const institutionalChromeStyleBlock = () => {
  const id = INSTITUTIONAL_CHROME_STYLE_ID
  return `<style id="${id}">
:root {
  --color-primary: #0d2d52 !important;
  --color-secondary: #ffffff !important;
  --color-accent: #1a3d82 !important;
  --color-background: #f0f2f5 !important;
  --color-surface: #ffffff !important;
  --color-text: #111827 !important;
  --color-muted: #374151 !important;
  --color-border: #94a3b8 !important;
  --shadow-soft: 0 1px 3px rgba(15, 23, 42, 0.08) !important;
  --shadow-card: 0 1px 2px rgba(15, 23, 42, 0.06) !important;
}
html { background: #f0f2f5 !important; }
body {
  margin: 0;
  background: #f0f2f5 !important;
  background-image: none !important;
  color: #111827 !important;
}
.site-shell { background: #f0f2f5 !important; }
.site-header {
  background: #0d2d52 !important;
  border-bottom: 1px solid #001a33 !important;
  color: #ffffff !important;
  backdrop-filter: none !important;
}
.site-header a,
.site-header .nav-toggle,
.site-header .brand,
.site-header .brand-name {
  color: #ffffff !important;
}
.site-header .button {
  background: rgba(255, 255, 255, 0.12) !important;
  border-color: rgba(255, 255, 255, 0.35) !important;
  color: #ffffff !important;
}
.site-header .button--primary {
  background: #ffffff !important;
  color: #0d2d52 !important;
  border-color: #ffffff !important;
}
.section h1,
.section h2,
.section h3 {
  color: var(--color-text) !important;
}
.site-shell > .section {
  color: var(--color-text) !important;
}
.section-body,
.hero-chip,
.logo-pill {
  color: var(--color-muted) !important;
}
.eyebrow {
  color: #0d2d52 !important;
  background: #e8eef5 !important;
  border-color: #94a3b8 !important;
}
.hero-panel,
.card,
.pricing-card,
.stat-card,
.faq-item,
.contact-form,
.cta-shell,
.quote-card,
.product-card {
  background: #ffffff !important;
  color: var(--color-text) !important;
  border-color: #cbd5e1 !important;
}
.hero-chip,
.logo-pill {
  background: #f1f5f9 !important;
}
.button {
  background: #f8fafc !important;
  color: #111827 !important;
  border-color: #cbd5e1 !important;
}
.button--primary {
  background: #0d2d52 !important;
  color: #ffffff !important;
  border-color: #0d2d52 !important;
  filter: none !important;
}
.site-footer {
  background: #0f172a !important;
  color: #e2e8f0 !important;
  border-top-color: #1e293b !important;
}
.site-footer a,
.footer-meta strong {
  color: #f8fafc !important;
}
.footer-meta {
  color: #cbd5e1 !important;
}
.contact-form label {
  color: #475569 !important;
}
.contact-form input,
.contact-form textarea {
  background: #ffffff !important;
  color: #111827 !important;
  border-color: #cbd5e1 !important;
}
.form-message {
  color: #0d2d52 !important;
}
.faq-trigger {
  color: #111827 !important;
}
.faq-content {
  color: #374151 !important;
}
</style>`
}

export function injectInstitutionalLightChrome(html, prompt) {
  if (inferSiteTypeHint(String(prompt || '')) !== 'institutional' || !html) return html
  const tag = institutionalChromeStyleBlock()
  const re = new RegExp(`<style\\s+id=["']${INSTITUTIONAL_CHROME_STYLE_ID}["'][\\s\\S]*?<\\/style>`, 'i')
  if (re.test(html)) return html.replace(re, tag)
  if (/<\/head>/i.test(html)) return html.replace(/<\/head>/i, `${tag}\n</head>`)
  if (/<head\b[^>]*>/i.test(html)) return html.replace(/<head\b[^>]*>/i, (h) => `${h}\n${tag}\n`)
  return `${tag}\n${html}`
}

export function applyInstitutionalLightChromeToWorkspaceHtml(workspace, prompt) {
  if (inferSiteTypeHint(String(prompt || '')) !== 'institutional' || !workspace) return
  let names
  try {
    names = readdirSync(workspace)
  } catch {
    return
  }
  for (const name of names) {
    if (!name.endsWith('.html')) continue
    const fp = join(workspace, name)
    let h
    try {
      h = readFileSync(fp, 'utf8')
    } catch {
      continue
    }
    const next = injectInstitutionalLightChrome(h, prompt)
    if (next !== h) writeFile(workspace, name, next)
  }
}

export function injectShipFastFooterBranding(html, log = () => {}) {
  if (!html) return html

  let next = html
  const hasBrandingMarkup = (value) => /<[^>]+\sdata-sf-footer-branding\b/i.test(value)

  if (!next.includes(SHIPFAST_FOOTER_STYLE_ID)) {
    const styleTag = `
    <style id="${SHIPFAST_FOOTER_STYLE_ID}">
      .sf-built-with-strip[${SHIPFAST_FOOTER_MARKER}] {
        padding: 1.5rem 1rem 2rem;
        text-align: center;
        clear: both;
        width: 100%;
        box-sizing: border-box;
        border-top: 1px solid rgba(63, 63, 70, 0.5);
      }
      [${SHIPFAST_FOOTER_MARKER}].footer-branding {
        margin-top: 0;
        display: inline-flex;
        justify-content: center;
      }
      [${SHIPFAST_FOOTER_MARKER}] .footer-branding__link {
        display: inline-flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.45rem 1rem 0.45rem 0.55rem;
        border-radius: 999px;
        border: 1px solid rgba(124, 58, 237, 0.45);
        background: linear-gradient(145deg, rgba(20, 12, 36, 0.92) 0%, rgba(46, 26, 78, 0.88) 50%, rgba(30, 18, 52, 0.94) 100%);
        box-shadow: 0 10px 32px rgba(124, 58, 237, 0.18), 0 2px 12px rgba(0, 0, 0, 0.35);
        color: #f4f4f5;
        text-decoration: none;
        transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
      }
      [${SHIPFAST_FOOTER_MARKER}] .footer-branding__link:hover {
        transform: translateY(-1px);
        border-color: rgba(167, 139, 250, 0.65);
        box-shadow: 0 14px 40px rgba(124, 58, 237, 0.28), 0 4px 14px rgba(0, 0, 0, 0.4);
      }
      [${SHIPFAST_FOOTER_MARKER}] .footer-branding__logo {
        flex-shrink: 0;
        width: 2rem;
        height: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        filter: drop-shadow(0 2px 6px rgba(124, 58, 237, 0.45));
      }
      [${SHIPFAST_FOOTER_MARKER}] .footer-branding__logo svg {
        width: 100%;
        height: 100%;
        display: block;
      }
      [${SHIPFAST_FOOTER_MARKER}] .footer-branding__text {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.06rem;
        line-height: 1.1;
      }
      [${SHIPFAST_FOOTER_MARKER}] .footer-branding__label {
        font-size: 0.62rem;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: rgba(196, 181, 253, 0.9);
      }
      [${SHIPFAST_FOOTER_MARKER}] .footer-branding__name {
        font-size: 0.88rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #fafafa;
      }
      [${SHIPFAST_FOOTER_MARKER}] .footer-branding__link::after {
        content: '↗';
        font-size: 0.85em;
        color: #a78bfa;
        align-self: center;
        margin-left: 0.1rem;
      }
    </style>
  `

    next = /<\/head>/i.test(next)
      ? next.replace(/<\/head>/i, `${styleTag}\n</head>`)
      : `${styleTag}\n${next}`
  }

  if (hasBrandingMarkup(next)) return next

  const brandingHtml = `
    <div ${SHIPFAST_FOOTER_MARKER} class="footer-branding" aria-label="Built with Ship Fast">
      <a class="footer-branding__link" href="${SHIP_FAST_SITE_URL}" target="_blank" rel="noreferrer">
        ${shipFastFooterLogoMarkup('sfhp')}
        <span class="footer-branding__text">
          <span class="footer-branding__label">Built with</span>
          <span class="footer-branding__name">Ship Fast</span>
        </span>
      </a>
    </div>
  `

  if (/<\/body>/i.test(next)) {
    next = next.replace(
      /<\/body>/i,
      `<footer class="sf-built-with-strip" style="padding: 1.5rem 1rem 2.5rem; text-align: center; clear: both; width: 100%; box-sizing: border-box;">${brandingHtml}</footer>\n</body>`,
    )
  } else {
    next = `${next}\n<footer class="sf-built-with-strip">${brandingHtml}</footer>`
  }

  if (next !== html) log('  ✓ Ship Fast footer branding appended')
  return next
}

export async function generateHomepage(
  prompt,
  workspace,
  log,
  sessionCtx,
  indiaMode = null,
  imageHints = null,
  brandProfile = null,
) {
  log('  homepage: generating from scratch (LLM)...')

  const hasDesignReferenceUrls = readDesignReferenceUrlsFromWorkspace(workspace).length > 0
  const result = await groqHomepage(
    prompt,
    imageHints,
    indiaMode,
    brandProfile,
    hasDesignReferenceUrls,
  )

  if (!result?.content || result.error) {
    log(`  ❌ homepage generation failed: ${result?.error ?? 'empty response'}`)
    throw new Error(`Homepage generation failed: ${result?.error}`)
  }

  let html = stripFences(result.content)

  html = html
    .replace(/const\s+\{[^}]*\}\s*=\s*require\([^)]*\);?\n?/g, '')
    .replace(/<link[^>]*href="styles\.css"[^>]*>/g, '')
    .replace(/<script[^>]*>\s*const\s+\{[^}]*\}\s*=\s*\{[^}]*\};\s*<\/script>\n?/g, '')

  html = injectShipFastFooterBranding(html, log)

  html = html
    .replace(/const\s+\{[^}]*\}\s*=\s*require\([^)]*\);?\n?/g, '')
    .replace(/<link[^>]*href="styles\.css"[^>]*>/g, '')
    .replace(/<script[^>]*>\s*const\s+\{[^}]*\}\s*=\s*\{[^}]*\};\s*<\/script>\n?/g, '')

  html = injectInstitutionalLightChrome(html, prompt)
  html = injectShipFastFooterBranding(html, log)

  if (indiaMode?.code && indiaMode.code !== 'en' && !indiaMode.skipFullTranslation) {
    log(`  homepage: translating to ${indiaMode.name || indiaMode.language?.name} via Groq...`)
    try {
      const translated = await translateHtml(html, indiaMode)
      if (translated?.content && !translated.error) {
        html = translated.content
        log(`  homepage: translation complete — ${translated.translatedCount} strings translated`)
      } else {
        log(`  homepage: translation failed — ${translated?.error ?? 'empty'}, keeping original`)
      }
    } catch (err) {
      log(`  homepage: translation error — ${err.message}, keeping original`)
    }
  }

  if (htmlLooksDegenerate(html)) {
    log('  ❌ homepage: rejected — output looks degenerate before image pass')
    throw new Error('Homepage output failed quality check')
  }

  html = alignGeneratedImagesToContext(html, imageHints)
  html = hydrateStorefrontGradientSlots(html, imageHints)
  html = await verifyTrustedStockImageUrls(html)
  html = injectEcommerceHeroResponsiveCss(html)
  html = ensureLucideIconRuntime(html, log)

  if (htmlLooksDegenerate(html)) {
    log('  ❌ homepage: rejected — output looks degenerate (repetition or invalid HTML)')
    throw new Error('Homepage output failed quality check')
  }

  writeFile(workspace, 'index.html', html)
  const tpsStr = formatTps(result) ? ` | ${formatTps(result)}` : ''
  log(`  index.html: ${html.length} chars${tpsStr}`)

  return {
    html,
    inputTokens: result.inputTokens ?? 0,
    outputTokens: result.outputTokens ?? 0,
    cost: result.cost ?? 0,
  }
}

export function injectDesignIntoHomepage(html, designBrief, workspace, log) {
  const configMatch = designBrief.match(/```json\s*(\{[\s\S]*?\})\s*```/)
  if (!configMatch) return html

  try {
    const configJson = JSON.parse(configMatch[1])
    const colors = configJson.colors || {}

    const cssVars = Object.entries(colors)
      .map(([name, value]) => `        --color-${name}: ${value};`)
      .join('\n')

    const tailwindColors = Object.keys(colors).reduce((acc, name) => {
      acc[name] = `var(--color-${name})`
      return acc
    }, {})

    const themeScript = `
    <style>
      :root {
${cssVars}
      }
      * {
        transition: background-color 0.6s cubic-bezier(0.4, 0, 0.2, 1),
                    color 0.6s cubic-bezier(0.4, 0, 0.2, 1),
                    border-color 0.6s cubic-bezier(0.4, 0, 0.2, 1),
                    fill 0.6s cubic-bezier(0.4, 0, 0.2, 1),
                    stroke 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      }
    </style>
    <script>
      (function () {
        var cfg = {
          theme: {
            extend: {
              colors: ${JSON.stringify(tailwindColors, null, 2)},
              fontFamily: ${JSON.stringify(configJson.fontFamily || {}, null, 2)}
            }
          }
        }
        function applyCfg() {
          if (typeof tailwind === 'undefined') return false
          tailwind.config = cfg
          return true
        }
        if (!applyCfg()) {
          var n = 0
          var id = setInterval(function () {
            n++
            if (applyCfg() || n > 80) clearInterval(id)
          }, 50)
        }
        window.addEventListener('message', function (e) {
          if (e.data.type === 'UPDATE_THEME') {
            var theme = e.data.colors
            for (var k in theme) {
              if (Object.prototype.hasOwnProperty.call(theme, k)) {
                document.documentElement.style.setProperty('--color-' + k, theme[k])
              }
            }
          }
        })
      })()
    </script>
  </head>`

    html = html.replace('</head>', themeScript)
    log('  ✓ Design system injected into homepage')
  } catch {
    log('  warning: failed to inject tailwind config')
  }

  html = ensureLucideIconRuntime(html, log)
  writeFile(workspace, 'index.html', html)
  return html
}
