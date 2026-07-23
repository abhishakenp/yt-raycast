import { ClerkProvider } from '@clerk/tanstack-react-start'
import { useEffect, useRef, useState } from 'react'

import { clerkFrostedGlassAppearance } from '@/app/providers/clerk-appearance'
import { billingStatusChangedEventName } from '@/features/billing/billing-events'
import { GlassPillButton } from '@/features/home/components/GlassPill'
import { getClerkPublishableKey } from '@/shared/auth/clerk-runtime'
import { useOptionalAuth } from '@/shared/auth/use-optional-auth'

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
  const { getToken } = useOptionalAuth()
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [hasPro, setHasPro] = useState(false)
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

    let cancelled = false
    const syncProStatus = async () => {
      if (!isSignedIn) {
        setHasPro(false)
        return
      }

      try {
        const token = await getToken({ template: 'convex' })
        if (!token) {
          if (!cancelled) setHasPro(false)
          return
        }

        const response = await fetch('/api/billing-overview', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = (await response.json().catch(() => ({}))) as {
          subscription?: { active?: boolean } | null
        }
        if (!cancelled)
          setHasPro(Boolean(response.ok && data.subscription?.active))
      } catch {
        if (!cancelled) setHasPro(false)
      }
    }

    void syncProStatus()
    window.addEventListener(billingStatusChangedEventName, syncProStatus)

    return () => {
      cancelled = true
      window.removeEventListener(billingStatusChangedEventName, syncProStatus)
    }
  }, [getToken, isSignedIn])

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
    <div className="relative grid size-9 place-items-center">
      <div ref={userButtonRef} className="grid size-9 place-items-center" />
      {hasPro ? (
        <span
          aria-label="Pro plan active"
          className="pointer-events-none absolute -bottom-1 -right-2 z-10 rounded-full border border-cyan-950/20 bg-cyan-300 px-1.5 py-0.5 text-[9px] font-black leading-none tracking-[0.08em] text-slate-950 shadow-[0_8px_18px_rgba(103,232,249,0.28)]"
        >
          PRO
        </span>
      ) : null}
    </div>
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
