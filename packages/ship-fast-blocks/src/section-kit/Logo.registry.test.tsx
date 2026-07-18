// @vitest-environment jsdom

import { cleanup, render } from '@testing-library/react'
import type { ComponentRenderProps } from '@openuidev/react-lang'
import type { ReactElement } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { isCapsule, type ShipFastCapsule } from '#/capsules/openui.ts'
import * as registry from '#/registry/all.ts'
import { BrandLogoProvider } from './Logo.tsx'

vi.mock('#/lib/use-navigate.tsx', () => ({
  useNavigate: () => vi.fn(),
}))

vi.mock('@ship-fast/lakebed/react', () => ({
  createLakebedClient: () => ({
    useAuth: () => ({
      isAuthenticated: false,
      isGuest: true,
      isLoading: false,
      user: null,
    }),
    useMutation: () => vi.fn(),
    useQuery: () => {
      if (/(?:Catalog|notifications|orders|Listings|Articles)$/i.test(name)) {
        return []
      }
      if (/Count$/i.test(name)) return 0
      return null
    },
  }),
  useAuth: () => ({
    isAuthenticated: false,
    isGuest: true,
    isLoading: false,
    user: null,
  }),
  signInWithGoogle: vi.fn(),
  signOut: vi.fn(),
  useKeyedLakebedMutation: () => ({
    isPending: () => false,
    run: vi.fn(async () => null),
  }),
}))

const selectedLogo = {
  name: 'Acme Labs',
  domain: 'acme.test',
  brandId: 'acme',
  icon: 'https://cdn.example.com/acme-icon.svg',
  logo: 'https://cdn.example.com/acme-logo.svg',
}

const copyrightOnlyBrandComponents = new Set([
  'ContactFooter',
  'FilmDirectorFooter',
])

function brandShellCapsules(): ShipFastCapsule[] {
  return Object.values(registry)
    .filter((value): value is ShipFastCapsule => isCapsule(value))
    .filter((capsule) => /(Navbar|Footer|Sidebar)$/.test(capsule.client.name))
}

function RenderCapsule({ capsule }: { capsule: ShipFastCapsule }) {
  return capsule.client.component({
    props: { brand: 'Acme Labs' },
    statementId: `${capsule.client.name}-logo-regression`,
  } as ComponentRenderProps<{ brand: string }>) as ReactElement
}

function renderCapsuleWithBrand(
  capsule: ShipFastCapsule,
): ReturnType<typeof render> {
  return render(
    <BrandLogoProvider value={selectedLogo}>
      <RenderCapsule capsule={capsule} />
    </BrandLogoProvider>,
  )
}

afterEach(() => {
  cleanup()
})

describe('registry brand logo behavior', () => {
  it('renders the selected brand logo anywhere a shell capsule visibly exposes the brand name', () => {
    const offenders: string[] = []
    const renderedBrandSurfaces: string[] = []

    for (const capsule of brandShellCapsules()) {
      const view = renderCapsuleWithBrand(capsule)
      const text = view.container.textContent ?? ''
      const exposesBrand = text.includes('Acme Labs')
      const selectedImage = view.container.querySelector(
        'img[src="https://cdn.example.com/acme-icon.svg"]',
      )
      const brandedButtonOrLink = Array.from(
        view.container.querySelectorAll('a,button,[role="link"]'),
      ).some((element) => element.textContent?.includes('Acme Labs'))

      if (exposesBrand) renderedBrandSurfaces.push(capsule.client.name)

      if (copyrightOnlyBrandComponents.has(capsule.client.name)) {
        if (brandedButtonOrLink) offenders.push(capsule.client.name)
      } else if (exposesBrand && !selectedImage) {
        offenders.push(capsule.client.name)
      }

      view.unmount()
    }

    expect(renderedBrandSurfaces.length).toBeGreaterThan(20)
    expect(offenders).toEqual([])
  })
})
