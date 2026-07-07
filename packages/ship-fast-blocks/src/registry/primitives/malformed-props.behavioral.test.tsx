// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import type { CapsuleRenderer } from '#/capsules/openui.ts'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AvatarGroup } from './avatar.tsx'
import { KbdCombo } from './kbd.tsx'
import { Menubar } from './menubar.tsx'
import { NativeSelect } from './native-select.tsx'
import { NavigationMenu } from './navigation-menu.tsx'
import { RadioGroup } from './radio-group.tsx'

vi.mock('@ship-fast/lakebed/react', () => ({
  createLakebedClient: () => ({
    useAuth: () => ({
      isAuthenticated: false,
      isGuest: true,
      isLoading: false,
      user: null,
    }),
    useMutation: () =>
      Object.assign(vi.fn().mockResolvedValue(null), {
        isPending: false,
        lastError: null,
        pendingCount: 0,
        reset: vi.fn(),
      }),
    useQuery: () => undefined,
  }),
}))

const renderCapsule = <P,>(component: CapsuleRenderer<P>, props: P) => {
  const Component = component
  return render(<Component props={props} statementId="malformed-props-test" />)
}

const renderMalformed = <P,>(component: CapsuleRenderer<P>, props: P) => {
  expect(() => renderCapsule(component, props)).not.toThrow()
}

afterEach(() => {
  cleanup()
})

describe('primitive capsule malformed generated props', () => {
  it('keeps KbdCombo renderable when generated keys are missing or partly invalid', () => {
    renderMalformed(KbdCombo.client.component, {
      keys: undefined,
    } as unknown as Parameters<typeof KbdCombo.client.component>[0]['props'])
    renderMalformed(KbdCombo.client.component, {
      keys: ['⌘', null, 'K'],
    } as unknown as Parameters<typeof KbdCombo.client.component>[0]['props'])

    expect(screen.getByText('⌘')).toBeTruthy()
    expect(screen.getByText('K')).toBeTruthy()
  })

  it('keeps AvatarGroup renderable when generated avatar rows are missing or null', () => {
    renderMalformed(AvatarGroup.client.component, {
      items: undefined,
      overflow: '+3',
    } as unknown as Parameters<typeof AvatarGroup.client.component>[0]['props'])
    renderMalformed(AvatarGroup.client.component, {
      items: [null, { fallback: 'AB', alt: 'Ada Byron' }],
      overflow: '+1',
    } as unknown as Parameters<typeof AvatarGroup.client.component>[0]['props'])

    expect(screen.getByText('AB')).toBeTruthy()
    expect(screen.getAllByText('+1')).toHaveLength(1)
  })

  it('keeps selection primitives renderable when generated options are missing or malformed', () => {
    renderMalformed(RadioGroup.client.component, {
      items: undefined,
    } as unknown as Parameters<typeof RadioGroup.client.component>[0]['props'])
    renderMalformed(RadioGroup.client.component, {
      items: [null, { value: 'monthly', label: 'Monthly' }],
    } as unknown as Parameters<typeof RadioGroup.client.component>[0]['props'])
    renderMalformed(NativeSelect.client.component, {
      placeholder: 'Choose plan',
      items: undefined,
    } as unknown as Parameters<
      typeof NativeSelect.client.component
    >[0]['props'])
    renderMalformed(NativeSelect.client.component, {
      items: [null, { value: 'team', label: 'Team' }],
    } as unknown as Parameters<
      typeof NativeSelect.client.component
    >[0]['props'])

    expect(screen.getByText('Monthly')).toBeTruthy()
    expect(screen.getByRole('option', { name: 'Team' })).toBeTruthy()
  })

  it('keeps Menubar renderable when generated menus or menu items are malformed', () => {
    renderMalformed(Menubar.client.component, {
      menus: undefined,
    } as unknown as Parameters<typeof Menubar.client.component>[0]['props'])
    renderMalformed(Menubar.client.component, {
      menus: [
        null,
        {
          label: 'File',
          items: [null, { label: 'Export', shortcut: '⌘E' }],
        },
      ],
    } as unknown as Parameters<typeof Menubar.client.component>[0]['props'])

    expect(screen.getAllByText('File').length).toBeGreaterThan(0)
    expect(screen.getByText('Export')).toBeTruthy()
  })

  it('keeps NavigationMenu renderable when generated nav links are malformed', () => {
    renderMalformed(NavigationMenu.client.component, {
      items: undefined,
    } as unknown as Parameters<
      typeof NavigationMenu.client.component
    >[0]['props'])
    renderMalformed(NavigationMenu.client.component, {
      items: [
        null,
        {
          label: 'Docs',
          links: [null, { label: 'Guide', href: '/guide' }],
        },
      ],
    } as unknown as Parameters<
      typeof NavigationMenu.client.component
    >[0]['props'])

    expect(screen.getAllByText('Docs').length).toBeGreaterThan(0)
    expect(screen.getByText('Guide')).toBeTruthy()
  })
})
