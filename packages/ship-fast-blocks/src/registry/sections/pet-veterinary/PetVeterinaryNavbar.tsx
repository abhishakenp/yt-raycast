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

const brandMark = (
  <span
    className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground"
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
      <path d="M14.828 14.828a4 4 0 0 1-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
    </svg>
  </span>
)

export const PetVeterinaryNavbar = defineCapsule({
  name: 'PetVeterinaryNavbar',
  description:
    "Warm, caring navigation header for a veterinary clinic / pet-healthcare site, composing the shared SiteNav kit composite. Renders a friendly paw-glyph brand mark in a rounded primary tile, the clinic wordmark, a desktop link row (Services, Pricing, Our Team, Reviews, Contact), an optional click-to-call phone number, and a filled primary 'Book Appointment' CTA — with a real mobile drawer on small screens. All links and the CTA route via SiteNav's useNavigate wiring. Use it as the sticky site header for veterinary clinics, animal hospitals, pet healthcare practices, vet offices, or emergency animal care.",
  props: z.object({
    /** Clinic / brand name shown beside the paw mark. */
    brand: z.string().optional(),
    /** Top-level navbar link labels. */
    nav: z.array(z.string()).optional(),
    /** Click-to-call phone number shown on the right (desktop). */
    phone: z.string().optional(),
    /** Filled primary pill CTA label on the right. */
    cta: z.string().optional(),
    /** Route target for the CTA (defaults to "Contact"). */
    ctaTarget: z.string().optional(),
    /** Route target for the brand / home click. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Paws & Care'
    const nav = props.nav?.length
      ? props.nav
      : ['Services', 'Pricing', 'Our Team', 'Reviews', 'Contact']
    const cta = props.cta ?? 'Book Appointment'
    const ctaTarget = props.ctaTarget ?? 'Contact'
    const phone = props.phone ?? '(555) 123-4567'
    const homeTarget = props.homeTarget ?? nav[0]
    const go = useNavigate()

    return (
      <SiteNav position="fixed" height="default" className={props.className}>
        <NavbarBrand asChild>
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="gap-3"
          >
            {brandMark}
            <Logo brand={brand} labelClassName="font-semibold" />
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
            {cta}
          </NavbarCta>
          <MobileNavDrawer
            brand={brand}
            nav={nav}
            homeTarget={homeTarget}
            cta={{ label: cta, target: ctaTarget }}
            buttonClassName="p-2 text-muted-foreground hover:text-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
