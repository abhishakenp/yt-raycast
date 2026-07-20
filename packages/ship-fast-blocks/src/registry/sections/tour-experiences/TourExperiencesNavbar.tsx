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
/** Inline compass brand mark — adventurous, currentColor → theme token. */
function CompassMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m15.5 8.5-2.2 5.3-5.3 2.2 2.2-5.3 5.3-2.2Z"
      />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

/**
 * TourExperiencesNavbar — editorial-wanderlust sticky site header for an
 * adventure / guided-tour brand. Composes the shared SiteNav composite on a
 * hairline-bottomed, backdrop-blurred surface: a compass brand mark beside the
 * wordmark on the left, desktop nav links in the center, and a mono tel: number
 * plus a sharp-cornered mono "Book a Tour" stamp CTA (with press feedback) on
 * the right, collapsing to a real mobile drawer. Every nav label and the CTA
 * route through the shared navigation so labels drive page-switching. Use as the
 * top navigation for tour operators, expedition companies, day-trip outfitters,
 * and travel-experience landing pages. Renders fully with no props via baked-in
 * "Wanderwild Tours" defaults.
 */
export const TourExperiencesNavbar = defineCapsule({
  name: 'TourExperiencesNavbar',
  description:
    "Editorial-wanderlust sticky site header for an adventure / guided-tour brand. Composes the shared SiteNav composite on a hairline-bottomed backdrop-blurred surface — compass brand mark + wordmark on the left, desktop nav links in the center, a mono tel: number, and a sharp-cornered mono 'Book a Tour' stamp CTA with press feedback on the right — collapsing to a real mobile drawer. Every nav label and the CTA route through the shared navigation so labels drive page-switching. Use as the top navigation for tour operators, expedition companies, day-trip outfitters, and travel-experience landing pages.",
  props: z.object({
    /** Brand / company name shown beside the compass mark. */
    brand: z.string().optional(),
    /** Nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Phone number rendered as a tel: link on larger screens. */
    phone: z.string().optional(),
    /** Navigation target for the logo / home click. */
    homeTarget: z.string().optional(),
    /** Pill CTA label on the right. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the pill CTA. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const nav = props.nav?.length
      ? props.nav
      : ['Tours', 'Destinations', 'Pricing', 'Reviews', 'Book a Tour']
    const brand = props.brand ?? 'Wanderwild Tours'
    const phone = props.phone ?? '(415) 555-0188'
    const ctaLabel = props.ctaLabel ?? 'Book a Tour'
    const ctaTarget = props.ctaTarget ?? 'Book a Tour'
    const homeTarget = props.homeTarget ?? nav[0]

    return (
      <SiteNav
        position="fixed"
        height="default"
        className={cn(
          'border-border bg-background/85 backdrop-blur-xl',
          props.className,
        )}
      >
        <NavbarBrand href={homeTarget}>
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              className="size-7"
              fallback={<CompassMark className="size-7 text-primary" />}
            />
            <LogoLabel className="text-xl font-semibold tracking-tight text-foreground" />
          </BrandLogo>
        </NavbarBrand>
        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink key={label} href={label} className="text-sm">
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>
        <NavbarActions>
          {phone ? (
            <a
              href={`tel:${phone.replace(/[^\d+]/g, '')}`}
              className="hidden font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground lg:inline"
            >
              {phone}
            </a>
          ) : null}
          <NavbarCta
            variant="primary-pill"
            className="hidden rounded-none px-5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] transition-[background-color,transform] duration-150 active:translate-y-px sm:inline-flex"
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
