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
import { SignInButton } from '#/section-kit/SignInButton.tsx'
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
    "Vintage-lite editorial sticky header for a barbershop / salon built on the shared SiteNav composite. A backdrop-blurred, hairline-bordered bar pairs a square scissors logo tile and a warm serif wordmark on the left with mono uppercase signage nav links on the right, a quiet tap-to-call phone number, and a sharp square primary booking CTA with press feedback, plus a real mobile drawer. Use it as the top-of-page header for any barbershop, salon, or men's grooming site, or as the global nav band when composing a multi-page grooming experience.",
  props: z.object({
    brand: z.string().optional(),
    nav: z.array(z.string()).optional(),
    phone: z.string().optional(),
    homeTarget: z.string().optional(),
    ctaLabel: z.string().optional(),
    ctaTarget: z.string().optional(),
    /** Label for the sign-in button. */
    signIn: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const nav = props.nav?.length
      ? props.nav
      : ['Services', 'Gallery', 'Team', 'Pricing']
    const brand = props.brand ?? 'Fade & Co.'
    const phone = props.phone ?? '(212) 555-0147'
    const ctaLabel = props.ctaLabel ?? 'Book Now'
    const ctaTarget = props.ctaTarget ?? 'Pricing'
    const homeTarget = props.homeTarget ?? nav[0]
    const signIn = props.signIn ?? 'Sign in'

    const LogoBadge = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center border border-foreground/25 bg-background text-foreground',
          className,
        )}
        aria-hidden="true"
      >
        <Mark className="size-4" />
      </span>
    )

    return (
      <SiteNav position="fixed" height="default" className={props.className}>
        <NavbarBrand href={homeTarget} className="gap-2.5">
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              className="size-7"
              fallback={<LogoBadge className="size-7" />}
            />
            <LogoLabel className="font-serif text-xl font-semibold tracking-tight" />
          </BrandLogo>
        </NavbarBrand>
        <NavbarNav className="gap-7">
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>
        <NavbarActions className="gap-3">
          <SignInButton
            variant="ghost"
            label={signIn}
            className="hidden sm:block"
          />
          {phone ? (
            <a
              href={`tel:${phone.replace(/[^\d+]/g, '')}`}
              className="hidden font-mono text-xs tracking-[0.08em] text-muted-foreground transition-colors hover:text-foreground lg:inline"
            >
              {phone}
            </a>
          ) : null}
          <NavbarCta
            variant="primary-pill"
            className="hidden rounded-none px-5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] transition-[transform,background-color] duration-150 active:translate-y-px sm:inline-flex"
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
