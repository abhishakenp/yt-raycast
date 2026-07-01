import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

import { getWorkspacePreferredLanguage } from './session-prefs.js'

const workspaces = []

const makeWorkspace = (contents) => {
  const workspace = mkdtempSync(join(tmpdir(), 'ship-fast-session-prefs-'))
  workspaces.push(workspace)
  if (contents !== undefined) {
    writeFileSync(join(workspace, '.session.json'), contents)
  }
  return workspace
}

afterEach(() => {
  for (const workspace of workspaces.splice(0)) {
    rmSync(workspace, { recursive: true, force: true })
  }
})

describe('workspace preferred language', () => {
  it('defaults to English when no workspace or session metadata exists', () => {
    expect(getWorkspacePreferredLanguage(null)).toBe('en')
    expect(getWorkspacePreferredLanguage(undefined)).toBe('en')
    expect(getWorkspacePreferredLanguage(makeWorkspace())).toBe('en')
  })

  it('normalizes supported plain, romanized, and code-mixed language values', () => {
    expect(
      getWorkspacePreferredLanguage(
        makeWorkspace(JSON.stringify({ preferredLanguage: ' HI ' })),
      ),
    ).toBe('hi')
    expect(
      getWorkspacePreferredLanguage(
        makeWorkspace(JSON.stringify({ preferredLanguage: 'hi-Latn' })),
      ),
    ).toBe('hi-latn')
    expect(
      getWorkspacePreferredLanguage(
        makeWorkspace(JSON.stringify({ preferredLanguage: 'ta-EN' })),
      ),
    ).toBe('ta-en')
    expect(
      getWorkspacePreferredLanguage(
        makeWorkspace(JSON.stringify({ preferredLanguage: 'Hinglish' })),
      ),
    ).toBe('hinglish')
  })

  it('preserves browser-native region language tags from session metadata', () => {
    expect(
      getWorkspacePreferredLanguage(
        makeWorkspace(JSON.stringify({ preferredLanguage: 'es-MX' })),
      ),
    ).toBe('es-mx')
  })

  it('falls back to English for malformed metadata or unsafe values', () => {
    expect(getWorkspacePreferredLanguage(makeWorkspace('{not-json'))).toBe('en')
    expect(
      getWorkspacePreferredLanguage(
        makeWorkspace(JSON.stringify({ preferredLanguage: '../hi' })),
      ),
    ).toBe('en')
  })
})
