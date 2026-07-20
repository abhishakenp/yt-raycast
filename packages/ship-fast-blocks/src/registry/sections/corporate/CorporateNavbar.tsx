import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import { MobileNavDrawer } from '#/section-kit/MobileNavDrawer.tsx'
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
 * CorporateNavbar — Swiss-corporate sticky top navigation bar for an
 * enterprise / corporate B2B marketing site. A backdrop-blurred, hairline
 * border-bottomed header pinned to the top: a square (rounded-none)
 * brand-initial ink tile + company wordmark on the left, compact horizontal
 * nav links on the right (desktop), a secondary text link (hidden below xl to
 * keep the bar uncrowded) plus a square-edged filled primary "Request Demo"
 * CTA with press feedback, and a hamburger menu button on mobile. Every link
 * and CTA routes through route hrefs. Use as the sticky site header for
 * enterprise software vendors, SaaS platforms, IT consultancies, or any
 * corporate site that needs gravitas and clear conversion paths.
 */
export const CorporateNavbar = defineCapsule({
  name: 'CorporateNavbar',
  description:
    'Swiss-corporate sticky top navigation bar for an enterprise / corporate B2B site: backdrop-blurred, hairline border-bottomed header with a square brand-initial ink tile + company wordmark on the left, compact horizontal nav links and a secondary text link (hidden below xl) plus a square-edged filled primary CTA with press feedback on the right (desktop), and a hamburger menu button on mobile. All links and CTAs route through route hrefs. Use as the sticky site header for enterprise software, SaaS, IT consultancies, or any corporate site.',
  props: z.object({
    /** Brand / company name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Top-level navbar link labels. */
    nav: z.array(z.string()).optional(),
    /** Label shown on the primary filled CTA button. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the primary CTA button (href target). */
    ctaTarget: z.string().optional(),
    /** Label + target for the secondary text link beside the CTA. */
    secondaryCta: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Nexus'
    const nav = props.nav?.length
      ? props.nav
      : ['Solutions', 'Customers', 'Pricing', 'Investors', 'Company']
    const ctaLabel = props.ctaLabel ?? 'Request Demo'
    const ctaTarget = props.ctaTarget ?? 'Schedule a Demo'
    const secondaryCta = props.secondaryCta ?? 'Explore Solutions'
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-none bg-foreground font-bold text-background',
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
        height="responsive"
        className={cn('bg-background/95', props.className)}
      >
        <NavbarBrand href={nav[0]} className="gap-2">
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              className="size-7 rounded-none"
              fallback={<LogoMark className="size-7 text-sm" />}
            />
            <LogoLabel className="text-lg font-semibold tracking-tight" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav className="gap-1">
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="rounded-none text-[13px]"
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="gap-3">
          <NavbarRouteLink
            href={secondaryCta}
            className="hidden whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground xl:inline-flex"
          >
            {secondaryCta}
          </NavbarRouteLink>
          <NavbarCta
            variant="primary"
            href={ctaTarget}
            className="rounded-none transition-all duration-150 active:translate-y-px"
          >
            {ctaLabel}
          </NavbarCta>
          <MobileNavDrawer
            brand={brand}
            nav={nav}
            homeTarget={nav[0]}
            cta={{
              label: ctaLabel,
              target: ctaTarget,
            }}
            buttonClassName="p-2 text-muted-foreground hover:text-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
