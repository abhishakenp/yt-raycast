import { describe, expect, it } from 'vitest'

import { applyEditsToSource } from './session_export_helpers'
import {
  applyCachedTranslationsToSource,
  type CachedSourceTranslation,
} from './session_translation_cache_helpers'

const originalHeading = 'स्वीट क्रम्ब बेकरी'
const replacementHeading = 'स्वीट क्रम्ब बेकरी रिलीज़'
const malformedPersistedHeading = 'स्वीट क्रस्वीट क्रम्ब बेकरी रिलीज़म्ब बेकरी'
const compoundedHeading =
  'स्वीट क्रस्वीट क्रस्वीट क्रम्ब बेकरी रिलीज़म्ब बेकरी रिलीज़म्ब बेकरी'
const cachedTranslations: CachedSourceTranslation[] = [
  { sourceText: 'Add to Cart', translation: 'कार्ट में जोड़ें' },
]
const persistedEdit = [
  {
    afterText: malformedPersistedHeading,
    beforeText: originalHeading,
    editType: 'text',
    occurrenceIndex: 0,
  },
]

const applyExportTransforms = (source: string): string =>
  applyCachedTranslationsToSource(
    applyEditsToSource(source, persistedEdit),
    cachedTranslations,
  )

describe('session export translation and edit idempotence', () => {
  it('does not reapply an already materialized cached translation', () => {
    const source = 'root = BakeryMenu({"addLabel":"Add to Cart"})'
    const once = applyCachedTranslationsToSource(source, cachedTranslations)
    const twice = applyCachedTranslationsToSource(once, cachedTranslations)

    expect(twice).toBe(once)
    expect(twice).toContain('कार्ट में जोड़ें')
  })

  it('does not compound a persisted Unicode inline edit on export rebuild', () => {
    const canonicalSource = `root = BakeryHero("${originalHeading}", "Add to Cart")`
    const firstRebuild = applyExportTransforms(canonicalSource)
    const secondRebuild = applyExportTransforms(firstRebuild)

    expect(firstRebuild).toContain(malformedPersistedHeading)
    expect(firstRebuild).toContain(replacementHeading)
    expect(firstRebuild).not.toContain(compoundedHeading)
    expect(secondRebuild).toBe(firstRebuild)
    expect(secondRebuild).not.toContain(compoundedHeading)
  })
})
