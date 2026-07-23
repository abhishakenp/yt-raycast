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
} from '#/section-kit/SiteNav.tsx'
import { SignInButton } from '#/section-kit/SignInButton.tsx'
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
    "Sticky editorial-terminal developer-portfolio header on the shared SiteNav composite: a mono wordmark whose logo mark is an inline </> code glyph (runtime-swappable brand slot), monospace uppercase nav links, and a square-cornered mono 'Hire Me' CTA with a hard offset shadow and mechanical press feedback that routes to Contact. Includes a real mobile drawer on small screens and omits the phone slot, matching how engineers, freelancers, and indie hackers present themselves. Use as the site-wide header for developer, engineer, or freelancer portfolios; renders fully with no props via baked-in 'alex.dev' defaults.",
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
    /** Label for the sign-in button. */
    signIn: z.string().optional(),
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
    const signIn = props.signIn ?? 'Sign in'

    return (
      <SiteNav position="fixed" height="default" className={props.className}>
        <NavbarBrand href={homeTarget} className="gap-2.5">
          <Logo brand={brand}>
            <LogoImage
              className="size-7"
              fallback={<CodeMark className="size-7 text-primary" />}
            />
            <LogoLabel className="font-mono text-lg font-semibold tracking-tight" />
          </Logo>
        </NavbarBrand>
        <NavbarNav className="gap-6">
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="rounded-none font-mono text-xs uppercase tracking-[0.12em]"
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>
        <NavbarActions>
          <SignInButton
            variant="ghost"
            label={signIn}
            className="hidden sm:block"
          />
          <NavbarCta
            variant="primary-pill"
            className="hidden rounded-none px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-[0.12em] shadow-[3px_3px_0_0] shadow-foreground transition-[transform,box-shadow,background-color] duration-150 hover:bg-primary/90 active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-none motion-reduce:transform-none sm:inline-flex"
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
