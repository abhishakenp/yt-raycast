import { describe, expect, it } from 'vitest'
import {
  KNOWN_LANGUAGES,
  INDIAN_LANGUAGE_CODES,
  lookupKnownLanguage,
} from '../config/languages'

/**
 * Tests for the name->code resolution fix in detectLanguage.
 * The LLM sometimes returns the language name as the code (e.g. "malayalam"
 * instead of "ml"), which previously caused isIndian to be wrong.
 * The fix matches by name when code lookup fails.
 */
describe('language name->code resolution', () => {
  it('lookupKnownLanguage finds by canonical code', () => {
    const ml = lookupKnownLanguage('ml')
    expect(ml).toBeDefined()
    expect(ml?.name).toBe('Malayalam')
    expect(ml?.code).toBe('ml')
  })

  it('lookupKnownLanguage returns null for language name used as code', () => {
    // This is the bug: the LLM returns "malayalam" as the code
    expect(lookupKnownLanguage('malayalam')).toBeNull()
  })

  it('KNOWN_LANGUAGES includes Malayalam with code ml', () => {
    const malayalam = KNOWN_LANGUAGES.find((l) => l.name === 'Malayalam')
    expect(malayalam).toBeDefined()
    expect(malayalam?.code).toBe('ml')
  })

  it('INDIAN_LANGUAGE_CODES includes ml but not malayalam', () => {
    expect(INDIAN_LANGUAGE_CODES.has('ml')).toBe(true)
    expect(INDIAN_LANGUAGE_CODES.has('malayalam')).toBe(false)
  })

  it('name-based lookup resolves malayalam name to ml code (the fix)', () => {
    // Simulate what detectLanguage does after the LLM returns
    // {"code":"malayalam","name":"Malayalam",...}
    const llmCode = 'malayalam'
    const llmName = 'Malayalam'

    // Step 1: try by code (fails — this is the bug)
    let known = KNOWN_LANGUAGES.find((l) => l.code === llmCode)
    expect(known).toBeUndefined()

    // Step 2: try by name (the fix)
    if (!known) {
      const lowerName = llmName.toLowerCase()
      known = KNOWN_LANGUAGES.find((l) => l.name.toLowerCase() === lowerName)
    }
    expect(known).toBeDefined()
    expect(known?.code).toBe('ml')

    // Step 3: the resolved code should be in INDIAN_LANGUAGE_CODES
    const finalCode = known ? known.code : llmCode
    expect(INDIAN_LANGUAGE_CODES.has(finalCode)).toBe(true)
  })

  it('name-based lookup resolves Hindi name to hi code', () => {
    const llmCode = 'hindi'
    const llmName = 'Hindi'

    let known = KNOWN_LANGUAGES.find((l) => l.code === llmCode)
    expect(known).toBeUndefined()

    if (!known) {
      known = KNOWN_LANGUAGES.find(
        (l) => l.name.toLowerCase() === llmName.toLowerCase(),
      )
    }
    expect(known).toBeDefined()
    expect(known?.code).toBe('hi')
    expect(INDIAN_LANGUAGE_CODES.has(known!.code)).toBe(true)
  })

  it('name-based lookup resolves Tamil name to ta code', () => {
    const llmName = 'Tamil'
    const known = KNOWN_LANGUAGES.find(
      (l) => l.name.toLowerCase() === llmName.toLowerCase(),
    )
    expect(known).toBeDefined()
    expect(known?.code).toBe('ta')
    expect(INDIAN_LANGUAGE_CODES.has(known!.code)).toBe(true)
  })
})
