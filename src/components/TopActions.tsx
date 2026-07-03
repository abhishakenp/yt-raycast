import { lazy, Suspense, useState } from 'react'
import { Show, SignInButton, UserButton } from '@clerk/tanstack-react-start'
import {
  GlassPillAnchor,
  GlassPillButton,
} from '@/features/home/components/HomePage'
import { isClerkClientEnabled } from '@/shared/auth/clerk-runtime'

const LazyHomepageAuthControls = lazy(() =>
  import('@/components/HomepageAuthControls').then((module) => ({
    default: module.HomepageAuthControls,
  })),
)

const isClerkConfigured = isClerkClientEnabled()

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
              <LazyHomepageAuthControls
                autoOpen={authRequested}
                wrapProvider={false}
              />
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
