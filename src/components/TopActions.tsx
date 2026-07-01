import { lazy, Suspense, useState } from 'react'
import { Show, SignInButton, UserButton } from '@clerk/tanstack-react-start'
import {
  GlassPillAnchor,
  GlassPillButton,
} from '@/features/home/components/HomePage'

const LazyHomepageAuthControls = lazy(() =>
  import('@/components/HomepageAuthControls').then((module) => ({
    default: module.HomepageAuthControls,
  })),
)

const clerkPublishableKey =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ??
  import.meta.env.CLERK_PUBLISHABLE_KEY
const isClerkConfigured =
  typeof clerkPublishableKey === 'string' &&
  clerkPublishableKey.trim().length > 0

export const TopActions = () => {
  const [authRequested, setAuthRequested] = useState(false)
  return (
    <nav className="top-actions" aria-label="Primary">
      <div className="top-actions-right">
        <GlassPillAnchor className="pill--top-actions" href="/pricing">
          Pricing
        </GlassPillAnchor>
        {isClerkConfigured ? (
          <>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <GlassPillButton
                  className="pill--top-actions"
                  onClick={() => setAuthRequested(true)}
                >
                  Sign in
                </GlassPillButton>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <div className="grid size-9 place-items-center">
                <UserButton />
              </div>
            </Show>
            <Suspense fallback={null}>
              <LazyHomepageAuthControls autoOpen={authRequested} />
            </Suspense>
          </>
        ) : (
          <GlassPillButton className="pill--top-actions">
            Sign in
          </GlassPillButton>
        )}
      </div>
    </nav>
  )
}
