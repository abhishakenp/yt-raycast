import { groqHomepage } from '../llm/groq.js'
import { stripFences, formatTps } from '../llm/utils.js'
import { writeFile } from './workspace.js'

export async function generateHomepage(prompt, workspace, log, sessionCtx) {
  log('  homepage: generating from scratch (LLM)...')

  const result = await groqHomepage(prompt)

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

  writeFile(workspace, 'index.html', html)
  return html
}
