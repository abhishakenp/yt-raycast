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

/**
 * FintechNavbar — Swiss-fintech sticky site header for a neobank / digital-
 * banking landing page. A thin configuration over the shared `SiteNav`
 * composite with hairline precision: an inline shield brand mark set as the
 * wordmark's runtime-swappable logo image, a horizontal row of desktop nav
 * links, and a single square (binary radius) primary "Get Started" CTA with
 * mechanical press feedback on the right, plus a real mobile drawer (Sheet) on
 * small screens. Backdrop-blur and the bottom hairline rule read as an
 * institutional trust bar. Every link and CTA routes through route hrefs so
 * labels drive page-switching. Use as the header for banking apps, digital
 * wallets, payments products, lending platforms, or any finance startup
 * landing page. Renders fully with no props via baked-in "Vault" defaults.
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
    "Swiss-fintech sticky neobank site header built on the shared SiteNav composite with hairline precision: an inline shield brand mark + product wordmark, horizontal desktop nav links, a single square (binary-radius) primary 'Get Started' CTA with mechanical press feedback, backdrop-blur and a bottom hairline rule that read as an institutional trust bar, and a real mobile drawer. All links and CTA route through route hrefs for page-switching. Use as the header for banking apps, digital wallets, payment products, lending platforms, or finance startup landing pages.",
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
    const nav = props.nav?.length
      ? props.nav
      : ['Features', 'Security', 'Pricing', 'FAQ']
    const brand = props.brand ?? 'Vault'
    const ctaLabel = props.ctaLabel ?? 'Get Started'
    const ctaTarget = props.ctaTarget ?? 'Open an Account'
    const homeTarget = props.homeTarget ?? nav[0]
    return (
      <SiteNav position="fixed" height="default" className={props.className}>
        <NavbarBrand href={homeTarget} className="flex items-center gap-2">
          <Logo brand={brand}>
            <LogoImage
              className="size-7"
              fallback={<ShieldMark className="size-7 text-primary" />}
            />
            <LogoLabel className="text-xl font-semibold tracking-tight" />
          </Logo>
        </NavbarBrand>
        <NavbarNav className="gap-7">
          {nav.map((label, i) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="rounded-none text-[13px] tracking-tight"
            >
              <span
                aria-hidden="true"
                className="mr-1.5 font-mono text-[10px] tabular-nums text-muted-foreground/50"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>
        <NavbarActions>
          <NavbarCta
            variant="primary"
            className="hidden rounded-none px-5 py-2.5 text-[13px] tracking-tight transition-[transform,background-color] duration-150 active:translate-y-px motion-reduce:transform-none sm:inline-flex"
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
