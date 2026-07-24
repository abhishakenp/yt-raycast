import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import {
  NavbarActions,
  NavbarBrand,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/SiteNav.tsx'
import {
  LocalServiceAccountButton,
  LocalServiceBookingButton,
  LocalServiceMobileMenu,
  LocalServiceMutationSpinner,
  LocalServiceSearchButton,
} from '../local-service/local-service-interactions.tsx'
import { localServiceLakebed } from '../local-service/local-service-lakebed.ts'

/**
 * HealthcareNavbar — calm Swiss-clinical sticky navigation for a primary-care /
 * medical-clinic site. A backdrop-blurred, hairline border-bottomed header
 * pinned to the top: a square rounded-none primary heart-glyph logo tile beside
 * the clinic wordmark on the left, quiet muted nav links (desktop), and on the
 * right a hairline click-to-call phone link, square hairline search / account
 * chips, and a square filled-primary "Book Appointment" CTA with press
 * feedback; a hamburger opens the mobile drawer. Every link and CTA routes
 * through route hrefs so labels can drive page-switching. Use as the sticky
 * site header for doctors' offices, family-medicine practices, pediatric /
 * women's-health / telehealth clinics, hospitals or medical groups. Renders
 * fully with no props via baked-in "Vitality Health Partners" defaults.
 */
export const HealthcareNavbar = defineCapsule({
  name: 'HealthcareNavbar',
  description:
    "Calm Swiss-clinical sticky navigation bar for a primary-care / medical-clinic site: a backdrop-blurred, hairline border-bottomed header with a square rounded-none primary heart-glyph logo tile + clinic wordmark on the left, quiet muted nav links (desktop), and a hairline click-to-call phone link, square hairline search / account chips, and a square filled-primary 'Book Appointment' CTA with press feedback on the right; a hamburger opens the mobile drawer. Links and CTA route through route hrefs for page-switching. Use as the sticky site header for doctors' offices, family-medicine practices, pediatric / women's-health / telehealth clinics, hospitals or medical groups.",
  props: z.object({
    /** Clinic / practice name shown beside the brand mark. */
    brand: z.string().optional(),
    /** Top-level nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Phone number shown beside the nav and used as its call link. */
    phone: z.string().optional(),
    /** Solid primary CTA label on the right. */
    cta: z.string().optional(),
    /** Navigation target for the primary CTA. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: localServiceLakebed,
  component: ({ props, lakebed }) => {
    const brand = props.brand ?? 'Vitality Health Partners'
    const nav = props.nav?.length
      ? props.nav
      : ['Services', 'Doctors', 'Reviews', 'Pricing', 'FAQ']
    const phone = props.phone ?? '(415) 555-1234'
    const cta = props.cta ?? 'Book Appointment'
    const ctaTarget = props.ctaTarget ?? 'Schedule Your Visit'
    const HeartMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-none bg-primary text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="60%"
          height="60%"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </span>
    )
    return (
      <SiteNav
        position="sticky"
        height="default"
        className={cn('bg-background/90 backdrop-blur-md', props.className)}
      >
        <NavbarBrand href={nav[0]} className="shrink-0 gap-3 text-left">
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              className="size-7"
              fallback={<HeartMark className="size-7" />}
            />
            <LogoLabel className="whitespace-nowrap text-lg font-bold tracking-tight text-foreground" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav
          breakpoint="lg"
          className="shrink-0 gap-6 [&>button]:font-medium"
        >
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="shrink-0 gap-2">
          <a
            href={`tel:${phone.replace(/[^\d+]/g, '')}`}
            className="hidden shrink-0 items-center gap-2 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground 2xl:flex"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="tabular-nums">{phone}</span>
          </a>
          <LocalServiceSearchButton
            lakebed={lakebed}
            buttonClassName="hidden size-9 items-center justify-center rounded-none border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:translate-y-px xl:inline-flex"
          />
          <LocalServiceAccountButton
            lakebed={lakebed}
            buttonClassName="hidden size-9 items-center justify-center rounded-none border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:translate-y-px xl:inline-flex"
          />
          <LocalServiceBookingButton
            lakebed={lakebed}
            intentLabel={ctaTarget}
            service={cta}
            source="navbar"
            pendingChildren={
              <LocalServiceMutationSpinner className="text-primary-foreground" />
            }
            className="inline-flex shrink-0 items-center rounded-none bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
          >
            {cta}
          </LocalServiceBookingButton>
          <LocalServiceMobileMenu
            brand={brand}
            homeTarget={nav[0]}
            nav={nav}
            buttonClassName="inline-flex size-9 items-center justify-center rounded-none border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:translate-y-px lg:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
