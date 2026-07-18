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
 * CryptoNavbar — glassy sticky top navigation bar for a crypto / DeFi
 * infrastructure landing page. A backdrop-blurred, border-bottomed header
 * pinned to the top with a high-contrast brand bolt icon + protocol name on
 * the left, a horizontal set of nav links in the center, and a dual button
 * group on the right (secondary text link + primary filled CTA). Every link
 * and CTA routes through route hrefs for page-switching. Use as the sticky
 * site header for crypto protocols, layer-1/layer-2 chains, DeFi platforms,
 * bridges, staking networks, or Web3 infrastructure sites.
 */
export const CryptoNavbar = defineCapsule({
  name: 'CryptoNavbar',
  description:
    'Glassy sticky top navigation bar for a crypto / DeFi infrastructure landing page: backdrop-blurred, border-bottomed header with a high-contrast brand bolt icon + protocol name on the left, horizontal nav links in the center, and a dual button group on the right (secondary text link + primary filled CTA). All links route through route hrefs. Use as the sticky site header for crypto protocols, layer-1/layer-2 chains, DeFi platforms, bridges, staking networks, or Web3 infrastructure sites.',
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
        className={cn('bg-background/80 backdrop-blur-md', props.className)}
      >
        <NavbarBrand href={homeTarget} className="gap-2">
          <BrandLogo brand={brand}>
            <LogoImage
              fallback={
                <span className="grid size-8 place-items-center rounded-lg bg-foreground text-background">
                  <BoltIcon className="size-5" />
                </span>
              }
            />
            <LogoLabel className="text-xl font-semibold tracking-tight" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink key={label} href={label} className="font-normal">
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions>
          <NavbarRouteLink
            href={docTarget}
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            {docLabel}
          </NavbarRouteLink>
          <NavbarCta variant="dark" href={ctaTarget} className="px-4 py-2">
            {ctaLabel}
          </NavbarCta>
        </NavbarActions>
      </SiteNav>
    )
  },
})
