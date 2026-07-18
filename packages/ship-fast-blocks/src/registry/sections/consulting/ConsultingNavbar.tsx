import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
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
 * ConsultingNavbar — sticky top navigation bar for a management-consulting
 * firm landing page. A border-bottomed, backdrop-blurred header pinned to the
 * top with a solid brand-initial logo tile + firm name on the left, a horizontal
 * set of nav links in the center (desktop), and a primary CTA button plus a
 * hamburger menu icon on the right. The logo and every link route through
 * route hrefs for page-switching. Use as the site header for consulting firms,
 * professional-services groups, corporate advisories, or B2B service businesses.
 * Renders fully with no props via baked-in "Nexus Strategy Partners" defaults.
 */
export const ConsultingNavbar = defineCapsule({
  name: 'ConsultingNavbar',
  description:
    'Sticky top navigation bar for a management-consulting firm landing page: a border-bottomed, backdrop-blurred header with a solid brand-initial logo tile + firm name on the left, horizontal nav links in the center (desktop), a primary CTA button and a hamburger menu icon on the right. Every link and the logo route through route hrefs for page-switching. Use as the site header for consulting firms, professional-services groups, corporate advisories, or B2B service businesses.',
  props: z.object({
    /** Firm / brand name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Top-level navbar link labels. */
    nav: z.array(z.string()).optional(),
    /** Label for the primary CTA button on the right. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the primary CTA button. */
    ctaTarget: z.string().optional(),
    /** Navigation target for the logo and mobile hamburger (first nav item). */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Nexus Strategy Partners'
    const nav = props.nav?.length
      ? props.nav
      : ['Services', 'Insights', 'Industries', 'About', 'Careers']
    const ctaLabel = props.ctaLabel ?? 'Contact Us'
    const ctaTarget = props.ctaTarget ?? 'View Case Studies'
    const homeTarget = props.homeTarget ?? nav[0]

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-sm bg-primary font-bold text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        {brand.charAt(0).toUpperCase()}
      </span>
    )

    return (
      <SiteNav
        position="sticky"
        height="default"
        className={cn('bg-background/95', props.className)}
      >
        <NavbarBrand href={homeTarget} className="gap-3">
          <BrandLogo brand={brand}>
            <LogoImage fallback={<LogoMark className="size-10 text-lg" />} />
            <LogoLabel className="text-xl font-semibold tracking-tight text-foreground" />
          </BrandLogo>
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
            variant="primary"
            href={ctaTarget}
            className="hidden rounded-md px-5 py-2.5 sm:inline-flex"
          >
            {ctaLabel}
          </NavbarCta>
          <MobileNavDrawer
            brand={brand}
            nav={nav}
            homeTarget={homeTarget}
            cta={{ label: ctaLabel, target: ctaTarget }}
            label="Toggle menu"
            buttonClassName="p-2 text-muted-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
