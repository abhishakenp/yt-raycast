/**
 * Stable Lakebed Export Builder
 *
 * This builder works with stable artifacts (final HTML) instead of engine internals.
 * For Lakebed deployments, it extracts the necessary information from the HTML
 * and creates the project structure without depending on OpenUI parsing.
 *
 * Note: This is a simplified version for the decoupling effort. A complete
 * implementation would need to handle component extraction, schema inference, etc.
 * For now, it provides the contract and structure for the stable path.
 */

import type { StableExportInput } from './stable-artifact-contract'

/**
 * Build Lakebed project files from stable artifact
 * This is the decoupled version that works with final HTML, not OpenUI source
 */
export async function buildStableLakebedProjectFiles(
  input: StableExportInput,
  options: { useEnvironmentSyncSecret?: boolean } = {},
): Promise<{ files: Record<string, string> }> {
  const { artifact, sessionId } = input
  const { useEnvironmentSyncSecret = true } = options

  const html = artifact.html
  const siteSpec = artifact.siteSpec ?? {}
  const lakebedData = artifact.lakebedData ?? {}

  // Extract basic project information
  const projectName = siteSpec.projectName ?? siteSpec.brand ?? sessionId

  // Build the Lakebed project structure
  const files: Record<string, string> = {}

  files['server/index.ts'] = buildServerIndex(projectName)
  files['client/index.tsx'] = buildClientIndex(html)

  // Environment file for sync secret
  if (useEnvironmentSyncSecret && lakebedData.syncSecret) {
    files['.env'] = `LAKEBED_SYNC_SECRET=${lakebedData.syncSecret}\n`
  }

  // README
  files['README.md'] = `# ${projectName}

This is a Lakebed project generated from a stable artifact.

## Development

\`\`\`bash
npm install
npm run dev
\`\`\`

## Deployment

This project is configured for Lakebed deployment.
`

  return { files }
}

function buildServerIndex(projectName: string): string {
  return `import { capsule } from 'lakebed/server'

export default capsule({
  name: ${JSON.stringify(projectName)},
  schema: {},
  queries: {},
  mutations: {},
})
`
}

function buildClientIndex(html: string): string {
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? html
  return `const markup = ${JSON.stringify(body).replaceAll('</script>', '<\\/script>')}

export function App() {
  return <main dangerouslySetInnerHTML={{ __html: markup }} />
}
`
}

/**
 * Create a Lakebed deployment bundle from stable artifact
 * This creates a ZIP file suitable for Lakebed deployment
 */
