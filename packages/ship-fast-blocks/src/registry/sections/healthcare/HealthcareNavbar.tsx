import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo } from '#/section-kit/Logo.tsx'
import {
  LocalServiceAccountButton,
  LocalServiceBookingButton,
  LocalServiceIntentBadge,
  LocalServiceMobileMenu,
  LocalServiceMutationSpinner,
  LocalServiceSearchButton,
} from '../local-service/local-service-interactions.tsx'
import { localServiceLakebed } from '../local-service/local-service-lakebed.ts'

/**
 * HealthcareNavbar — sticky, translucent top navigation bar for a primary-care
 * / medical-clinic site. A backdrop-blurred, border-bottomed header pinned to
 * the top: a heart-in-tile brand mark beside the clinic name on the left, a
 * horizontal set of nav links in the center (desktop), and a phone-number link
 * plus a solid "Book Appointment" primary CTA on the right. Every link and CTA
 * routes through useNavigate so labels can drive page-switching. Use as the
 * sticky site header for doctors' offices, family-medicine practices,
 * pediatric / women's-health / telehealth clinics, hospitals or medical groups.
 * Renders fully with no props via baked-in "Vitality Health Partners" defaults.
 */
export const HealthcareNavbar = defineCapsule({
  name: 'HealthcareNavbar',
  description:
    "Sticky translucent top navigation bar for a primary-care / medical-clinic site: backdrop-blurred, border-bottomed header pinned to the top with a heart-in-tile brand mark + clinic name on the left, horizontal nav links in the center (desktop), and a phone-number link plus a solid 'Book Appointment' primary CTA on the right. Links and CTA route through useNavigate for page-switching. Use as the sticky site header for doctors' offices, family-medicine practices, pediatric / women's-health / telehealth clinics, hospitals or medical groups.",
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
    const go = useNavigate()
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
          'grid place-items-center rounded-xl bg-primary text-primary-foreground',
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
      <header
        className={cn(
          'sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md',
          props.className,
        )}
      >
        <nav
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          aria-label="Main navigation"
        >
          <div className="flex h-20 items-center justify-between">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-3"
            >
              <BrandLogo
                brand={brand}
                fallback={<HeartMark className="size-10" />}
                labelClassName="text-xl font-semibold text-foreground"
              />
            </button>

            <div className="hidden items-center gap-8 md:flex">
              {nav.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className="font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => go(phone)}
                className="hidden items-center gap-2 text-muted-foreground transition-colors hover:text-foreground lg:flex"
              >
                <svg
                  width="20"
                  height="20"
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
                <span className="font-medium">{phone}</span>
              </button>
              <LocalServiceIntentBadge lakebed={lakebed} />
              <LocalServiceSearchButton
                lakebed={lakebed}
                buttonClassName="hidden size-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:inline-flex"
              />
              <LocalServiceAccountButton
                lakebed={lakebed}
                buttonClassName="hidden size-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:inline-flex"
              />
              <LocalServiceBookingButton
                lakebed={lakebed}
                intentLabel={ctaTarget}
                service={cta}
                source="navbar"
                pendingChildren={
                  <LocalServiceMutationSpinner className="text-primary-foreground" />
                }
                className="inline-flex items-center rounded-lg bg-primary px-5 py-2.5 font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70"
              >
                {cta}
              </LocalServiceBookingButton>
              <LocalServiceMobileMenu
                brand={brand}
                homeTarget={nav[0]}
                nav={nav}
                buttonClassName="inline-flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
              />
            </div>
          </div>
        </nav>
      </header>
    )
  },
})
