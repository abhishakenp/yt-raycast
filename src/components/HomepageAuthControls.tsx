import { ClerkProvider } from '@clerk/tanstack-react-start'
import { useEffect, useRef, useState } from 'react'

import { clerkFrostedGlassAppearance } from '@/app/providers/clerk-appearance'
import { GlassPillButton } from '@/features/home/components/GlassPill'
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

function HomepageAuthInner({
  autoOpen = false,
  renderButton = true,
}: HomepageAuthControlsProps) {
  const [isSignedIn, setIsSignedIn] = useState(false)
  const hasAutoOpenedRef = useRef(false)
  const userButtonRef = useRef<HTMLDivElement | null>(null)

  const openSignIn = () => {
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
    <GlassPillButton
      className="pill--top-actions min-h-9 px-4 py-0 font-sans text-[13px] font-medium text-[#f0f0f5] [&>span:last-child]:gap-1.5"
      onClick={openSignIn}
    >
      Sign in
    </GlassPillButton>
  )
}

export function HomepageAuthControls({
  autoOpen = false,
  renderButton = true,
  wrapProvider = true,
}: HomepageAuthControlsProps) {
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
