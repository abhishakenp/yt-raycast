import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const DASHBOARD = readFileSync(
  resolve(__dirname, '../../features/dashboard/components/Dashboard.tsx'),
  'utf8',
)
const SESSIONS = readFileSync(
  resolve(__dirname, '../../../convex/sessions.ts'),
  'utf8',
)
const ACCESS_HELPERS = readFileSync(
  resolve(__dirname, '../../../convex/lib/session_access_helpers.ts'),
  'utf8',
)
const VALIDATORS = readFileSync(
  resolve(__dirname, '../../../convex/lib/session_validators.ts'),
  'utf8',
)

describe('localization runtime selector wiring', () => {
  it('Dashboard: imports LanguagePicker', () => {
    expect(DASHBOARD).toContain(
      "import LanguagePicker from '@/genui/components/LanguagePicker'",
    )
  })

  it('Dashboard: uses setPreferredLanguage mutation', () => {
    expect(DASHBOARD).toContain('setPreferredLanguageMutation')
    expect(DASHBOARD).toContain('api.sessions.setPreferredLanguage')
  })

  it('Dashboard: renders LanguagePicker in the Localization SignInGate', () => {
    expect(DASHBOARD).toMatch(
      /<LanguagePicker[\s\S]*?data-rail-action="localization"/,
    )
    expect(DASHBOARD).toMatch(
      /setPreferredLanguageMutation\(\{[\s\S]*?preferredLanguage: language/,
    )
  })

  it('convex/sessions.ts: exports setPreferredLanguage mutation', () => {
    expect(SESSIONS).toContain('export const setPreferredLanguage = mutation({')
    expect(SESSIONS).toContain('setPreferredLanguageArgs')
    expect(SESSIONS).toContain('setSessionPreferredLanguage')
  })

  it('convex access helpers: defines setSessionPreferredLanguage', () => {
    expect(ACCESS_HELPERS).toContain('export const setSessionPreferredLanguage')
    expect(ACCESS_HELPERS).toContain(
      'preferredLanguage: args.preferredLanguage',
    )
  })

  it('convex validators: defines setPreferredLanguageArgs', () => {
    expect(VALIDATORS).toContain('export const setPreferredLanguageArgs')
    expect(VALIDATORS).toContain('preferredLanguage: v.string()')
  })
})
