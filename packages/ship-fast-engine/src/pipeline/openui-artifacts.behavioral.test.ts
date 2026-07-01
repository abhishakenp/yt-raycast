import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  buildOpenUIManifest,
  openUIArtifactsReady,
  readOpenUIFileForRoute,
  readOpenUIManifest,
  routeToOpenUIFile,
  upsertOpenUIManifestEntry,
  writeOpenUIManifest,
} from './openui-artifacts.js'
import {
  HOME_OPENUI_FILE,
  OPENUI_MANIFEST_FILE,
  OPENUI_PAGES_DIR,
} from './openui-constants.js'

const siteSpec = {
  pages: [
    { route: '/', title: 'Home' },
    { route: '/menu', title: 'Taproom Menu' },
    { name: 'Private Events' },
  ],
}

const makeWorkspace = () => mkdtempSync(join(tmpdir(), 'ship-fast-openui-'))

describe('OpenUI artifact manifest behavior', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('maps arbitrary routes to stable workspace-relative OpenUI artifact files', () => {
    expect(routeToOpenUIFile('/')).toBe(HOME_OPENUI_FILE)
    expect(routeToOpenUIFile('/Menu & Events/Seasonal Releases/')).toBe(
      join(OPENUI_PAGES_DIR, 'menu-events__seasonal-releases.openui'),
    )
    expect(routeToOpenUIFile('///')).toBe(HOME_OPENUI_FILE)
  })

  it('serializes manifest pages from the site spec and keeps generated file readiness per route', () => {
    vi.setSystemTime(new Date('2026-07-01T12:00:00.000Z'))

    const manifest = buildOpenUIManifest(siteSpec, [
      {
        route: '/',
        file: HOME_OPENUI_FILE,
        ready: true,
      },
      {
        route: '/menu',
        file: join(OPENUI_PAGES_DIR, 'menu.openui'),
        ready: true,
      },
    ])

    expect(manifest).toEqual({
      version: 1,
      generatedAt: '2026-07-01T12:00:00.000Z',
      home: HOME_OPENUI_FILE,
      pages: [
        {
          route: '/',
          title: 'Home',
          file: HOME_OPENUI_FILE,
          ready: true,
        },
        {
          route: '/menu',
          title: 'Taproom Menu',
          file: join(OPENUI_PAGES_DIR, 'menu.openui'),
          ready: true,
        },
        {
          route: '/private-events',
          title: 'Private Events',
          file: join(OPENUI_PAGES_DIR, 'private-events.openui'),
          ready: false,
        },
      ],
    })
  })

  it('reads the persisted OpenUI source for a route through the manifest mapping', () => {
    const workspace = makeWorkspace()
    mkdirSync(join(workspace, OPENUI_PAGES_DIR), { recursive: true })
    writeFileSync(join(workspace, HOME_OPENUI_FILE), '$page = "Home"')
    writeFileSync(
      join(workspace, OPENUI_PAGES_DIR, 'menu.openui'),
      '$page = "Menu"',
    )

    writeOpenUIManifest(
      workspace,
      buildOpenUIManifest(siteSpec, [
        { route: '/', file: HOME_OPENUI_FILE, ready: true },
        {
          route: '/menu',
          file: join(OPENUI_PAGES_DIR, 'menu.openui'),
          ready: true,
        },
      ]),
    )

    expect(readOpenUIManifest(workspace)?.pages).toHaveLength(3)
    expect(readOpenUIFileForRoute(workspace, '/menu')).toBe('$page = "Menu"')
    expect(readOpenUIFileForRoute(workspace, '/private-events')).toBeNull()
  })

  it('updates one manifest route without losing the other route contracts from the site spec', () => {
    const workspace = makeWorkspace()

    const initial = upsertOpenUIManifestEntry(workspace, siteSpec, {
      route: '/',
      title: 'Home',
      file: HOME_OPENUI_FILE,
      ready: true,
    })
    expect(
      initial.pages.find(
        (page: { route: string; ready?: boolean }) => page.route === '/',
      )?.ready,
    ).toBe(true)
    expect(
      initial.pages.find(
        (page: { route: string; ready?: boolean }) => page.route === '/menu',
      )?.ready,
    ).toBe(false)

    const next = upsertOpenUIManifestEntry(workspace, siteSpec, {
      route: '/menu',
      title: 'Taproom Menu',
      file: join(OPENUI_PAGES_DIR, 'menu.openui'),
      ready: true,
    })

    expect(
      next.pages.find(
        (page: { route: string; ready?: boolean }) => page.route === '/',
      )?.ready,
    ).toBe(true)
    expect(
      next.pages.find(
        (page: { route: string; ready?: boolean }) => page.route === '/menu',
      )?.ready,
    ).toBe(true)
    expect(
      next.pages.find(
        (page: { route: string; ready?: boolean }) =>
          page.route === '/private-events',
      ),
    ).toEqual({
      route: '/private-events',
      title: 'Private Events',
      file: join(OPENUI_PAGES_DIR, 'private-events.openui'),
      ready: false,
    })
  })

  it('treats malformed persisted manifest pages as not ready instead of crashing artifact handoff', () => {
    const workspace = makeWorkspace()
    writeFileSync(join(workspace, HOME_OPENUI_FILE), '$page = "Home"')
    writeFileSync(
      join(workspace, OPENUI_MANIFEST_FILE),
      JSON.stringify({
        version: 1,
        home: HOME_OPENUI_FILE,
        pages: { route: '/', file: HOME_OPENUI_FILE, ready: true },
      }),
    )

    expect(() => openUIArtifactsReady(workspace, siteSpec)).not.toThrow()
    expect(openUIArtifactsReady(workspace, siteSpec)).toBe(false)
  })
})
