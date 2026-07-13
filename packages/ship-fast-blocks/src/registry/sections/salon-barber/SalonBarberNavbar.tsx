import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo } from '#/section-kit/Logo.tsx'
import { MobileNavDrawer } from '#/section-kit/MobileNavDrawer.tsx'
import {
  NavbarActions,
  NavbarBrand,
  NavbarCta,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/index.ts'

function Mark({ className }: { className?: string }) {
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
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M8.12 8.12 20 20" />
      <path d="M8.12 15.88 20 4" />
      <line x1="14.8" y1="14.8" x2="20" y2="20" />
    </svg>
  )
}

export const SalonBarberNavbar = defineCapsule({
  name: 'SalonBarberNavbar',
  description:
    "Sticky barbershop / salon header built on the shared SiteNav composite. Renders a confident grooming brand with a scissors brand mark, desktop nav links, a tap-to-call phone number, and a primary booking CTA, plus a real mobile drawer. Use it as the top-of-page header for any barbershop, salon, or men's grooming site, or as the global nav band when composing a multi-page grooming experience.",
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
      : ['Services', 'Gallery', 'Team', 'Pricing']
    const go = useNavigate()
    const brand = props.brand ?? 'Fade & Co.'
    const brandMark = <Mark className="size-8 text-primary" />
    const brandClassName = 'text-xl font-semibold tracking-tight'
    const phone = props.phone ?? '(212) 555-0147'
    const ctaLabel = props.ctaLabel ?? 'Book Now'
    const ctaTarget = props.ctaTarget ?? 'Pricing'
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
            <Logo brand={brand} labelClassName={brandClassName} />
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
