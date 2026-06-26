import { readdirSync } from 'node:fs'
import { join, relative } from 'node:path'

import { describe, expect, it } from 'vitest'

const routeRoot = join(process.cwd(), 'src/routes')

const collectRouteTests = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return collectRouteTests(path)
    if (!/\.(?:test|spec)\.tsx?$/.test(entry.name)) return []
    return [relative(routeRoot, path)]
  })

describe('route test files', () => {
  it('uses the TanStack Router ignore prefix for tests under src/routes', () => {
    const unignoredTests = collectRouteTests(routeRoot).filter(
      (path) => !path.split('/').at(-1)?.startsWith('-'),
    )

    expect(unignoredTests).toEqual([])
  })
})
