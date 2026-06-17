import { describe, expect, test } from 'vitest'

import { bindHomepageClerkSignIn } from './clerk-signin'

class FakeElement {
  private readonly listeners = new Map<string, EventListener[]>()
  readonly style = {
    display: '',
  }
  readonly classList = {
    add: () => undefined,
    remove: () => undefined,
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

  setAttribute = (_name: string, _value: string) => undefined

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
})
