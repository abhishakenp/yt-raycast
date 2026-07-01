import { describe, expect, test } from 'vitest'

import { bindHomepageClerkSignIn } from './clerk-signin'

class FakeElement {
  private readonly listeners = new Map<string, EventListener[]>()
  readonly attributes = new Map<string, string>()
  focusCount = 0
  readonly style = {
    display: '',
  }
  readonly classList = {
    add: () => undefined,
    remove: (className: string) => {
      this.attributes.set(`class-removed:${className}`, 'true')
    },
  }

  addEventListener = (type: string, listener: EventListener): void => {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener])
  }

  removeEventListener = (type: string, listener: EventListener): void => {
    this.listeners.set(
      type,
      (this.listeners.get(type) ?? []).filter((entry) => entry !== listener),
    )
  }

  setAttribute = (name: string, value: string) => {
    this.attributes.set(name, value)
  }

  focus = () => {
    this.focusCount += 1
  }

  click = (): void => {
    for (const listener of this.listeners.get('click') ?? []) {
      listener(new Event('click'))
    }
  }
}

describe('bindHomepageClerkSignIn', () => {
  test('opens the Clerk sign-in modal from the homepage sign-in button', () => {
    let openCount = 0
    const signInButton = new FakeElement()
    const cleanup = bindHomepageClerkSignIn({
      win: {
        Clerk: {
          openSignIn: () => {
            openCount += 1
          },
        },
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      },
      doc: {
        getElementById: (id) => (id === 'signin-btn' ? signInButton : null),
      },
    })

    signInButton.click()
    cleanup()

    expect(openCount).toBe(1)
  })

  test('shows and focuses the fallback overlay when Clerk sign-in is unavailable', () => {
    const signInButton = new FakeElement()
    const overlay = new FakeElement()
    const googleButton = new FakeElement()
    const cleanup = bindHomepageClerkSignIn({
      win: {
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      },
      doc: {
        getElementById: (id) => {
          if (id === 'signin-btn') return signInButton
          if (id === 'auth-overlay') return overlay
          if (id === 'google-signin-btn') return googleButton
          return null
        },
      },
    })

    signInButton.click()
    cleanup()

    expect(overlay.attributes.get('class-removed:hidden')).toBe('true')
    expect(overlay.attributes.get('aria-hidden')).toBe('false')
    expect(googleButton.focusCount).toBe(1)
  })

  test('opens sign-in when a child inside the sign-in button receives the click', () => {
    let openCount = 0
    let documentClick: EventListener | undefined
    const target = {
      closest: (selector: string) =>
        selector.includes('#signin-btn') ? new FakeElement() : null,
    }

    bindHomepageClerkSignIn({
      win: {
        Clerk: {
          openSignIn: () => {
            openCount += 1
          },
        },
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      },
      doc: {
        getElementById: () => null,
        addEventListener: (_type, listener) => {
          documentClick = listener
        },
        removeEventListener: () => undefined,
      },
    })

    documentClick?.({
      preventDefault: () => undefined,
      target,
    } as unknown as Event)

    expect(openCount).toBe(1)
  })

  test('hides sign-in and skips opening the modal when Clerk already has a user', () => {
    let openCount = 0
    let profileCount = 0
    let documentClick: EventListener | undefined
    const signInButton = new FakeElement()
    const signOutButton = new FakeElement()
    const target = {
      closest: (selector: string) =>
        selector.includes('#signin-btn') ? signInButton : null,
    }

    bindHomepageClerkSignIn({
      win: {
        Clerk: {
          user: {},
          openSignIn: () => {
            openCount += 1
          },
          openUserProfile: () => {
            profileCount += 1
          },
        },
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      },
      doc: {
        getElementById: (id) => {
          if (id === 'signin-btn') {
            return signInButton
          }
          if (id === 'signout-btn') {
            return signOutButton
          }
          return null
        },
        addEventListener: (_type, listener) => {
          documentClick = listener
        },
        removeEventListener: () => undefined,
      },
    })

    documentClick?.({
      preventDefault: () => undefined,
      target,
    } as unknown as Event)

    expect(signInButton.style.display).toBe('none')
    expect(signOutButton.style.display).toBe('inline-flex')
    expect(openCount).toBe(0)
    expect(profileCount).toBe(1)
  })

  test('treats Clerk client sessions as already signed in', () => {
    let openCount = 0
    let profileCount = 0
    let documentClick: EventListener | undefined
    const signInButton = new FakeElement()
    const signOutButton = new FakeElement()
    const target = {
      closest: (selector: string) =>
        selector.includes('#signin-btn') ? signInButton : null,
    }

    bindHomepageClerkSignIn({
      win: {
        Clerk: {
          client: {
            sessions: [{}],
          },
          openSignIn: () => {
            openCount += 1
          },
          openUserProfile: () => {
            profileCount += 1
          },
        },
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      },
      doc: {
        getElementById: (id) => {
          if (id === 'signin-btn') {
            return signInButton
          }
          if (id === 'signout-btn') {
            return signOutButton
          }
          return null
        },
        addEventListener: (_type, listener) => {
          documentClick = listener
        },
        removeEventListener: () => undefined,
      },
    })

    documentClick?.({
      preventDefault: () => undefined,
      target,
    } as unknown as Event)

    expect(signInButton.style.display).toBe('none')
    expect(signOutButton.style.display).toBe('inline-flex')
    expect(openCount).toBe(0)
    expect(profileCount).toBe(1)
  })

  test('swallows Clerk single-session sign-in errors and switches to signed-in controls', () => {
    let documentClick: EventListener | undefined
    const signInButton = new FakeElement()
    const signOutButton = new FakeElement()
    const target = {
      closest: (selector: string) =>
        selector.includes('#signin-btn') ? signInButton : null,
    }

    bindHomepageClerkSignIn({
      win: {
        Clerk: {
          openSignIn: () => {
            throw Object.assign(new Error('single session'), {
              code: 'cannot_render_single_session_enabled',
            })
          },
        },
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      },
      doc: {
        getElementById: (id) => {
          if (id === 'signin-btn') {
            return signInButton
          }
          if (id === 'signout-btn') {
            return signOutButton
          }
          return null
        },
        addEventListener: (_type, listener) => {
          documentClick = listener
        },
        removeEventListener: () => undefined,
      },
    })

    expect(() =>
      documentClick?.({
        preventDefault: () => undefined,
        target,
      } as unknown as Event),
    ).not.toThrow()
    expect(signInButton.style.display).toBe('none')
    expect(signOutButton.style.display).toBe('inline-flex')
  })

  test('skips opening sign-up when Clerk already has a client session', () => {
    let signUpCount = 0
    let profileCount = 0
    let documentClick: EventListener | undefined
    const signInButton = new FakeElement()
    const signOutButton = new FakeElement()
    const signUpButton = new FakeElement()
    const target = {
      closest: (selector: string) =>
        selector.includes('#email-signup-btn') ? signUpButton : null,
    }

    bindHomepageClerkSignIn({
      win: {
        Clerk: {
          client: {
            sessions: [{}],
          },
          openSignUp: () => {
            signUpCount += 1
          },
          openUserProfile: () => {
            profileCount += 1
          },
        },
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      },
      doc: {
        getElementById: (id) => {
          if (id === 'signin-btn') {
            return signInButton
          }
          if (id === 'signout-btn') {
            return signOutButton
          }
          if (id === 'email-signup-btn') {
            return signUpButton
          }
          return null
        },
        addEventListener: (_type, listener) => {
          documentClick = listener
        },
        removeEventListener: () => undefined,
      },
    })

    documentClick?.({
      preventDefault: () => undefined,
      target,
    } as unknown as Event)

    expect(signUpCount).toBe(0)
    expect(profileCount).toBe(1)
    expect(signInButton.style.display).toBe('none')
    expect(signOutButton.style.display).toBe('inline-flex')
  })

  test('signs out and restores signed-out controls from the homepage sign-out button', () => {
    let signOutCount = 0
    let documentClick: EventListener | undefined
    const signInButton = new FakeElement()
    const signOutButton = new FakeElement()
    const clerk: {
      user?: unknown
      session?: unknown
      signOut: () => void
    } = {
      user: {},
      session: {},
      signOut: () => {
        signOutCount += 1
        clerk.user = undefined
        clerk.session = undefined
      },
    }
    const target = {
      closest: (selector: string) =>
        selector.includes('#signout-btn') ? signOutButton : null,
    }

    bindHomepageClerkSignIn({
      win: {
        Clerk: clerk,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      },
      doc: {
        getElementById: (id) => {
          if (id === 'signin-btn') {
            return signInButton
          }
          if (id === 'signout-btn') {
            return signOutButton
          }
          return null
        },
        addEventListener: (_type, listener) => {
          documentClick = listener
        },
        removeEventListener: () => undefined,
      },
    })

    documentClick?.({
      preventDefault: () => undefined,
      target,
    } as unknown as Event)

    expect(signOutCount).toBe(1)
    expect(signInButton.style.display).toBe('inline-flex')
    expect(signOutButton.style.display).toBe('none')
  })

  test('removes delegated window, document, and Clerk listeners during cleanup', () => {
    let windowListener: EventListener | undefined
    let documentListener: EventListener | undefined
    let clerkListener: (() => void) | undefined
    let clerkListenerRemoved = 0
    const removedWindow: Array<{ listener: EventListener; type: string }> = []
    const removedDocument: Array<{ listener: EventListener; type: string }> = []

    const cleanup = bindHomepageClerkSignIn({
      win: {
        Clerk: {
          addListener: (listener) => {
            clerkListener = listener
            return () => {
              clerkListenerRemoved += 1
            }
          },
        },
        addEventListener: (type, listener) => {
          if (type === 'sf-request-auth-overlay') windowListener = listener
        },
        removeEventListener: (type, listener) => {
          removedWindow.push({ listener, type })
        },
      },
      doc: {
        getElementById: () => null,
        addEventListener: (type, listener) => {
          if (type === 'click') documentListener = listener
        },
        removeEventListener: (type, listener) => {
          removedDocument.push({ listener, type })
        },
      },
    })

    cleanup()

    expect(clerkListener).toBeTypeOf('function')
    expect(clerkListenerRemoved).toBe(1)
    expect(removedWindow).toEqual([
      { type: 'sf-request-auth-overlay', listener: windowListener },
    ])
    expect(removedDocument).toEqual([
      { type: 'click', listener: documentListener },
    ])
  })
})
