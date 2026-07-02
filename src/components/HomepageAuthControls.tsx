import { ClerkProvider } from '@clerk/tanstack-react-start'
import { useEffect, useRef, useState } from 'react'

import { clerkFrostedGlassAppearance } from '@/app/providers/clerk-appearance'
import { getClerkPublishableKey } from '@/shared/auth/clerk-runtime'

const clerkPublishableKey = getClerkPublishableKey()

type HomepageAuthControlsProps = {
  autoOpen?: boolean
  renderButton?: boolean
  wrapProvider?: boolean
}

type ClerkWindow = Window & {
  Clerk?: {
    openSignIn?: () => unknown
    user?: unknown
    mountUserButton?: (element: HTMLElement) => unknown
    unmountUserButton?: (element: HTMLElement) => unknown
  }
}

const appContentElementId = 'ship-fast-app-content'
const clerkDialogSelector = '.cl-modalContent[role="dialog"]'

const signInButtonClassName =
  'pill pill--top-actions relative isolate inline-flex min-h-9 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.055] px-4 py-0 font-sans text-[13px] font-medium tracking-[-0.015em] text-[#f0f0f5] shadow-[0_14px_32px_rgba(0,0,0,0.38)] transition-transform duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.25)] [-webkit-tap-highlight-color:transparent] active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white'

const syncAuthModalBackgroundState = () => {
  if (typeof document === 'undefined') return

  const appContent = document.getElementById(appContentElementId)
  if (appContent === null) return

  const modalOpen = document.querySelector(clerkDialogSelector) !== null
  if (modalOpen) {
    appContent.setAttribute('aria-hidden', 'true')
    appContent.setAttribute('inert', '')
  } else {
    appContent.removeAttribute('aria-hidden')
    appContent.removeAttribute('inert')
  }
}

const HomepageAuthInner = ({
  autoOpen = false,
  renderButton = true,
}: HomepageAuthControlsProps) => {
  const [isSignedIn, setIsSignedIn] = useState(false)
  const hasAutoOpenedRef = useRef(false)
  const userButtonRef = useRef<HTMLDivElement | null>(null)

  const openSignIn = (): boolean => {
    if (typeof window === 'undefined') return false
    const clerk = (window as ClerkWindow).Clerk
    if (typeof clerk?.openSignIn !== 'function') return false

    try {
      void clerk.openSignIn()
      return true
    } catch {
      return false
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return

    let cancelled = false
    let attempts = 0
    let mountedUserButton = false
    let mountedUserButtonElement: HTMLElement | null = null

    const openWhenReady = () => {
      if (cancelled) return
      const clerk = (window as ClerkWindow).Clerk

      if (clerk?.user) {
        setIsSignedIn(true)
        if (!renderButton) return
        if (
          userButtonRef.current &&
          !mountedUserButton &&
          typeof clerk.mountUserButton === 'function'
        ) {
          try {
            mountedUserButtonElement = userButtonRef.current
            void clerk.mountUserButton(mountedUserButtonElement)
            mountedUserButton = true
            return
          } catch {
            window.setTimeout(openWhenReady, 50)
            return
          }
        }
        window.setTimeout(openWhenReady, 0)
        return
      }

      if (autoOpen && !hasAutoOpenedRef.current && openSignIn()) {
        hasAutoOpenedRef.current = true
        return
      }

      attempts += 1
      if (attempts < 40) window.setTimeout(openWhenReady, 50)
    }

    openWhenReady()

    return () => {
      cancelled = true
      const clerk = (window as ClerkWindow).Clerk
      if (
        mountedUserButtonElement &&
        typeof clerk?.unmountUserButton === 'function'
      ) {
        void clerk.unmountUserButton(mountedUserButtonElement)
      }
    }
  }, [autoOpen, renderButton])

  useEffect(() => {
    if (typeof window === 'undefined') return

    syncAuthModalBackgroundState()
    const observer = new MutationObserver(syncAuthModalBackgroundState)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      const appContent = document.getElementById(appContentElementId)
      appContent?.removeAttribute('aria-hidden')
      appContent?.removeAttribute('inert')
    }
  }, [])

  if (!renderButton) return null

  return isSignedIn ? (
    <div ref={userButtonRef} className="grid size-9 place-items-center" />
  ) : (
    <button
      className={signInButtonClassName}
      type="button"
      onClick={openSignIn}
    >
      <span className="relative z-[7] inline-flex items-center justify-center gap-1.5">
        Sign in
      </span>
    </button>
  )
}

export const HomepageAuthControls = ({
  autoOpen = false,
  renderButton = true,
  wrapProvider = true,
}: HomepageAuthControlsProps) => {
  if (
    typeof clerkPublishableKey !== 'string' ||
    clerkPublishableKey.trim().length === 0
  ) {
    return null
  }

  const controls = (
    <HomepageAuthInner autoOpen={autoOpen} renderButton={renderButton} />
  )

  return wrapProvider ? (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      afterSignOutUrl="/"
      appearance={clerkFrostedGlassAppearance}
    >
      {controls}
    </ClerkProvider>
  ) : (
    controls
  )
}
