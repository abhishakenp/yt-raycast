import { groqHomepage } from '../llm/groq.js'
import { translateHtml } from '../llm/translator.js'
import { stripFences, formatTps } from '../llm/utils.js'
import { ensureLucideIconRuntime } from './lucide-icons.js'
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
      [${SHIPFAST_FOOTER_MARKER}] {
        margin-top: 1rem;
        display: flex;
        justify-content: center;
      }
      [${SHIPFAST_FOOTER_MARKER}] a {
        display: inline-flex;
        align-items: center;
        gap: 0.65rem;
        padding: 0.55rem 0.9rem;
        border-radius: 999px;
        border: 1px solid rgba(148, 163, 184, 0.24);
        background: rgba(15, 23, 42, 0.08);
        color: inherit;
        text-decoration: none;
        backdrop-filter: blur(10px);
        box-shadow: 0 12px 28px rgba(15, 23, 42, 0.12);
        transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease,
          background-color 180ms ease;
      }
      [${SHIPFAST_FOOTER_MARKER}] a:hover {
        transform: translateY(-1px);
        border-color: rgba(148, 163, 184, 0.34);
        background: rgba(15, 23, 42, 0.12);
        box-shadow: 0 16px 34px rgba(15, 23, 42, 0.16);
      }
      [${SHIPFAST_FOOTER_MARKER}] .sf-footer-branding__label {
        font-size: 0.72rem;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        opacity: 0.65;
      }
      [${SHIPFAST_FOOTER_MARKER}] .sf-footer-branding__name {
        font-size: 0.95rem;
        font-weight: 600;
        letter-spacing: -0.02em;
        opacity: 0.96;
      }
      [${SHIPFAST_FOOTER_MARKER}] .sf-footer-branding__arrow {
        font-size: 0.8rem;
        opacity: 0.72;
      }
    </style>
  `

    next = /<\/head>/i.test(next)
      ? next.replace(/<\/head>/i, `${styleTag}\n</head>`)
      : `${styleTag}\n${next}`
  }

  if (hasBrandingMarkup(next)) return next

  const brandingHtml = `
    <div ${SHIPFAST_FOOTER_MARKER} aria-label="Built with ShipFast">
      <a href="https://shipfast.dev" target="_blank" rel="noreferrer">
        <span class="sf-footer-branding__label">Built with</span>
        <span class="sf-footer-branding__name">ShipFast</span>
        <span class="sf-footer-branding__arrow" aria-hidden="true">&nearr;</span>
      </a>
    </div>
  `

  if (/<\/footer>/i.test(next)) {
    next = next.replace(/<\/footer>/i, `${brandingHtml}\n</footer>`)
  } else if (/<\/body>/i.test(next)) {
    next = next.replace(
      /<\/body>/i,
      `<footer style="padding: 1.5rem 1rem 2.5rem; text-align: center;">${brandingHtml}</footer>\n</body>`,
    )
  } else {
    next = `${next}\n${brandingHtml}`
  }

  if (next !== html) log('  ✓ ShipFast footer branding injected into homepage')
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

  const result = await groqHomepage(prompt, imageHints, indiaMode, brandProfile)

  if (!result?.content || result.error) {
    log(`  ❌ homepage generation failed: ${result?.error ?? 'empty response'}`)
    throw new Error(`Homepage generation failed: ${result?.error}`)
  }

  let html = stripFences(result.content)

  // Clean up invalid server-side code in generated HTML
  html = html
    .replace(/const\s+\{[^}]*\}\s*=\s*require\([^)]*\);?\n?/g, '')
    .replace(/<link[^>]*href="styles\.css"[^>]*>/g, '')
    .replace(/<script[^>]*>\s*const\s+\{[^}]*\}\s*=\s*\{[^}]*\};\s*<\/script>\n?/g, '')

  html = injectShipFastFooterBranding(html, log)

  if (indiaMode?.isIndian && !indiaMode.language?.skipFullTranslation) {
    log(`  homepage: translating to ${indiaMode.language.name} via Groq...`)
    try {
      const translated = await translateHtml(html, indiaMode)
      if (translated?.content && !translated.error) {
        html = translated.content
        log(`  homepage: translation complete — ${translated.translatedCount} strings translated`)
      } else {
        log(`  homepage: translation failed — ${translated?.error ?? 'empty'}, keeping English`)
      }
    } catch (err) {
      log(`  homepage: translation error — ${err.message}, keeping English`)
    }
  }

  html = ensureLucideIconRuntime(html, log)

  writeFile(workspace, 'index.html', html)
  const tpsStr = formatTps(result) ? ` | ${formatTps(result)}` : ''
  log(`  index.html: ${html.length} chars${tpsStr}`)

  sessionCtx.signalHomepageReady()
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
