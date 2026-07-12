// @vitest-environment jsdom

import React from 'react'
import { Renderer } from '@openuidev/react-lang'
import {
  cleanup,
  fireEvent,
  render,
  type RenderResult,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const authRuntime = vi.hoisted(() => ({
  signInWithGoogle: vi.fn(async () => ({
    bundle: { challenge: 'challenge', state: 'state', verifier: 'verifier' },
    url: 'https://auth.example.test/start',
  })),
  signOut: vi.fn(),
  state: {
    displayName: '',
    email: '',
    isAuthenticated: Boolean(false),
    isGuest: Boolean(true),
    isLoading: Boolean(false),
    picture: '',
  },
}))

vi.mock('@ship-fast/lakebed/react', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@ship-fast/lakebed/react')>()
  return {
    ...actual,
    signInWithGoogle: authRuntime.signInWithGoogle,
    signOut: authRuntime.signOut,
    useAuth: () => authRuntime.state,
  }
})

const { loadOpenUIRuntimeLibrary } = await import('../../runtime-library.ts')
const { SignIn } = await import('./sign-in.tsx')
const { AccountDropdown, AccountDropdownUnauthenticated } =
  await import('../../section-kit/AccountDropdown.tsx')

type RenderPath = 'capsule' | 'renderer'
type SignInRenderer = (
  path: RenderPath,
  label?: string,
) => Promise<RenderResult>
type ClassTokenReader = (element: HTMLElement) => string[]
type ButtonTokenReader = (button: HTMLButtonElement) => string[]
type ShinyLayerReader = (button: HTMLButtonElement) => {
  classes: string[]
  exists: boolean
}

const renderSignIn: SignInRenderer = async (path, label = 'Login') => {
  if (path === 'capsule') {
    const SignInCapsule = SignIn.client.component
    return render(
      <SignInCapsule
        props={{ className: '', label, variant: 'primary' }}
        statementId="sign_in_parity"
      />,
    )
  }

  const source = `root = SignIn(${JSON.stringify(label)}, "primary", "")`
  const library = await loadOpenUIRuntimeLibrary(source)
  return render(React.createElement(Renderer, { library, response: source }))
}

const renderCanonicalSignIn = () =>
  render(
    <AccountDropdown
      auth={{
        signInWithGoogle: authRuntime.signInWithGoogle,
        signOut: authRuntime.signOut,
        useAuth: () => ({
          isAuthenticated: false,
          isLoading: authRuntime.state.isLoading,
          user: null,
        }),
      }}
    >
      <AccountDropdownUnauthenticated>Login</AccountDropdownUnauthenticated>
    </AccountDropdown>,
  )

const classTokens: ClassTokenReader = (element) =>
  element.className.split(/\s+/).filter(Boolean).sort()

const interactionTokens: ButtonTokenReader = (button) =>
  classTokens(button).filter((token) =>
    /^(?:hover|focus-visible|disabled):/.test(token),
  )

const shinyLayerContract: ShinyLayerReader = (button) => {
  const layer = button.querySelector<HTMLElement>('span[aria-hidden="true"]')
  return {
    classes: layer ? classTokens(layer) : [],
    exists: layer !== null,
  }
}

beforeEach(() => {
  authRuntime.state.isAuthenticated = false
  authRuntime.state.isGuest = true
  authRuntime.state.isLoading = false
  authRuntime.signInWithGoogle.mockClear()
  authRuntime.signOut.mockClear()
  window.history.replaceState(null, '', '/release-preview?mode=demo#signin')
})

afterEach(() => {
  cleanup()
})

describe('SignIn capsule and renderer parity', () => {
  it.each<RenderPath>(['capsule', 'renderer'])(
    '%s matches the canonical shiny button surface',
    async (path) => {
      const canonicalView = renderCanonicalSignIn()
      const canonical = canonicalView.getByRole('button', { name: 'Login' })
      const expected = {
        classes: classTokens(canonical),
        shinyLayer: shinyLayerContract(canonical),
      }
      canonicalView.unmount()

      const view = await renderSignIn(path)
      const button = await view.findByRole('button', { name: 'Login' })

      expect({
        classes: classTokens(button),
        shinyLayer: shinyLayerContract(button),
      }).toEqual(expected)
    },
  )

  it.each<RenderPath>(['capsule', 'renderer'])(
    '%s preserves canonical hover and focus-visible states',
    async (path) => {
      const canonicalView = renderCanonicalSignIn()
      const canonical = canonicalView.getByRole('button', { name: 'Login' })
      const expectedTokens = interactionTokens(canonical).filter(
        (token) =>
          token.startsWith('hover:') || token.startsWith('focus-visible:'),
      )
      canonicalView.unmount()

      const view = await renderSignIn(path)
      const button = await view.findByRole('button', { name: 'Login' })
      button.focus()

      expect(document.activeElement).toBe(button)
      expect(
        interactionTokens(button).filter(
          (token) =>
            token.startsWith('hover:') || token.startsWith('focus-visible:'),
        ),
      ).toEqual(expectedTokens)
    },
  )

  it.each<RenderPath>(['capsule', 'renderer'])(
    '%s preserves canonical disabled state and blocks sign-in',
    async (path) => {
      authRuntime.state.isLoading = true
      const canonicalView = renderCanonicalSignIn()
      const canonical = canonicalView.getByRole('button', { name: 'Login' })
      const expectedTokens = interactionTokens(canonical).filter((token) =>
        token.startsWith('disabled:'),
      )
      canonicalView.unmount()

      const view = await renderSignIn(path)
      const button = await view.findByRole('button', { name: 'Login' })
      fireEvent.click(button)

      expect(button.disabled).toBe(true)
      expect(
        interactionTokens(button).filter((token) =>
          token.startsWith('disabled:'),
        ),
      ).toEqual(expectedTokens)
      expect(authRuntime.signInWithGoogle).not.toHaveBeenCalled()
    },
  )

  it.each<RenderPath>(['capsule', 'renderer'])(
    '%s exposes the exact visible label as its accessible button name',
    async (path) => {
      const view = await renderSignIn(path, 'Login to continue')
      const button = await view.findByRole('button', {
        name: 'Login to continue',
      })

      expect(button.type).toBe('button')
      expect(button.textContent?.trim()).toBe('Login to continue')
      expect(button.querySelector('svg')?.getAttribute('aria-hidden')).toBe(
        'true',
      )
    },
  )

  it.each<RenderPath>(['capsule', 'renderer'])(
    '%s starts OAuth once and returns to the current route',
    async (path) => {
      const view = await renderSignIn(path)
      const button = await view.findByRole('button', { name: 'Login' })
      fireEvent.click(button)

      expect(authRuntime.signInWithGoogle).toHaveBeenCalledTimes(1)
      expect(authRuntime.signInWithGoogle).toHaveBeenCalledWith({
        returnTo: '/release-preview?mode=demo#signin',
      })
    },
  )
})
