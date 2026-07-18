import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import { MobileNavDrawer } from '#/section-kit/MobileNavDrawer.tsx'
import {
  NavbarActions,
  NavbarBrand,
  NavbarCta,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/index.ts'

function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="9" cy="13" r="5" />
      <circle cx="15" cy="13" r="5" />
      <path d="M9 8c0-2 1.3-3.5 3-3.5S15 6 15 8" />
    </svg>
  )
}

export const WeddingNavbar = defineCapsule({
  name: 'WeddingNavbar',
  description:
    'Elegant sticky wedding header built on the shared SiteNav composite: serif couple wordmark, interlocking-rings brand mark, romantic nav links (Story, Gallery, Details, RSVP), and an RSVP call to action. Use as the page header for a wedding invitation or celebration site, or as the top band of any generated wedding page family.',
  props: z.object({
    brand: z.string().optional(),
    nav: z.array(z.string()).optional(),
    homeTarget: z.string().optional(),
    ctaLabel: z.string().optional(),
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const nav = props.nav?.length
      ? props.nav
      : ['Story', 'Gallery', 'Details', 'RSVP']
    const go = useNavigate()
    const brand = props.brand ?? 'Ava & Liam'
    const brandMark = <Mark className="size-8 text-primary" />
    const brandClassName = 'font-serif text-xl font-medium'
    const ctaLabel = props.ctaLabel ?? 'RSVP'
    const ctaTarget = props.ctaTarget ?? 'RSVP'
    const homeTarget = props.homeTarget ?? nav[0]
    return (
      <SiteNav position="fixed" height="default" className={props.className}>
        <NavbarBrand asChild>
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="gap-3"
          >
            {brandMark}
            <Logo brand={brand}>
              <LogoImage />
              <LogoLabel className={brandClassName} />
            </Logo>
          </button>
        </NavbarBrand>
        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink key={label} onClick={() => go(label)}>
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>
        <NavbarActions>
          <NavbarCta
            variant="primary-pill"
            className="hidden px-5 py-2.5 sm:inline-flex"
            onClick={() => go(ctaTarget)}
          >
            {ctaLabel}
          </NavbarCta>
          <MobileNavDrawer
            brand={brand}
            nav={nav}
            homeTarget={homeTarget}
            cta={{ label: ctaLabel, target: ctaTarget }}
            buttonClassName="p-2 text-muted-foreground hover:text-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
