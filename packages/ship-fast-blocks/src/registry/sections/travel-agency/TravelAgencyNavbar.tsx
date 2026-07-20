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
function CompassMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5l-2 5-5 2 2-5z" />
    </svg>
  )
}

export const TravelAgencyNavbar = defineCapsule({
  name: 'TravelAgencyNavbar',
  description:
    "Fixed, backdrop-blurred editorial-wanderlust navigation header for the Travel Agency page family. Composes the shared SiteNav kit composite: a compass brandmark beside the wordmark on the left, a set of mono-lettered uppercase destination links revealed at large widths, and a right cluster carrying an advisor phone number (widescreen only) plus a sharp-cornered mono 'Plan a Trip' CTA with press feedback, collapsing to a real Sheet drawer on smaller screens. Nav links preserve route-based page switching. Use as the first band of a curated travel-agency / destination-catalog site or whenever a generated travel site needs a polished, token-styled top navigation without hand-rolled markup.",
  props: z.object({
    brand: z.string().optional(),
    nav: z.array(z.string()).optional(),
    phone: z.string().optional(),
    homeTarget: z.string().optional(),
    ctaLabel: z.string().optional(),
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const nav = props.nav?.length
      ? props.nav
      : ['Destinations', 'Flights', 'Hotels', 'Packages', 'Plan a Trip']
    const brand = props.brand ?? 'Voyage & Co'
    const phone = props.phone ?? '+1 (800) 555-0182'
    const ctaLabel = props.ctaLabel ?? 'Plan a Trip'
    const ctaTarget = props.ctaTarget ?? 'Plan a Trip'
    const homeTarget = props.homeTarget ?? nav[0]

    return (
      <SiteNav
        position="fixed"
        height="default"
        className={cn(
          'border-border bg-background/90 backdrop-blur-xl',
          props.className,
        )}
      >
        <NavbarBrand href={homeTarget}>
          <BrandLogo brand={brand} className="flex items-center gap-2.5">
            <LogoImage
              className="size-7"
              fallback={<CompassMark className="size-7 text-primary" />}
            />
            <LogoLabel className="text-lg font-semibold tracking-tight text-foreground" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav breakpoint="lg">
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="rounded-none px-1.5 font-mono text-[11px] uppercase tracking-[0.16em]"
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions>
          {phone ? (
            <a
              href={`tel:${phone.replace(/[^\d+]/g, '')}`}
              className="hidden font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground xl:inline"
            >
              {phone}
            </a>
          ) : null}
          <NavbarCta
            variant="primary"
            className="hidden rounded-none px-5 py-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.18em] transition-[background-color,transform] duration-150 active:translate-y-px sm:inline-flex"
            href={ctaTarget}
          >
            {ctaLabel}
          </NavbarCta>
          <MobileNavDrawer
            brand={brand}
            nav={nav}
            homeTarget={homeTarget}
            cta={{ label: ctaLabel, target: ctaTarget }}
            buttonClassName="p-2 text-muted-foreground hover:text-foreground lg:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
