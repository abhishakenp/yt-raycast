import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
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
    "Premium, wanderlust-themed navigation header for the Travel Agency page family. Composes the shared SiteNav kit composite with a travel-forward brand, compass brandmark, destination-led links, a contact phone, and a prominent 'Plan a Trip' call to action. Use as the first band of a travel agency page or whenever a generated travel site needs a polished, token-styled top navigation without hand-rolled markup.",
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
    const brandMark = <CompassMark className="size-8 text-primary" />
    const brandClassName = 'text-xl font-medium text-foreground'
    const phone = props.phone ?? '+1 (800) 555-0182'
    const ctaLabel = props.ctaLabel ?? 'Plan a Trip'
    const ctaTarget = props.ctaTarget ?? 'Plan a Trip'
    const homeTarget = props.homeTarget ?? nav[0]

    return (
      <SiteNav position="fixed" height="default" className={props.className}>
        <NavbarBrand href={homeTarget} className="gap-3">
          {brandMark}
          <Logo brand={brand}>
            <LogoImage />
            <LogoLabel className={brandClassName} />
          </Logo>
        </NavbarBrand>
        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink key={label} href={label}>
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
