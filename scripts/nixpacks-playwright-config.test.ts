import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

const readNixpacksConfig = async (): Promise<string> =>
  await readFile(new URL('../nixpacks.toml', import.meta.url), 'utf8')

const getSection = (config: string, sectionName: string): string => {
  const sectionStart = config.indexOf(`[${sectionName}]`)
  expect(sectionStart).toBeGreaterThanOrEqual(0)

  const nextSectionStart = config.indexOf('\n[', sectionStart + 1)
  return config.slice(
    sectionStart,
    nextSectionStart === -1 ? undefined : nextSectionStart,
  )
}

describe('nixpacks Playwright deployment config', () => {
  it('installs Chromium and Linux browser dependencies during deploy builds', async () => {
    const config = await readNixpacksConfig()
    const installSection = getSection(config, 'phases.install')

    expect(installSection).toContain('bun install --no-save')
    expect(installSection).toContain(
      'bunx playwright install --with-deps chromium',
    )
    // Guard against the intermittent buildx apt-cache corruption that broke
    // deploys: stale InRelease files in /var/lib/apt/lists make Playwright's
    // internal apt-get update fail with "invalid signature". The install phase
    // must clear them first.
    expect(installSection).toContain('rm -rf /var/lib/apt/lists/*')
  })

  it('keeps the Playwright browser binary in the deploy artifact', async () => {
    const config = await readNixpacksConfig()
    const variablesSection = getSection(config, 'variables')

    expect(variablesSection).toContain('PLAYWRIGHT_BROWSERS_PATH = "0"')
  })
})
