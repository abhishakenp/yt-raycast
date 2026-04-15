import { groqHomepage } from '../llm/groq.js'
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
import { htmlLooksDegenerate } from './homepage-degeneracy.js'
import { writeFile } from './workspace.js'

const SHIPFAST_FOOTER_STYLE_ID = 'sf-footer-branding-style'
const SHIPFAST_FOOTER_MARKER = 'data-sf-footer-branding'

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
  const result = await groqHomepage(prompt, imageHints, indiaMode, brandProfile, hasDesignReferenceUrls)

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
      tailwind.config = {
        theme: {
          extend: {
            colors: ${JSON.stringify(tailwindColors, null, 2)},
            fontFamily: ${JSON.stringify(configJson.fontFamily || {}, null, 2)}
          }
        }
      }

      window.addEventListener('message', (e) => {
        if (e.data.type === 'UPDATE_THEME') {
          const theme = e.data.colors;
          for (const [name, value] of Object.entries(theme)) {
            document.documentElement.style.setProperty(\`--color-\${name}\`, value);
          }
        }
      });
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
