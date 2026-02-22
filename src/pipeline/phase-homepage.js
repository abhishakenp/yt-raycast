import { groqHomepage } from '../llm/groq.js'
import { stripFences, formatTps } from '../llm/utils.js'
import { writeFile } from './workspace.js'
import { homepagePrompt } from '../prompts/homepage.js'

export async function generateHomepage(prompt, ctx, designBrief, workspace, log, sessionCtx) {
  log('  homepage: generating')

  const userPrompt = homepagePrompt(prompt, ctx, designBrief)
  const result = await groqHomepage(userPrompt)

  let html = stripFences(result.content)

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
    } catch (e) {
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
