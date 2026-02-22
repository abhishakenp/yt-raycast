import { loadTemplate } from '../llm/template-loader.js'
import { groqCustomizeTemplate } from '../llm/groq.js'
import { stripFences, formatTps } from '../llm/utils.js'
import { writeFile } from './workspace.js'

export async function generateHomepage(prompt, ctx, designBrief, workspace, log, sessionCtx) {
  const siteType = ctx?.site_type ?? 'saas'

  // Step 1: Load template from collection (randomly picks v1 or v2)
  log('  homepage: loading template...')
  let templateResult
  try {
    templateResult = await loadTemplate(siteType)
    log(`  using ${templateResult.version} template (${siteType})`)
  } catch (err) {
    log(`  ❌ template failed: ${err?.message}`)
    throw new Error(`Template loading failed: ${err?.message}`)
  }
  const template = templateResult.content

  // Step 2: Customize template with project content
  log('  homepage: customizing with content...')
  const customizeResult = await groqCustomizeTemplate(template, prompt, ctx, designBrief)
  if (customizeResult.error) {
    log(`  ⚠️  customization failed, using template as-is: ${customizeResult.error}`)
    var result = templateResult
  } else {
    var result = customizeResult
  }

  let html = stripFences(result.content)

  // Clean up invalid server-side code in generated HTML
  html = html
    // Remove require() statements (CommonJS in browser)
    .replace(/const\s+\{[^}]*\}\s*=\s*require\([^)]*\);?\n?/g, '')
    // Remove broken CSS file references
    .replace(/<link[^>]*href="styles\.css"[^>]*>/g, '')
    // Remove malformed script tags that reference non-existent modules
    .replace(/<script[^>]*>\s*const\s+\{[^}]*\}\s*=\s*\{[^}]*\};\s*<\/script>\n?/g, '')

  // Inject Tailwind config if found in design brief
  const configMatch = designBrief.match(/```json\s*(\{[\s\S]*?\})\s*```/)
  if (configMatch) {
    try {
      const configJson = JSON.parse(configMatch[1])
      const colors = configJson.colors || {}

      // Create CSS variables for colors
      const cssVars = Object.entries(colors)
        .map(([name, value]) => `        --color-${name}: ${value};`)
        .join('\n')

      // Create mapping for tailwind config
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
    } catch {
      log('  warning: failed to inject tailwind config')
    }
  }

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
