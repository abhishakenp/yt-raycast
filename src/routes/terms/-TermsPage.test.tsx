// @vitest-environment node

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const readTermsPageSource = () =>
  readFileSync(join(process.cwd(), 'src/routes/terms/-TermsPage.tsx'), 'utf8')

describe('TermsPage legal placeholders', () => {
  it('does not render unresolved incorporation placeholders', () => {
    const source = readTermsPageSource()

    expect(source).not.toContain('Pending incorporation data')
    expect(source).not.toContain('pending final incorporation data')
    expect(source).toContain('LEGAL_INCORPORATION_JURISDICTION ? (')
    expect(source).toContain('LEGAL_COMPANY_REGISTRATION_NUMBER ? (')
    expect(source).toContain('legalAddressLines.length > 0 ? (')
  })
})
