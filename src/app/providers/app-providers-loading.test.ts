import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const readProjectFile = (path: string): string =>
  readFileSync(join(process.cwd(), path), 'utf8')

describe('app provider loading', () => {
  it('keeps Clerk out of the root and loads it only through route-gated auth providers', () => {
    const rootSource = readProjectFile('src/routes/__root.tsx')
    const appProvidersSource = readProjectFile(
      'src/app/providers/AppProviders.tsx',
    )
    const clerkConvexProviderSource = readProjectFile(
      'src/app/providers/ClerkConvexProvider.tsx',
    )
    const convexAnonymousProviderSource = readProjectFile(
      'src/app/providers/ConvexAnonymousProvider.tsx',
    )
    const providerConfigSource = readProjectFile(
      'src/app/providers/provider-config.ts',
    )
    const signInModalHostSource = readProjectFile(
      'src/app/providers/SignInModalHost.tsx',
    )
    const optionalAuthSource = readProjectFile(
      'src/shared/auth/use-optional-auth.ts',
    )
    const homepageAuthControlsSource = readProjectFile(
      'src/components/HomepageAuthControls.tsx',
    )

    expect(rootSource).not.toContain('@clerk/tanstack-react-start')
    expect(rootSource).not.toContain('<ClerkProvider')
    expect(rootSource).not.toContain('<RootClerkProvider>')
    const notFoundSource = rootSource.slice(
      rootSource.indexOf('const NotFoundComponent'),
      rootSource.indexOf('export const Route'),
    )
    expect(notFoundSource).toContain('<Link')
    expect(notFoundSource).toContain('to="/"')
    expect(notFoundSource).not.toContain('href="/"')
    expect(appProvidersSource).not.toContain('@clerk/tanstack-react-start')
    expect(appProvidersSource).not.toContain("from 'convex/react'")
    expect(appProvidersSource).not.toContain('new ConvexReactClient')
    expect(signInModalHostSource).not.toContain('@clerk/')
    expect(optionalAuthSource).not.toContain('@clerk/')
    expect(providerConfigSource).not.toContain('@clerk/')
    expect(appProvidersSource).not.toContain(
      "import { SignInModalHost } from '@/app/providers/SignInModalHost'",
    )
    expect(appProvidersSource).toContain(
      "import('@/app/providers/SignInModalHost')",
    )
    expect(appProvidersSource).toContain('signInRequestId > 0')
    expect(appProvidersSource).toContain(
      '<LazySignInModalHost requestId={signInRequestId} />',
    )
    expect(appProvidersSource).toContain('id="ship-fast-app-content"')
    expect(appProvidersSource).toContain('className="contents"')
    expect(homepageAuthControlsSource).toContain(
      "const appContentElementId = 'ship-fast-app-content'",
    )
    expect(homepageAuthControlsSource).toContain(
      'const clerkDialogSelector = \'.cl-modalContent[role="dialog"]\'',
    )
    expect(homepageAuthControlsSource).toContain(
      "appContent.setAttribute('aria-hidden', 'true')",
    )
    expect(homepageAuthControlsSource).toContain(
      "appContent.setAttribute('inert', '')",
    )
    expect(homepageAuthControlsSource).toContain(
      'new MutationObserver(syncAuthModalBackgroundState)',
    )
    expect(appProvidersSource).toContain(
      "import('@/app/providers/ClerkConvexProvider')",
    )
    expect(appProvidersSource).toContain(
      "import('@/app/providers/ConvexAnonymousProvider')",
    )
    expect(appProvidersSource).toContain(
      "import('@/components/launch-backdrop')",
    )
    expect(appProvidersSource).toContain('PUBLIC_LAUNCH_BACKDROP_PATHS')
    expect(appProvidersSource).toContain("'/pricing'")
    expect(appProvidersSource).toContain("'/privacy'")
    expect(appProvidersSource).toContain("'/terms'")
    expect(appProvidersSource).toContain(
      'showLaunchBackdrop={showLaunchBackdrop}',
    )
    expect(appProvidersSource).toContain(
      'clerkPublishableKey={clerkPublishableKey}',
    )
    expect(appProvidersSource).toContain('convexUrl={configuredConvexUrl}')
    expect(appProvidersSource).toContain(
      'shouldUseAuthenticatedProviders(pathname)',
    )
    expect(appProvidersSource).toContain('shouldUseConvexProviders(pathname)')
    expect(clerkConvexProviderSource).toContain('@clerk/tanstack-react-start')
    expect(clerkConvexProviderSource).toContain("from 'convex/react'")
    expect(clerkConvexProviderSource).toContain('new ConvexReactClient')
    expect(clerkConvexProviderSource).toContain('{ logger: false }')
    expect(clerkConvexProviderSource).toContain('<ClerkProvider')
    expect(clerkConvexProviderSource).toContain('<ConvexProviderWithClerk')
    expect(convexAnonymousProviderSource).toContain("from 'convex/react'")
    expect(convexAnonymousProviderSource).toContain('new ConvexReactClient')
    expect(convexAnonymousProviderSource).toContain('{ logger: false }')
    expect(convexAnonymousProviderSource).toContain('<ConvexProvider')
  })
})
