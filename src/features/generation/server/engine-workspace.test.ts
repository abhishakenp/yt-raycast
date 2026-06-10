import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { describe, expect, it } from 'vitest'
import {
  createEngineWorkspacePath,
  prepareEngineWorkspace,
  readEngineWorkspaceArtifacts,
} from '@/features/generation/server/engine-workspace'

const createTempRoot = (): string => mkdtempSync(join(tmpdir(), 'ship-fast-v2-engine-'))

describe('engine workspace', () => {
  it('creates deterministic safe workspace paths for generated sessions', () => {
    const workspace = createEngineWorkspacePath('/tmp/ship-fast', 'Session 123 / Demo!')

    expect(workspace).toBe('/tmp/ship-fast/session-123-demo')
  })

  it('reads generated engine artifacts from disk', () => {
    const workspace = join(createTempRoot(), 'session')
    mkdirSync(workspace, { recursive: true })
    writeFileSync(join(workspace, 'index.html'), '<!doctype html><h1>Preview</h1>')
    writeFileSync(join(workspace, 'site-spec.json'), JSON.stringify({ brand: 'Preview' }))
    writeFileSync(join(workspace, 'home.openui'), 'page Home {}')
    writeFileSync(
      join(workspace, 'tasks.json'),
      JSON.stringify({
        tasks: [{ id: 'home.openui', label: 'Generate Home page', status: 'DONE' }],
      }),
    )

    expect(readEngineWorkspaceArtifacts(workspace)).toEqual({
      html: '<!doctype html><h1>Preview</h1>',
      siteSpecJson: '{"brand":"Preview"}',
      openUiSource: 'page Home {}',
      tasks: [{ id: 'home.openui', label: 'Generate Home page', status: 'DONE' }],
    })
  })

  it('clears stale files before engine generation starts', () => {
    const workspace = join(createTempRoot(), 'session')
    mkdirSync(workspace, { recursive: true })
    writeFileSync(join(workspace, 'index.html'), '<h1>Stale</h1>')

    prepareEngineWorkspace(workspace)

    expect(() => readEngineWorkspaceArtifacts(workspace)).toThrow('Ship Fast engine did not write index.html')
  })
})
