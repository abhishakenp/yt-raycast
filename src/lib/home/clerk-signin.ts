type ClerkAuth = {
  user?: unknown
  session?: unknown
  client?: {
    sessions?: unknown[]
  }
  openSignIn?: () => unknown
  openSignUp?: () => unknown
  openUserProfile?: () => unknown
  signOut?: () => unknown
  addListener?: (listener: () => void) => unknown
}

type AuthWindow = {
  Clerk?: ClerkAuth
  addEventListener: (type: string, listener: EventListener) => void
  removeEventListener: (type: string, listener: EventListener) => void
}

type AuthElement = {
  addEventListener: (type: string, listener: EventListener) => void
  removeEventListener: (type: string, listener: EventListener) => void
  closest?: (selector: string) => AuthElement | null
  classList?: {
    add?: (className: string) => void
    remove?: (className: string) => void
  }
  style?: {
    display?: string
  }
  setAttribute?: (name: string, value: string) => void
  focus?: () => void
}

type AuthDocument = {
  getElementById: (id: string) => AuthElement | null
  addEventListener?: (type: string, listener: EventListener) => void
  removeEventListener?: (type: string, listener: EventListener) => void
}

type BindHomepageClerkSignInInput = {
  win: AuthWindow
  doc: AuthDocument
}

function showFallbackOverlay(doc: AuthDocument): void {
  const overlay = doc.getElementById('auth-overlay')
  overlay?.classList?.remove?.('hidden')
  overlay?.setAttribute?.('aria-hidden', 'false')
  doc.getElementById('google-signin-btn')?.focus?.()
}

const CLERK_SINGLE_SESSION_ERROR_CODE = 'cannot_render_single_session_enabled'

function hasActiveClerkSession(clerk: ClerkAuth | undefined): boolean {
  return Boolean(
    clerk?.user || clerk?.session || (clerk?.client?.sessions?.length ?? 0) > 0,
  )
}

function isClerkSingleSessionError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === CLERK_SINGLE_SESSION_ERROR_CODE
  )
}

function setElementDisplay(element: AuthElement | null, display: string): void {
  if (element?.style) {
    element.style.display = display
  }
}

export function bindHomepageClerkSignIn({
  win,
  doc,
}: BindHomepageClerkSignInInput): () => void {
  const signInButton = doc.getElementById('signin-btn')
  const signOutButton = doc.getElementById('signout-btn')
  const syncSignedInControls = () => {
    setElementDisplay(signInButton, 'none')
    setElementDisplay(signOutButton, 'inline-flex')
  }
  const syncSignedOutControls = () => {
    setElementDisplay(signInButton, 'inline-flex')
    setElementDisplay(signOutButton, 'none')
  }
  const syncAuthControls = () => {
    if (hasActiveClerkSession(win.Clerk)) {
      syncSignedInControls()
      return
    }

    syncSignedOutControls()
  }
  const openUserProfile = () => {
    if (typeof win.Clerk?.openUserProfile === 'function') {
      void win.Clerk.openUserProfile()
    }
  }
  const handleAlreadySignedIn = () => {
    syncSignedInControls()
    openUserProfile()
  }
  const openSignIn = (event?: Event) => {
    event?.preventDefault()

    if (hasActiveClerkSession(win.Clerk)) {
      handleAlreadySignedIn()
      return
    }

    if (typeof win.Clerk?.openSignIn === 'function') {
      try {
        void win.Clerk.openSignIn()
      } catch (error) {
        if (isClerkSingleSessionError(error)) {
          handleAlreadySignedIn()
          return
        }

        throw error
      }
      return
    }

    showFallbackOverlay(doc)
  }
  const openSignUp = (event?: Event) => {
    event?.preventDefault()

    if (hasActiveClerkSession(win.Clerk)) {
      handleAlreadySignedIn()
      return
    }

    if (typeof win.Clerk?.openSignUp === 'function') {
      try {
        void win.Clerk.openSignUp()
      } catch (error) {
        if (isClerkSingleSessionError(error)) {
          handleAlreadySignedIn()
          return
        }

        throw error
      }
      return
    }

    openSignIn()
  }
  const signOut = (event?: Event) => {
    event?.preventDefault()

    const result = win.Clerk?.signOut?.()
    if (result && typeof (result as Promise<unknown>).finally === 'function') {
      void (result as Promise<unknown>).finally(syncAuthControls)
      return
    }

    syncAuthControls()
  }
  const signInTargets = [
    'signin-btn',
    'google-signin-btn',
    'github-signin-btn',
    'email-signin-btn',
  ]
    .map((id) => doc.getElementById(id))
    .filter((element): element is AuthElement => element !== null)
  const signUpTargets = [doc.getElementById('email-signup-btn')].filter(
    (element): element is AuthElement => element !== null,
  )
  const signOutTargets = [signOutButton].filter(
    (element): element is AuthElement => element !== null,
  )

  const handleDocumentClick = (event: Event) => {
    const target = event.target as AuthElement | null
    if (
      target?.closest?.(
        '#signin-btn, #google-signin-btn, #github-signin-btn, #email-signin-btn',
      )
    ) {
      openSignIn(event)
      return
    }
    if (target?.closest?.('#email-signup-btn')) {
      openSignUp(event)
      return
    }
    if (target?.closest?.('#signout-btn')) {
      signOut(event)
    }
  }
  const hasDocumentDelegation = typeof doc.addEventListener === 'function'
  const clerkListenerResult = win.Clerk?.addListener?.(syncAuthControls)

  syncAuthControls()
  win.addEventListener('sf-request-auth-overlay', openSignIn)
  doc.addEventListener?.('click', handleDocumentClick)
  if (!hasDocumentDelegation) {
    signInTargets.forEach((target) =>
      target.addEventListener('click', openSignIn),
    )
    signUpTargets.forEach((target) =>
      target.addEventListener('click', openSignUp),
    )
    signOutTargets.forEach((target) =>
      target.addEventListener('click', signOut),
    )
  }

  return () => {
    if (typeof clerkListenerResult === 'function') {
      clerkListenerResult()
    }
    win.removeEventListener('sf-request-auth-overlay', openSignIn)
    doc.removeEventListener?.('click', handleDocumentClick)
    if (!hasDocumentDelegation) {
      signInTargets.forEach((target) =>
        target.removeEventListener('click', openSignIn),
      )
      signUpTargets.forEach((target) =>
        target.removeEventListener('click', openSignUp),
      )
      signOutTargets.forEach((target) =>
        target.removeEventListener('click', signOut),
      )
    }
  }
}
