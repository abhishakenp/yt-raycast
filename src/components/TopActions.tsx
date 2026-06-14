import { Show, SignInButton, UserButton } from '@clerk/tanstack-react-start'
import { GlassPillAnchor, GlassPillButton } from '@/features/home/components/HomePage'

const clerkPublishableKey =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? import.meta.env.CLERK_PUBLISHABLE_KEY
const isClerkConfigured = typeof clerkPublishableKey === 'string' && clerkPublishableKey.trim().length > 0

export const TopActions = () => (
  <nav className="top-actions" aria-label="Primary">
    <div className="top-actions-right">
      <GlassPillAnchor className="pill--top-actions" href="/pricing">
        Pricing
      </GlassPillAnchor>
      {isClerkConfigured ? (
        <>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <GlassPillButton className="pill--top-actions">Sign in</GlassPillButton>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <div className="grid size-9 place-items-center">
              <UserButton afterSignOutUrl="/" />
            </div>
          </Show>
        </>
      ) : (
        <GlassPillButton className="pill--top-actions">Sign in</GlassPillButton>
      )}
    </div>
  </nav>
)
