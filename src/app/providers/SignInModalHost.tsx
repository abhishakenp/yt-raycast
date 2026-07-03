import { lazy, Suspense } from 'react'

const LazyHomepageAuthControls = lazy(() =>
  import('@/components/HomepageAuthControls').then((module) => ({
    default: module.HomepageAuthControls,
  })),
)

type SignInModalHostProps = {
  requestId: number
  // When true, a <ClerkProvider> is already mounted above this host (the
  // authenticated ClerkConvexProvider branch). HomepageAuthControls must not
  // wrap again or Clerk throws "multiple <ClerkProvider>". When false, no
  // provider is mounted above (anonymous/public branches) so HomepageAuthControls
  // owns the ClerkProvider mount.
  clerkMounted?: boolean
}

export const SignInModalHost = ({
  requestId,
  clerkMounted = false,
}: SignInModalHostProps) =>
  requestId > 0 ? (
    <Suspense fallback={null}>
      <LazyHomepageAuthControls
        key={requestId}
        autoOpen
        renderButton={false}
        wrapProvider={!clerkMounted}
      />
    </Suspense>
  ) : null
