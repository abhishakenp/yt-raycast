import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import { MobileNavDrawer } from '#/section-kit/MobileNavDrawer.tsx'
import {
  NavbarActions,
  NavbarBrand,
  NavbarCta,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/index.ts'

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
 * TourExperiencesNavbar — sticky site header for an adventure / guided-tour
 * brand. Composes the shared SiteNav composite (brand mark + name, desktop nav
 * links, phone, a pill "Book a Tour" CTA, and a real mobile drawer) with vivid,
 * travel-ready defaults. Every nav label and the CTA route through the shared
 * navigation so labels drive page-switching. Use as the top navigation for tour
 * operators, expedition companies, day-trip outfitters, and travel-experience
 * landing pages. Renders fully with no props via baked-in "Wanderwild Tours"
 * defaults.
 */
export const TourExperiencesNavbar = defineCapsule({
  name: 'TourExperiencesNavbar',
  description:
    "Sticky site header for an adventure / guided-tour brand. Composes the shared SiteNav composite — inline compass brand mark + name, desktop nav links, phone, a pill 'Book a Tour' CTA, and a real mobile drawer — with vivid travel-ready defaults. Every nav label and the CTA route through the shared navigation so labels drive page-switching. Use as the top navigation for tour operators, expedition companies, day-trip outfitters, and travel-experience landing pages.",
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
    const go = useNavigate()
    const brand = props.brand ?? 'Wanderwild Tours'
    const brandMark = <CompassMark className="size-8 text-primary" />
    const brandClassName = 'text-xl font-medium text-foreground'
    const phone = props.phone ?? '(415) 555-0188'
    const ctaLabel = props.ctaLabel ?? 'Book a Tour'
    const ctaTarget = props.ctaTarget ?? 'Book a Tour'
    const homeTarget = props.homeTarget ?? nav[0]

    return (
      <SiteNav position="fixed" height="default" className={props.className}>
        <NavbarBrand asChild>
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="gap-3"
          >
            {brandMark}
            <Logo brand={brand}>
              <LogoImage />
              <LogoLabel className={brandClassName} />
            </Logo>
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
          {phone ? (
            <a
              href={`tel:${phone.replace(/[^\d+]/g, '')}`}
              className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline"
            >
              {phone}
            </a>
          ) : null}
          <NavbarCta
            variant="primary-pill"
            className="hidden px-5 py-2.5 sm:inline-flex"
            onClick={() => go(ctaTarget)}
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
