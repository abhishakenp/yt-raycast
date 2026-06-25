import { lazy, Suspense } from 'react'

const LazyHomepageAuthControls = lazy(() =>
  import('@/components/HomepageAuthControls').then((module) => ({
    default: module.HomepageAuthControls,
  })),
)

export const SignInModalHost = ({ requestId }: { requestId: number }) =>
  requestId > 0 ? (
    <Suspense fallback={null}>
      <LazyHomepageAuthControls key={requestId} autoOpen renderButton={false} />
    </Suspense>
  ) : null
