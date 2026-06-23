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

  it('mounts exactly one provider shell so the not-found route never nests a second <ClerkProvider>', () => {
    const rootSource = readProjectFile('src/routes/__root.tsx')

    const countOf = (needle: string): number =>
      rootSource.split(needle).length - 1

    // RootComponent supplies the single document + Clerk shell. The
    // notFoundComponent renders inside RootComponent's Outlet, so it must NOT
    // re-wrap RootDocument/RootClerkProvider — doing so mounts a second html
    // element and a second Clerk provider, which Clerk rejects with
    // "You've added multiple ClerkProvider components". RootClerkProvider is
    // the only element that renders a real ClerkProvider, so gating its JSX
    // tag count to one guarantees a single provider mount app-wide.
    expect(countOf('<RootClerkProvider>')).toBe(1)
    expect(countOf('<RootDocument>')).toBe(1)

    const notFoundBody = rootSource.slice(
      rootSource.indexOf('const NotFoundComponent'),
      rootSource.indexOf('export const Route'),
    )
    expect(notFoundBody).not.toContain('<RootClerkProvider')
    expect(notFoundBody).not.toContain('<RootDocument')
  })
})
