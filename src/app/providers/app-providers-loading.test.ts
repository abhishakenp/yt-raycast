import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const readProjectFile = (path: string): string =>
  readFileSync(join(process.cwd(), path), 'utf8')

describe('app provider loading', () => {
  it('does not statically load Clerk from the root or anonymous app provider', () => {
    const rootSource = readProjectFile('src/routes/__root.tsx')
    const appProvidersSource = readProjectFile('src/app/providers/AppProviders.tsx')
    const providerConfigSource = readProjectFile('src/app/providers/provider-config.ts')

    expect(rootSource).not.toContain('@clerk/tanstack-react-start')
    expect(appProvidersSource).not.toContain('@clerk/tanstack-react-start')
    expect(providerConfigSource).not.toContain('@clerk/')
    expect(appProvidersSource).toContain("import('@/app/providers/ClerkConvexProvider')")
    expect(appProvidersSource).toContain('shouldUseAuthenticatedProviders(pathname)')
  })
})
