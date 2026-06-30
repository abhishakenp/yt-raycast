import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const registryRoot = join(
  process.cwd(),
  'packages/ship-fast-blocks/src/registry/sections',
)

const copyrightOnlyBrandFiles = new Set([
  'contact/ContactFooter.tsx',
  'film-director/FilmDirectorFooter.tsx',
])

const collectBrandShellFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return collectBrandShellFiles(path)
    return /(Navbar|Footer|Sidebar)\.tsx$/.test(entry.name) ? [path] : []
  })

const relativeRegistryPath = (path: string) =>
  path.slice(registryRoot.length + 1)

describe('registry brand logo coverage', () => {
  it('routes visible capsule brand surfaces through Logo', () => {
    const offenders = collectBrandShellFiles(registryRoot)
      .map((file) => ({
        file,
        relativePath: relativeRegistryPath(file),
        source: readFileSync(file, 'utf8'),
      }))
      .filter(({ source }) =>
        /(\bbrand\b|brandMark|brandInitial|props\.brand|\{brand\})/.test(
          source,
        ),
      )
      .filter(
        ({ source }) =>
          !/(<BrandLogo\b|<Logo\b|<SiteNav\b|<SiteFooter\b)/.test(source),
      )
      .filter(({ relativePath }) => !copyrightOnlyBrandFiles.has(relativePath))
      .map(({ relativePath }) => relativePath)

    expect(offenders).toEqual([])
  })

  it('keeps the logo-skip allowlist limited to copyright-only footers', () => {
    for (const relativePath of copyrightOnlyBrandFiles) {
      const source = readFileSync(join(registryRoot, relativePath), 'utf8')

      expect(source).toMatch(/copyright|©/i)
      expect(source).not.toMatch(/<button[\s\S]*\{brand\}/)
      expect(source).not.toMatch(/<a[\s\S]*\{brand\}/)
    }
  })
})
