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
} from '#/section-kit/SiteNav.tsx'
/**
 * ConsultingNavbar — Swiss-authority sticky top navigation bar for a
 * management-consulting firm site. A hairline border-bottomed, backdrop-blurred
 * header with a square primary index tile carrying the brand initial + a
 * tight-tracked serif firm wordmark on the left, mono uppercase nav links in
 * the center (desktop, secondary items hidden below xl to keep the bar
 * uncrowded), and a square-edged ink CTA button with press feedback on the
 * right beside the hamburger drawer. The logo and every link route through
 * route hrefs for page-switching. Use as the site header for consulting firms,
 * professional-services groups, corporate advisories, or B2B service
 * businesses. Renders fully with no props via baked-in "Nexus Strategy
 * Partners" defaults.
 */
export const ConsultingNavbar = defineCapsule({
  name: 'ConsultingNavbar',
  description:
    'Swiss-authority sticky navigation bar for a management-consulting firm site: a hairline border-bottomed, backdrop-blurred header with a square primary brand-initial tile + serif firm wordmark on the left, mono uppercase nav links in the center (desktop, later items hidden below xl), and a square-edged ink CTA button with press feedback plus a hamburger drawer on the right. Every link and the logo route through route hrefs for page-switching. Use as the site header for consulting firms, professional-services groups, corporate advisories, or B2B service businesses.',
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
          'grid place-items-center rounded-none bg-primary font-serif font-bold text-primary-foreground',
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
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              className="size-8"
              fallback={<LogoMark className="size-8 text-base" />}
            />
            <LogoLabel className="font-serif text-lg font-bold tracking-tight text-foreground" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav className="gap-7">
          {nav.map((label, i) => (
            <NavbarNavLink
              key={label}
              href={label}
              className={cn(
                'font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground active:translate-y-px',
                i >= 4 && 'hidden xl:inline-flex',
              )}
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions>
          <NavbarCta
            variant="dark"
            href={ctaTarget}
            className="hidden rounded-none px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-all duration-150 active:translate-y-px sm:inline-flex"
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
