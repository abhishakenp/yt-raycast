import { lazy, Suspense, useState } from 'react'
import {
  GlassPillAnchor,
  GlassPillButton,
} from '@/features/home/components/GlassPill'

const clerkPublishableKey =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ??
  import.meta.env.CLERK_PUBLISHABLE_KEY
const isClerkConfigured =
  typeof clerkPublishableKey === 'string' &&
  clerkPublishableKey.trim().length > 0

const LazyHomepageAuthControls = lazy(() =>
  import('@/components/HomepageAuthControls').then((module) => ({
    default: module.HomepageAuthControls,
  })),
)

export const TopActions = () => {
  const [authRequested, setAuthRequested] = useState(false)

  return (
    <nav className="top-actions" aria-label="Primary">
      <div className="top-actions-right">
        <GlassPillAnchor className="pill--top-actions" href="/pricing">
          Pricing
        </GlassPillAnchor>
        {isClerkConfigured ? (
          authRequested ? (
            <Suspense
              fallback={
                <GlassPillButton className="pill--top-actions" disabled>
                  Sign in
                </GlassPillButton>
              }
            >
              <LazyHomepageAuthControls autoOpen />
            </Suspense>
          ) : (
            <GlassPillButton
              className="pill--top-actions"
              onClick={() => setAuthRequested(true)}
            >
              Sign in
            </GlassPillButton>
          )
        ) : (
          <GlassPillButton className="pill--top-actions">
            Sign in
          </GlassPillButton>
        )}
      </div>
    </nav>
  )
}
