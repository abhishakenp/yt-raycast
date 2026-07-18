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

function CodeMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m8 8-4 4 4 4" />
      <path d="m16 8 4 4-4 4" />
    </svg>
  )
}

export const PortfolioDevNavbar = defineCapsule({
  name: 'PortfolioDevNavbar',
  description:
    "Sticky developer-portfolio header built on the shared SiteNav composite: a mono wordmark beside an inline </> code mark, centered desktop nav links, and a 'Hire Me' CTA that routes to Contact. Includes a real mobile drawer on small screens and omits the phone slot, matching how engineers, freelancers, and indie hackers present themselves. Use as the site-wide header for developer, engineer, or freelancer portfolios; renders fully with no props via baked-in 'alex.dev' defaults.",
  props: z.object({
    /** Developer / brand handle shown as the mono wordmark. */
    brand: z.string().optional(),
    /** Nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the logo / brand click. */
    homeTarget: z.string().optional(),
    /** CTA label on the right. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the CTA. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const nav = props.nav?.length
      ? props.nav
      : ['Work', 'Services', 'About', 'Contact']
    const brand = props.brand ?? 'alex.dev'
    const ctaLabel = props.ctaLabel ?? 'Hire Me'
    const ctaTarget = props.ctaTarget ?? 'Contact'
    const homeTarget = props.homeTarget ?? nav[0]

    return (
      <SiteNav position="fixed" height="default" className={props.className}>
        <NavbarBrand href={homeTarget} className="gap-3">
          <CodeMark className="size-7 text-primary" />
          <Logo brand={brand}>
            <LogoImage />
            <LogoLabel className="font-mono text-lg font-semibold" />
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
