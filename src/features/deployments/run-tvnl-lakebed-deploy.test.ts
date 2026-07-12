import { randomUUID } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { buildOpenUILakebedProjectFiles } from '@/features/exports/services/openui-lakebed-export-builder'
import { deployLakebedProjectFiles } from '@/features/deployments/server/lakebed-deploy-service'
import type { BrandLogoSelection } from '@/features/exports/services/openui-export-types'

// One-shot deploy runner. The self-hosted Convex backend on exodus has no
// outbound route to api.lakebed.dev, so the in-Convex deploy action fails with
// `fetch failed`; this runs the identical builder + deploy path from a machine
// that CAN reach Lakebed. Gated on TVNL_DEPLOY=1 so it never runs in CI.
const SESSION = process.env.TVNL_SESSION ?? ''
const SECRET = process.env.TVNL_SECRET ?? ''
const SLUG = process.env.TVNL_SLUG ?? 'tvnl'
const ORIGIN =
  process.env.TVNL_CONVEX_ORIGIN ?? 'https://courteous-horse-635.convex.cloud'
// Internal Convex functions are not HTTP-callable, so the stable-URL claim
// (deployId + claimUrl) is persisted to a local state file and reused as the
// existingDeployment on the next deploy → same *.lakebed.app URL on update.
const STATE = process.env.TVNL_DEPLOY_STATE ?? '/tmp/tvnl-lakebed-deploy.json'

async function call(
  kind: 'query' | 'mutation',
  path: string,
  args: unknown,
): Promise<Record<string, unknown>> {
  const res = await fetch(`${ORIGIN}/api/${kind}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, args, format: 'json' }),
  })
  const json = (await res.json()) as { status: string; value?: unknown }
  if (json.status !== 'success') throw new Error(JSON.stringify(json))
  return (json.value ?? {}) as Record<string, unknown>
}

describe('deploy tvnl to lakebed', () => {
  it('builds and deploys, preserving the stable URL on update', async () => {
    const prepared = await call(
      'query',
      'sessions:prepareLakebedDeploymentForPublish',
      { sessionId: SESSION, anonymousOwnerSecret: SECRET, requestedSlug: SLUG },
    )

    let existingDeployment:
      | { deployId?: string; claimUrl?: string; url?: string }
      | undefined
    if (existsSync(STATE)) {
      const prior = JSON.parse(readFileSync(STATE, 'utf8')) as {
        deployId?: string
        claimUrl?: string
        url?: string
      }
      if (prior.deployId && prior.claimUrl) {
        existingDeployment = prior
        // eslint-disable-next-line no-console
        console.log('reusing existing deployment for stable URL:', prior.url)
      }
    }

    // Pull the full catalog for this session (owner row carries the latest
    // curated content; falls back to the shared seed row).
    const owned = (await call('query', 'lakebed:getSessionData', {
      sessionId: SESSION,
      anonymousOwnerSecret: SECRET,
      capsule: 'GovPortal',
    })) as Record<string, unknown>
    const shared = (await call('query', 'lakebed:getSessionData', {
      sessionId: SESSION,
      capsule: 'GovPortal',
    })) as Record<string, unknown>
    const catalog = Object.keys(owned).length > 0 ? owned : shared
    const syncTables: Record<string, Array<Record<string, unknown>>> = {}
    for (const [table, rows] of Object.entries(catalog)) {
      if (Array.isArray(rows) && rows.length > 0) {
        syncTables[table] = rows as Array<Record<string, unknown>>
      }
    }

    // Per-deploy secret for the authorized sync endpoint. Reuse across updates
    // of the same deployment (persisted in the state file) so future syncs work.
    const syncSecret =
      (existingDeployment as { syncSecret?: string } | undefined)?.syncSecret ??
      randomUUID()

    const built = await buildOpenUILakebedProjectFiles({
      source: String(prepared.source ?? ''),
      siteSpecJson: prepared.siteSpecJson as string | undefined,
      previewHtml: prepared.previewHtml as string | undefined,
      sessionId: SESSION,
      prompt: prepared.prompt as string | undefined,
      target: 'lakebed',
      themeName: prepared.themeName as string | undefined,
      isDark:
        prepared.isDark === undefined ? undefined : Boolean(prepared.isDark),
      locale: prepared.locale as string | undefined,
      selectedBrandLogo: prepared.selectedBrandLogo as
        | BrandLogoSelection
        | null
        | undefined,
      syncSecret,
      lakebedSeedData: syncTables,
    })
    expect(built.fileCount).toBeGreaterThan(0)

    const result = await deployLakebedProjectFiles({
      files: built.files,
      inspectPolicy: 'public',
      existingDeployment,
      log: (message, detail) =>
        // eslint-disable-next-line no-console
        console.log(
          '[deploy]',
          message,
          detail ? JSON.stringify(detail).slice(0, 160) : '',
        ),
    })

    writeFileSync(
      STATE,
      JSON.stringify(
        {
          url: result.url,
          deployId: result.deployId,
          claimUrl: result.claimUrl,
          claimed: result.claimed,
          clientBundleBytes: result.clientBundleBytes,
          syncSecret,
        },
        null,
        2,
      ),
    )
    // eslint-disable-next-line no-console
    console.log('DEPLOYED', result.url)
    expect(result.url).toMatch(/^https?:\/\//)

    // Push the full catalog to the deployed DB via the authorized sync endpoint
    // (the platform → app data channel; same path future admin inline-edits use).
    const syncRes = await fetch(`${result.url}/api/__sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${syncSecret}`,
      },
      body: JSON.stringify({ tables: syncTables }),
    })
    const syncBody = (await syncRes.json()) as {
      ok?: boolean
      tables?: Record<string, number>
    }
    // eslint-disable-next-line no-console
    console.log(
      'SYNCED',
      syncRes.status,
      JSON.stringify(syncBody).slice(0, 200),
    )
    expect(syncRes.status).toBe(200)
    expect(syncBody.ok).toBe(true)
    expect(syncBody.tables?.tenders ?? 0).toBeGreaterThan(0)

    try {
      await call('mutation', 'sessions:recordLakebedDeploymentSuccess', {
        sessionId: SESSION,
        requestedSlug: SLUG,
        previewVersion: Number(prepared.previewVersion ?? 0),
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
      // eslint-disable-next-line no-console
      console.log('recorded deployment on session')
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('record skipped:', (error as Error).message)
    }
  }, 180000)
})
