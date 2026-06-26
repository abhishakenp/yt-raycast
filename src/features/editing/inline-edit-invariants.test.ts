import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (path: string): string =>
  readFileSync(join(process.cwd(), path), 'utf8')

const sliceAfter = (src: string, marker: string, len = 1200): string => {
  const i = src.indexOf(marker)
  expect(i, `marker not found: ${marker}`).toBeGreaterThan(-1)
  return src.slice(i, i + len)
}

describe('inline text edit — structure-preserving, no double-submit', () => {
  const src = read('src/features/editing/hooks/useTextEdit.ts')

  it('clears activeEditRef BEFORE invoking the change callback', () => {
    // cleanupElement() resets contentEditable, which blurs the element and
    // re-enters finishEdit via the capture blur listener. Clearing the ref first
    // makes the re-entrant call a no-op (otherwise the edit fires twice: the 2nd
    // sends stale text → TEXT_NOT_FOUND and its error path reverts the DOM).
    const finishEdit = sliceAfter(src, 'const finishEdit = ()')
    const clearIdx = finishEdit.indexOf('activeEditRef.current = null')
    const callbackIdx = finishEdit.indexOf('callbackRef.current(')
    expect(clearIdx).toBeGreaterThan(-1)
    expect(callbackIdx).toBeGreaterThan(-1)
    expect(clearIdx).toBeLessThan(callbackIdx)
  })

  it('edits per text-node (preserves <br>/<span>) instead of flattening textContent', () => {
    // The element is diffed node-by-node so inline structure survives and each
    // change is a precise text run that maps cleanly to BOTH preview.html and
    // openUiSource (so it persists and never throws TEXT_NOT_FOUND).
    expect(src).toContain('collectTextNodes')
    expect(src).toContain('originalNodes')
    const finishEdit = sliceAfter(src, 'const finishEdit = ()')
    expect(finishEdit).toContain('diffEdits')
  })

  it('places the caret at the click point rather than selecting all', () => {
    // Select-all means the first keystroke replaces the whole element, flattening
    // structure. Caret placement keeps edits surgical.
    expect(src).toContain('caretRangeFromPoint')
    const handleClick = sliceAfter(src, 'const handleClick =', 2000)
    expect(handleClick).not.toContain(
      'range.selectNodeContents(textEl)\n      const sel',
    )
  })
})

describe('inline edit — preview does not remount per edit (Dashboard key)', () => {
  const src = read('src/features/dashboard/components/Dashboard.tsx')

  it('keys GeneratedModulePreview on homeModule.updatedAt, not previewVersion', () => {
    expect(src).not.toContain(
      'key={`${generationView.session.previewVersion}:${homeModule.updatedAt}`}',
    )
    expect(src).toContain('key={`${homeModule?.updatedAt')
  })

  it('builds image, style, and text override maps from recorded edits', () => {
    expect(src).toContain('const imageOverrides = useMemo(')
    expect(src).toContain('const styleOverrides = useMemo(')
    expect(src).toContain('const textOverrides = useMemo(')
    expect(src).toContain("edit.editType === 'style'")
    expect(src).toContain("edit.editType === 'text'")
    expect(src).toContain('imageOverrides={imageOverrides}')
    expect(src).toContain('styleOverrides={styleOverrides}')
    expect(src).toContain('textOverrides={textOverrides}')
  })
})

describe('inline edit — overrides applied at render', () => {
  it('img.tsx honors an alt-keyed override before the stock lookup', () => {
    const src = read('packages/ship-fast-blocks/src/lib/img.tsx')
    expect(src).toContain('overrides')
    const imageSrc = sliceAfter(src, 'const imageSrc =', 400)
    expect(imageSrc).toContain('overrideSrc')
  })

  it('DirectPreview re-applies style and text overrides and re-runs on subtree mutations', () => {
    const src = read('src/components/GenUI/DirectPreview.tsx')
    expect(src).toContain('styleOverrides')
    expect(src).toContain('textOverrides')
    expect(src).toContain('setProperty')
    expect(src).toContain('applyPreviewTextEdit')
    expect(src).toContain('MutationObserver')
  })

  it('GeneratedModulePreview threads all override maps down', () => {
    const src = read(
      'src/features/generation/components/GeneratedModulePreview.tsx',
    )
    expect(src).toContain('imageOverrides')
    expect(src).toContain('styleOverrides')
    expect(src).toContain('textOverrides')
  })
})

describe('inline edit — server anchors & persistence (convex)', () => {
  const editHelpers = read('src/lib/edit-helpers.ts')
  const editMutationHelpers = read(
    'convex/lib/session_edit_mutation_helpers.ts',
  )
  const previewHistoryHelpers = read(
    'convex/lib/session_preview_history_helpers.ts',
  )

  it('image swaps anchor on the alt attribute, not the (context-dependent) src', () => {
    const fn = sliceAfter(editHelpers, 'export const applyImageSwap = (')
    expect(fn).toContain('altAnchor')
    expect(fn).toContain('altMatch')
    expect(editHelpers).not.toContain('normalizeImageSrc')
  })

  it('style edits anchor on the class attribute', () => {
    const fn = sliceAfter(editHelpers, 'export const applyStyleEdit = (')
    expect(fn).toContain('classAnchor')
    expect(fn).toContain('class="')
  })

  it('all edit types (text, image, style) skip artifact mutation and use override pattern', () => {
    expect(editMutationHelpers).toContain(
      'All edit types now use the same pattern',
    )
    expect(editMutationHelpers).toContain('snapshotCurrentArtifacts')
    // The function still exists for legacy reasons but is no longer called
    expect(editMutationHelpers).toContain(
      'artifactSnapshot = await snapshotCurrentArtifacts',
    )
  })

  it('records every edit (incl. image) with its occurrenceIndex for override rebuild', () => {
    expect(editMutationHelpers).toContain(
      'Record edit history for all edit types',
    )
    expect(editMutationHelpers).toContain(
      'occurrenceIndex: args.occurrenceIndex',
    )
    expect(previewHistoryHelpers).toContain(
      'occurrenceIndex: edit.occurrenceIndex',
    )
  })

  it('edits schema stores occurrenceIndex and the image edit type', () => {
    const schema = read('convex/schema.ts')
    const edits = sliceAfter(schema, 'edits: defineTable(', 600)
    expect(edits).toContain("v.literal('image')")
    expect(edits).toContain('occurrenceIndex: v.optional(v.number())')
  })

  it('export helpers apply edits to source before export', () => {
    const exportHelpers = read('convex/lib/session_export_helpers.ts')
    expect(exportHelpers).toContain('applyEditsToSource')
    expect(exportHelpers).toContain('applyPreviewTextEdit')
    expect(exportHelpers).toContain('applyImageSwap')
    expect(exportHelpers).toContain('applyStyleEdit')
  })
})
