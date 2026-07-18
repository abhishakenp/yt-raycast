import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import {
  NavbarActions,
  NavbarBrand,
  NavbarCta,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/index.ts'

/**
 * CrowdfundingNavbar — sticky, backdrop-blurred top navigation for a
 * crowdfunding / campaign landing page. A border-bottomed header pinned to the
 * top with a decorative leaf/sparkle brand mark in an emerald-token tile beside
 * the campaign name on the left, a horizontal set of muted nav links in the
 * center (hidden on mobile), and a primary "Back This Project" pill CTA on the
 * right. Every link and CTA routes through useNavigate so PageSwitch can swap
 * pages. Use as the sticky site header for Kickstarter / Indiegogo-style
 * campaigns, pre-order launches, fundraisers, or maker/hardware projects.
 */
export const CrowdfundingNavbar = defineCapsule({
  name: 'CrowdfundingNavbar',
  description:
    "Sticky, backdrop-blurred top navigation for a crowdfunding / campaign landing page: a border-bottomed header pinned to the top with a decorative leaf/sparkle brand mark in an emerald-token tile beside the campaign name on the left, a horizontal set of muted nav links in the center (hidden on mobile), and a primary 'Back This Project' pill CTA on the right. Every link and CTA routes through useNavigate so PageSwitch can swap pages. Use as the sticky site header for Kickstarter / Indiegogo-style campaigns, pre-order launches, fundraisers, or maker/hardware projects.",
  props: z.object({
    /** Brand / campaign name shown beside the logo mark. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Target label for the brand/home button (defaults to first nav item). */
    homeTarget: z.string().optional(),
    /** Label for the primary pill CTA on the right. */
    ctaLabel: z.string().optional(),
    /** Target label for the primary pill CTA (defaults to the Rewards route). */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'EcoBrush'
    const nav = props.nav?.length
      ? props.nav
      : ['Our Story', 'Features', 'Rewards', 'FAQ']
    const homeTarget = props.homeTarget ?? nav[0]
    const ctaLabel = props.ctaLabel ?? 'Back This Project'
    const ctaTarget = props.ctaTarget ?? nav[2] ?? 'Rewards'

    const LeafMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-full bg-primary text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      </span>
    )

    return (
      <SiteNav
        position="sticky"
        height="compact"
        className={cn('bg-background/95 backdrop-blur', props.className)}
      >
        <NavbarBrand asChild>
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="gap-2"
          >
            <BrandLogo brand={brand}>
              <LogoImage fallback={<LeafMark className="size-8" />} />
              <LogoLabel className="text-xl font-semibold tracking-tight" />
            </BrandLogo>
          </button>
        </NavbarBrand>

        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              onClick={() => go(label)}
              className="font-normal"
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions>
          <NavbarCta
            variant="primary"
            onClick={() => go(ctaTarget)}
            className="px-5 py-2.5"
          >
            {ctaLabel}
          </NavbarCta>
        </NavbarActions>
      </SiteNav>
    )
  },
})
