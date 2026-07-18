import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

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

function MicWaveMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="9" y="2" width="6" height="11" rx="3" />
      <path d="M5 10v1a7 7 0 0 0 14 0v-1" />
      <path d="M12 18v3" />
      <path d="M2 14v-3" />
      <path d="M22 14v-3" />
      <path d="M5 15v-1" />
      <path d="M19 15v-1" />
    </svg>
  )
}

export const PodcastNavbar = defineCapsule({
  name: 'PodcastNavbar',
  description:
    "Sticky podcast site header built on SiteNav: a 'Signal & Static' wordmark paired with a mic/soundwave mark, a centered desktop nav, a Subscribe CTA, and a mobile drawer. Designed for podcasts and audio shows that want a warm, on-air feel at the top of every page. Renders fully with no props via baked defaults and passes className through for layout control.",
  props: z.object({
    brand: z.string().optional(),
    nav: z.array(z.string()).optional(),
    phone: z.string().optional(),
    homeTarget: z.string().optional(),
    ctaLabel: z.string().optional(),
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const nav = props.nav?.length
      ? props.nav
      : ['Episodes', 'About', 'Hosts', 'Subscribe']
    const brand = props.brand ?? 'Signal & Static'
    const ctaLabel = props.ctaLabel ?? 'Subscribe'
    const ctaTarget = props.ctaTarget ?? 'Subscribe'
    const homeTarget = props.homeTarget ?? nav[0]

    return (
      <SiteNav position="fixed" height="default" className={props.className}>
        <NavbarBrand href={homeTarget} className="gap-3">
          <MicWaveMark className="size-8 text-primary" />
          <Logo brand={brand}>
            <LogoImage />
            <LogoLabel className="font-semibold tracking-tight text-xl" />
          </Logo>
        </NavbarBrand>
        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink key={label} href={label}>
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>
        <NavbarActions>
          <NavbarCta
            variant="primary-pill"
            className="hidden px-5 py-2.5 sm:inline-flex"
            href={ctaTarget}
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
