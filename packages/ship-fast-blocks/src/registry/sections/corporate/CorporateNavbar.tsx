import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo } from '#/section-kit/Logo.tsx'
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
 * CorporateNavbar — sticky translucent top navigation bar for an enterprise /
 * corporate B2B marketing site. A backdrop-blurred, border-bottomed header pinned
 * to the top with a solid brand-initial logo tile + company name on the left,
 * horizontal nav links on the right (desktop), a secondary text link plus a
 * filled primary "Request Demo" CTA, and a hamburger menu button on mobile.
 * Every link and CTA routes through useNavigate. Use as the sticky site header
 * for enterprise software vendors, SaaS platforms, IT consultancies, or any
 * corporate site that needs gravitas and clear conversion paths.
 */
export const CorporateNavbar = defineCapsule({
  name: 'CorporateNavbar',
  description:
    'Sticky translucent top navigation bar for an enterprise / corporate B2B site: backdrop-blurred, border-bottomed header with a solid brand-initial logo tile + company name on the left, horizontal nav links and a secondary text link plus a filled primary CTA on the right (desktop), and a hamburger menu button on mobile. All links and CTAs route through useNavigate. Use as the sticky site header for enterprise software, SaaS, IT consultancies, or any corporate site.',
  props: z.object({
    /** Brand / company name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Top-level navbar link labels. */
    nav: z.array(z.string()).optional(),
    /** Label shown on the primary filled CTA button. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the primary CTA button (go(label)). */
    ctaTarget: z.string().optional(),
    /** Label + target for the secondary text link beside the CTA. */
    secondaryCta: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Nexus'
    const nav = props.nav?.length
      ? props.nav
      : ['Solutions', 'Customers', 'Pricing', 'Investors', 'Company']
    const ctaLabel = props.ctaLabel ?? 'Request Demo'
    const ctaTarget = props.ctaTarget ?? 'Schedule a Demo'
    const secondaryCta = props.secondaryCta ?? 'Explore Solutions'
    const LogoMark = ({ className, inverse }) => (
      <span
        className={cn(
          'grid place-items-center rounded-lg font-bold',
          inverse
            ? 'bg-background text-foreground'
            : 'bg-foreground text-background',
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
        <NavbarBrand asChild>
          <button type="button" onClick={() => go(nav[0])} className="gap-2">
            <BrandLogo
              brand={brand}
              fallback={<LogoMark className="size-8 text-sm" />}
              labelClassName="text-lg font-semibold tracking-tight"
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
          <button
            type="button"
            onClick={() => go(secondaryCta)}
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            {secondaryCta}
          </button>
          <NavbarCta variant="primary" onClick={() => go(ctaTarget)}>
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
