import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { afterEach, describe, expect, it } from 'vitest'

import { loadSiteSpec, saveSiteSpec } from './index.ts'

const tempDirs: string[] = []

const createWorkspace = () => {
  const dir = mkdtempSync(join(tmpdir(), 'ship-fast-site-spec-'))
  tempDirs.push(dir)
  return dir
}

describe('site spec workspace persistence', () => {
  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { force: true, recursive: true })
    }
  })

  it('round-trips a valid generated site spec through the workspace artifact file', () => {
    const workspace = createWorkspace()
    const project = {
      projectName: 'Portland Taproom',
      siteType: 'commerce',
      locale: 'en',
      pages: [{ route: '/', title: 'Fresh seasonal releases' }],
      modules: { home: 'root = PageSwitch({})' },
    }

    saveSiteSpec(workspace, project)

    expect(loadSiteSpec(workspace)).toEqual(project)
    expect(
      JSON.parse(readFileSync(join(workspace, 'site-spec.json'), 'utf-8')),
    ).toEqual(project)
  })

  it('fails closed for missing, malformed, or structurally invalid site-spec artifacts', () => {
    const missingWorkspace = createWorkspace()
    expect(loadSiteSpec(missingWorkspace)).toBeNull()

    const malformedWorkspace = createWorkspace()
    writeFileSync(join(malformedWorkspace, 'site-spec.json'), '{not-json')
    expect(loadSiteSpec(malformedWorkspace)).toBeNull()

    const invalidWorkspace = createWorkspace()
    writeFileSync(
      join(invalidWorkspace, 'site-spec.json'),
      JSON.stringify({ pages: [{ route: '/' }] }),
    )
    expect(loadSiteSpec(invalidWorkspace)).toBeNull()
  })
})
