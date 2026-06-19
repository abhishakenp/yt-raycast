import { Show, SignInButton, UserButton } from '@clerk/tanstack-react-start'
import { useEffect } from 'react'

type HomepageAuthControlsProps = {
  autoOpen?: boolean
}

type ClerkWindow = Window & {
  Clerk?: {
    openSignIn?: () => unknown
  }
}

const signInButtonClassName =
  'pill pill--top-actions relative isolate inline-flex min-h-9 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.055] px-4 py-0 font-sans text-[13px] font-medium tracking-[-0.015em] text-[#f0f0f5] shadow-[0_14px_32px_rgba(0,0,0,0.38)] transition-transform duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.25)] [-webkit-tap-highlight-color:transparent] active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white'

const HomepageAuthInner = ({ autoOpen = false }: HomepageAuthControlsProps) => {
  useEffect(() => {
    if (!autoOpen || typeof window === 'undefined') return

    let cancelled = false
    let attempts = 0

    const openWhenReady = () => {
      if (cancelled) return
      const clerk = (window as ClerkWindow).Clerk
      if (typeof clerk?.openSignIn === 'function') {
        void clerk.openSignIn()
        return
      }
      attempts += 1
      if (attempts < 40) window.setTimeout(openWhenReady, 50)
    }

    openWhenReady()

    return () => {
      cancelled = true
    }
  }, [autoOpen])

  return (
    <>
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button className={signInButtonClassName} type="button">
            <span className="relative z-[7] inline-flex items-center justify-center gap-1.5">
              Sign in
            </span>
          </button>
        </SignInButton>
      </Show>
      <Show when="signed-in">
        <div className="grid size-9 place-items-center">
          <UserButton />
        </div>
      </Show>
    </>
  )
}

export const HomepageAuthControls = ({
  autoOpen = false,
}: HomepageAuthControlsProps) => <HomepageAuthInner autoOpen={autoOpen} />
