#!/usr/bin/env bun
/**
 * deploy-tvnl-lakebed.mjs — deploy a seeded GovPortal session to Lakebed from
 * THIS machine (the self-hosted Convex backend on exodus has no outbound to
 * api.lakebed.dev, so the in-Convex deploy action fails with `fetch failed`).
 *
 * Run with bun (handles TS + tsconfig path aliases):
 *   bun scripts/deploy-tvnl-lakebed.mjs <sessionId> <ownerSecret> [slug]
 */
import { buildOpenUILakebedProjectFiles } from '../src/features/exports/services/openui-lakebed-export-builder.ts'
import { deployLakebedProjectFiles } from '../src/features/deployments/server/lakebed-deploy-service.ts'

const [sessionId, ownerSecret, slug = 'tvnl'] = process.argv.slice(2)
if (!sessionId || !ownerSecret) {
  console.error(
    'usage: bun scripts/deploy-tvnl-lakebed.mjs <sessionId> <ownerSecret> [slug]',
  )
  process.exit(1)
}

const origin = 'https://courteous-horse-635.convex.cloud'
const query = async (path, args) => {
  const res = await fetch(`${origin}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, args, format: 'json' }),
  })
  const json = await res.json()
  if (json.status !== 'success') throw new Error(JSON.stringify(json))
  return json.value
}
const mutation = async (path, args) => {
  const res = await fetch(`${origin}/api/mutation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, args, format: 'json' }),
  })
  const json = await res.json()
  if (json.status !== 'success') throw new Error(JSON.stringify(json))
  return json.value
}

console.error('Preparing deployment…')
const prepared = await query('sessions:prepareLakebedDeploymentForPublish', {
  sessionId,
  anonymousOwnerSecret: ownerSecret,
  requestedSlug: slug,
})

console.error('Building Lakebed project files…')
const built = await buildOpenUILakebedProjectFiles({
  source: prepared.source,
  siteSpecJson: prepared.siteSpecJson,
  previewHtml: prepared.previewHtml,
  sessionId,
  prompt: prepared.prompt,
  target: 'lakebed',
  themeName: prepared.themeName,
  isDark: prepared.isDark,
  locale: prepared.locale,
  selectedBrandLogo: prepared.selectedBrandLogo,
})
console.error(`  built ${built.fileCount} files`)

console.error('Deploying to api.lakebed.dev…')
const result = await deployLakebedProjectFiles({
  files: built.files,
  inspectPolicy: 'public',
  log: (m, d) =>
    console.error('  [deploy]', m, d ? JSON.stringify(d).slice(0, 140) : ''),
})

// Best-effort: record the deployment back on the session (ignore failures).
try {
  await mutation('sessions:recordLakebedDeploymentSuccess', {
    sessionId,
    requestedSlug: slug,
    previewVersion: prepared.previewVersion ?? 0,
    url: result.url,
    deployId: result.deployId,
    claimUrl: result.claimUrl,
    artifactHash: result.artifactHash,
    clientBundleHash: result.clientBundleHash,
    clientBundleBytes: result.clientBundleBytes,
    requestBodyBytes: result.requestBodyBytes,
    serverBundleBytes: result.serverBundleBytes,
    sourceFileCount: result.sourceFileCount,
    expiresAt: result.expiresAt,
    inspectPolicy: result.inspectPolicy,
  })
  console.error('  recorded deployment on session')
} catch (error) {
  console.error('  (record skipped:', error.message, ')')
}

console.log(
  JSON.stringify({
    url: result.url,
    deployId: result.deployId,
    claimUrl: result.claimUrl,
    claimed: result.claimed,
  }),
)
