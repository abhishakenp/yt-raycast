import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  buildOpenUILakebedProjectFiles,
  findUnboundClientReferences,
} from '@/features/exports/services/openui-lakebed-export-builder'

const SESSION = process.env.TVNL_SESSION ?? ''
const SECRET = process.env.TVNL_SECRET ?? ''
const OUT = process.env.TVNL_OUT ?? '/tmp/tvnl-lakebed-build'
const ORIGIN =
  process.env.TVNL_CONVEX_ORIGIN ?? 'https://courteous-horse-635.convex.cloud'

const query = async (path: string, args: unknown) => {
  const res = await fetch(`${ORIGIN}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, args, format: 'json' }),
  })
  const json = (await res.json()) as { status: string; value?: unknown }
  if (json.status !== 'success') throw new Error(JSON.stringify(json))
  return json.value as Record<string, string | undefined>
}

describe.runIf(process.env.TVNL_INSPECT === '1')('inspect tvnl lakebed build', () => {
  it('builds and dumps files, flags unbound client references', async () => {
    const prepared = await query(
      'sessions:prepareLakebedDeploymentForPublish',
      { sessionId: SESSION, anonymousOwnerSecret: SECRET, requestedSlug: 'tvnl' },
    )
    const built = await buildOpenUILakebedProjectFiles({
      source: prepared.source ?? '',
      siteSpecJson: prepared.siteSpecJson,
      previewHtml: prepared.previewHtml,
      sessionId: SESSION,
      target: 'lakebed',
      themeName: prepared.themeName,
      isDark: prepared.isDark === undefined ? undefined : Boolean(prepared.isDark),
      locale: prepared.locale,
    })
    mkdirSync(OUT, { recursive: true })
    const offenders: Record<string, string[]> = {}
    for (const [path, contents] of Object.entries(built.files)) {
      writeFileSync(join(OUT, path.replace(/[\/]/g, '__')), contents)
      // Only OUR generated client code — third-party vendored ESM legitimately
      // reads many globals we don't model.
      if (
        !path.startsWith('client/') ||
        path.startsWith('client/vendor/') ||
        !/\.tsx?$/.test(path)
      ) {
        continue
      }
      const unbound = findUnboundClientReferences(contents, path)
      if (unbound.length > 0) offenders[path] = unbound
    }
    writeFileSync('/tmp/tvnl-offenders.json', JSON.stringify(offenders, null, 2))
    // eslint-disable-next-line no-console
    console.log('OFFENDERS', JSON.stringify(offenders))
    expect(built.fileCount).toBeGreaterThan(0)
  }, 120000)
})
