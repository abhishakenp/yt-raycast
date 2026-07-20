import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import {
  NavbarActions,
  NavbarRouteLink,
  NavbarBrand,
  NavbarCta,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/index.ts'

/**
 * CryptoNavbar — Web3-terminal sticky top navigation bar for a crypto / DeFi
 * infrastructure landing page. A backdrop-blurred, hairline-bottomed header
 * with a square inverted bolt mark + protocol wordmark on the left, mono
 * uppercase nav links in the center, and a dual action group on the right
 * (mono secondary documentation link hidden below xl + square-cornered
 * inverted CTA with press feedback). Every link and CTA routes through route
 * hrefs for page-switching. Use as the sticky site header for crypto
 * protocols, layer-1/layer-2 chains, DeFi platforms, bridges, staking
 * networks, or Web3 infrastructure sites.
 */
export const CryptoNavbar = defineCapsule({
  name: 'CryptoNavbar',
  description:
    'Web3-terminal sticky top navigation bar for a crypto / DeFi infrastructure landing page: backdrop-blurred, hairline-bottomed header with a square inverted bolt mark + protocol wordmark on the left, mono uppercase nav links in the center, and a dual action group on the right (mono secondary documentation link + square-cornered inverted CTA with press feedback). All links route through route hrefs. Use as the sticky site header for crypto protocols, layer-1/layer-2 chains, DeFi platforms, bridges, staking networks, or Web3 infrastructure sites.',
  props: z.object({
    /** Brand / protocol name shown beside the logo icon. */
    brand: z.string().optional(),
    /** Top-level navbar link labels. */
    nav: z.array(z.string()).optional(),
    /** Target label for the brand/home button (defaults to first nav item). */
    homeTarget: z.string().optional(),
    /** Label for the secondary documentation link (left of CTA). */
    docLabel: z.string().optional(),
    /** Target label for the secondary documentation link. */
    docTarget: z.string().optional(),
    /** Label for the primary pill CTA. */
    ctaLabel: z.string().optional(),
    /** Target label for the primary pill CTA. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'NexusChain'
    const nav = props.nav?.length
      ? props.nav
      : ['Features', 'Network', 'Roadmap', 'Partners']
    const homeTarget = props.homeTarget ?? nav[0]
    const docLabel = props.docLabel ?? 'Documentation'
    const docTarget = props.docTarget ?? 'View Documentation'
    const ctaLabel = props.ctaLabel ?? 'Launch App'
    const ctaTarget = props.ctaTarget ?? 'Start Building'

    const BoltIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    )

    return (
      <SiteNav
        position="sticky"
        height="compact"
        className={cn(
          'border-b border-border bg-background/80 backdrop-blur-md',
          props.className,
        )}
      >
        <NavbarBrand href={homeTarget}>
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              className="size-7"
              fallback={
                <span className="grid size-7 place-items-center bg-foreground text-background">
                  <BoltIcon className="size-4" />
                </span>
              }
            />
            <LogoLabel className="text-lg font-semibold tracking-tight" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="font-mono text-[12px] font-medium uppercase tracking-[0.15em]"
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions>
          <NavbarRouteLink
            href={docTarget}
            className="hidden font-mono text-[12px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:text-foreground xl:block"
          >
            {docLabel}
          </NavbarRouteLink>
          <NavbarCta
            variant="dark"
            href={ctaTarget}
            className="rounded-none px-4 py-2 font-mono text-[12px] font-semibold uppercase tracking-[0.15em] transition-transform duration-150 active:translate-y-px"
          >
            {ctaLabel}
          </NavbarCta>
        </NavbarActions>
      </SiteNav>
    )
  },
})
