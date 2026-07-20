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
const PawMark = ({ className }: { className?: string }) => (
  <span
    className={cn(
      'grid place-items-center rounded-full bg-primary text-primary-foreground',
      className,
    )}
    aria-hidden="true"
  >
    <svg
      width="58%"
      height="58%"
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
    "Warm friendly-clinical sticky navigation header for a veterinary clinic / pet-healthcare site, composing the shared SiteNav kit composite behind a backdrop-blurred bar. A friendly round primary smiley-glyph brand tile sits beside the clinic wordmark; the desktop link row (Services, Pricing, Our Team, Reviews, Contact) uses quiet muted labels; on the right an optional click-to-call phone number and a chunky rounded-full filled-primary 'Book Appointment' CTA with a hard offset shadow and press feedback — with a real mobile drawer on small screens. All links and the CTA route via SiteNav's route hrefs wiring. Use it as the sticky site header for veterinary clinics, animal hospitals, pet healthcare practices, vet offices, or emergency animal care.",
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

    return (
      <SiteNav
        position="fixed"
        height="default"
        className={cn('bg-background/90 backdrop-blur-md', props.className)}
      >
        <NavbarBrand href={homeTarget} className="shrink-0 gap-2 text-left">
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              className="size-9"
              fallback={<PawMark className="size-9" />}
            />
            <LogoLabel className="whitespace-nowrap text-lg font-bold tracking-tight text-foreground" />
          </BrandLogo>
        </NavbarBrand>
        <NavbarNav className="gap-6">
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
        <NavbarActions className="gap-3">
          {phone ? (
            <a
              href={`tel:${phone.replace(/[^\d+]/g, '')}`}
              className="hidden shrink-0 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.12em] tabular-nums text-muted-foreground transition-colors hover:text-foreground lg:inline"
            >
              {phone}
            </a>
          ) : null}
          <NavbarCta
            variant="primary-pill"
            className="hidden rounded-full px-5 py-2.5 text-sm font-semibold shadow-[3px_3px_0_0] shadow-foreground/20 transition-colors hover:bg-primary active:translate-y-px active:shadow-none sm:inline-flex"
            href={ctaTarget}
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
