import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo } from '#/section-kit/Logo.tsx'
import { MobileNavDrawer } from '#/section-kit/MobileNavDrawer.tsx'
import {
  NavbarActions,
  NavbarBrand,
  NavbarCta,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/index.ts'

/**
 * FintechNavbar — sticky site header for a fintech / neobank / digital-banking
 * landing page. A thin configuration over the shared `SiteNav` composite: an
 * inline shield brand mark beside the product wordmark, a horizontal row of
 * nav links on desktop, a primary "Get Started" pill CTA on the right, and a
 * real mobile drawer (Sheet) on small screens. Every link and CTA routes
 * through useNavigate so labels drive page-switching. Use as the header for
 * banking apps, digital wallets, payments products, lending platforms, or any
 * finance startup landing page. Renders fully with no props via baked-in
 * "Vault" defaults.
 */
function ShieldMark({ className }: { className?: string }) {
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
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

export const FintechNavbar = defineCapsule({
  name: 'FintechNavbar',
  description:
    "Sticky fintech / neobank site header built on the shared SiteNav composite: an inline shield brand mark + product wordmark, horizontal desktop nav links, a primary 'Get Started' pill CTA, and a real mobile drawer. All links and CTA route through useNavigate for page-switching. Use as the header for banking apps, digital wallets, payment products, lending platforms, or finance startup landing pages.",
  props: z.object({
    /** Brand / product name shown beside the shield mark. */
    brand: z.string().optional(),
    /** Nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the logo / brand click. */
    homeTarget: z.string().optional(),
    /** Primary pill CTA label on the right. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the primary CTA. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const nav = props.nav?.length
      ? props.nav
      : ['Features', 'Security', 'Pricing', 'FAQ']
    const brand = props.brand ?? 'Vault'
    const ctaLabel = props.ctaLabel ?? 'Get Started'
    const ctaTarget = props.ctaTarget ?? 'Open an Account'
    const homeTarget = props.homeTarget ?? nav[0]
    return (
      <SiteNav position="fixed" height="default" className={props.className}>
        <NavbarBrand asChild>
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="gap-3"
          >
            <ShieldMark className="size-8 text-primary" />
            <Logo
              brand={brand}
              labelClassName="text-xl font-semibold tracking-tight"
            />
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
