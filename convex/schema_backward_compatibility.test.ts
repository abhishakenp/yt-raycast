/// <reference types="vite/client" />

import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'

import type { Doc } from './_generated/dataModel'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

describe('preview schema backward compatibility', () => {
  it('accepts legacy inline-html rows and v3 source-only rows', async () => {
    const t = convexTest(schema, modules)

    const previewIds = await t.run(async (ctx) => {
      const sessionId = await ctx.db.insert('sessions', {
        prompt: 'Preview schema compatibility fixture',
        preferredLanguage: 'en',
        preferredExportTarget: 'html',
        isPrivate: true,
        createdAt: Date.now(),
      })
      const legacyPreview = {
        sessionId,
        version: 1,
        html: '<main>Legacy preview</main>',
        createdAt: Date.now(),
        source: 'generation',
      } satisfies Omit<Doc<'previews'>, '_id' | '_creationTime'>
      const legacyPreviewId = await ctx.db.insert('previews', legacyPreview)
      const v3PreviewId = await ctx.db.insert('previews', {
        sessionId,
        version: 2,
        openUiSource: 'root = Text("V3 preview")',
        createdAt: Date.now(),
        source: 'generation',
      })

      return { legacyPreviewId, v3PreviewId }
    })

    await expect(
      t.run(async (ctx) => {
        const legacyPreview = await ctx.db.get(
          'previews',
          previewIds.legacyPreviewId,
        )
        const v3Preview = await ctx.db.get('previews', previewIds.v3PreviewId)

        return {
          legacyHtml: legacyPreview?.html,
          v3OpenUiSource: v3Preview?.openUiSource,
        }
      }),
    ).resolves.toEqual({
      legacyHtml: '<main>Legacy preview</main>',
      v3OpenUiSource: 'root = Text("V3 preview")',
    })
  })
})
