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
 * LogisticsNavbar — sticky, backdrop-blurred top navigation bar for a global-
 * logistics / freight-forwarding company. A border-bottomed header pinned to the
 * top: a bolt-mark brand tile + wordmark on the left, a horizontal set of nav
 * links in the center (desktop), and a rounded primary CTA on the right, with a
 * hamburger menu button on mobile. Clean, corporate and trust-forward on a light
 * surface with a deep slate primary. Every link and the CTA route through
 * useNavigate so labels can drive page-switching. Use as the sticky site header
 * for logistics providers, freight forwarders, shipping carriers, courier,
 * warehousing, customs-brokerage or cargo/transport companies. Renders fully with
 * no props via baked-in "SwiftFreight" defaults.
 */
export const LogisticsNavbar = defineCapsule({
  name: 'LogisticsNavbar',
  description:
    'Sticky, backdrop-blurred top navigation bar for a global-logistics / freight-forwarding company: a border-bottomed header pinned to the top with a bolt-mark brand tile + wordmark on the left, horizontal nav links in the center (desktop), and a rounded primary CTA on the right, plus a hamburger menu on mobile. Clean, corporate and trust-forward on a light surface with a deep slate primary. Links and CTA route through useNavigate for page-switching. Use as the sticky site header for logistics providers, freight forwarders, shipping carriers, courier, warehousing, customs-brokerage, supply-chain, fulfillment or cargo/transport companies.',
  props: z.object({
    /** Brand / company name shown beside the mark. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (should match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Rounded primary CTA label on the right. */
    cta: z.string().optional(),
    /** Navigation target for the CTA button. */
    ctaTarget: z.string().optional(),
    /** Navigation target for the brand mark and mobile menu button. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'SwiftFreight'
    const nav = props.nav?.length
      ? props.nav
      : ['Services', 'Track', 'About', 'Pricing', 'Contact']
    const cta = props.cta ?? 'Get a Quote'
    const ctaTarget = props.ctaTarget ?? cta
    const homeTarget = props.homeTarget ?? nav[0] ?? 'Services'
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        <svg
          className="size-[60%]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </span>
    )
    return (
      <SiteNav
        position="sticky"
        height="responsive"
        className={cn('bg-background/95', props.className)}
      >
        <NavbarBrand asChild>
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="gap-2"
          >
            <BrandLogo
              brand={brand}
              fallback={<LogoMark className="size-8" />}
              labelClassName="text-xl font-semibold tracking-tight"
            />
          </button>
        </NavbarBrand>

        <NavbarNav breakpoint="lg">
          {nav.map((label) => (
            <NavbarNavLink key={label} onClick={() => go(label)}>
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="gap-4">
          <NavbarCta
            variant="primary"
            onClick={() => go(ctaTarget)}
            className="hidden sm:inline-flex"
          >
            {cta}
          </NavbarCta>
          <MobileNavDrawer
            brand={brand}
            nav={nav}
            homeTarget={homeTarget}
            cta={{
              label: cta,
              target: ctaTarget,
            }}
            buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground lg:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
