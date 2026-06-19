import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const readProjectFile = (path: string): string =>
  readFileSync(join(process.cwd(), path), 'utf8')

describe('app provider loading', () => {
  it('hydrates Clerk at the root while keeping Convex auth mode route-gated', () => {
    const rootSource = readProjectFile('src/routes/__root.tsx')
    const appProvidersSource = readProjectFile(
      'src/app/providers/AppProviders.tsx',
    )
    const clerkConvexProviderSource = readProjectFile(
      'src/app/providers/ClerkConvexProvider.tsx',
    )
    const providerConfigSource = readProjectFile(
      'src/app/providers/provider-config.ts',
    )

    expect(rootSource).toContain('@clerk/tanstack-react-start')
    expect(rootSource).toContain('<ClerkProvider')
    expect(rootSource).toContain('<RootClerkProvider>')
    expect(appProvidersSource).not.toContain('@clerk/tanstack-react-start')
    expect(providerConfigSource).not.toContain('@clerk/')
    expect(appProvidersSource).toContain(
      "import('@/app/providers/ClerkConvexProvider')",
    )
    expect(appProvidersSource).toContain(
      'shouldUseAuthenticatedProviders(pathname)',
    )
    expect(clerkConvexProviderSource).not.toContain('<ClerkProvider')
    expect(clerkConvexProviderSource).toContain('<ConvexProviderWithClerk')
  })
})
