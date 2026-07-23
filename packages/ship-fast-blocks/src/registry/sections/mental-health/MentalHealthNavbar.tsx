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
import { SignInButton } from '#/section-kit/SignInButton.tsx'
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
 * MentalHealthNavbar — a calm, warm-editorial sticky header for a therapy /
 * counseling / mental-health practice site. A backdrop-blurred, hairline-bordered
 * bar pins to the top with a soft "sun/wellness" glyph beside a serif practice
 * wordmark on the left, quiet nav links on the right (desktop), a square
 * filled-primary "Book Session" CTA with press feedback, square hairline
 * search / account chips, and a hamburger toggle on mobile. Restrained, airy,
 * sage-and-sand wellness aesthetic — a warmer sibling of the clinical
 * dental / healthcare headers. Every link and CTA routes through route hrefs.
 * Use as the sticky site header for therapists, counselors, psychologists,
 * psychiatrists, wellness centers, telehealth or behavioral-health practices.
 */
export const MentalHealthNavbar = defineCapsule({
  name: 'MentalHealthNavbar',
  description:
    "Calm, warm-editorial sticky header for a therapy / counseling / mental-health practice site: a backdrop-blurred, hairline-bordered bar with a soft 'sun/wellness' glyph beside a serif practice wordmark on the left, quiet nav links on the right (desktop), a square filled-primary 'Book Session' CTA with press feedback, square hairline search / account chips, and a mobile hamburger toggle. Restrained, airy, sage-and-sand wellness aesthetic — a warmer sibling of the clinical dental / healthcare headers. All links and CTAs route through route hrefs. Use as the sticky site header for therapists, counselors, psychologists, psychiatrists, wellness centers, telehealth or behavioral-health practices.",
  props: z.object({
    /** Practice / brand name shown beside the logo. */
    brand: z.string().optional(),
    /** Top-level navbar link labels; the last item becomes the primary CTA. */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the brand logo + mobile menu button (e.g. nav[0]). */
    homeTarget: z.string().optional(),
    /** Label + target for the primary "Book Session" CTA button. */
    bookLabel: z.string().optional(),
    /** Label for the sign-in button. */
    signIn: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: localServiceLakebed,
  component: ({ props, lakebed }) => {
    const brand = props.brand ?? 'Stillpoint'
    const nav = props.nav?.length
      ? props.nav
      : ['Services', 'Approach', 'Team', 'Pricing', 'FAQ', 'Book Session']
    const homeTarget = props.homeTarget ?? nav[0] ?? 'Services'
    const bookLabel = props.bookLabel ?? nav[nav.length - 1] ?? 'Book Session'
    const signIn = props.signIn ?? 'Sign in'

    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    )

    return (
      <SiteNav
        position="sticky"
        height="compact"
        className={cn('bg-background/80 backdrop-blur-md', props.className)}
        containerClassName="max-w-6xl px-4 sm:px-6 lg:px-8"
      >
        <NavbarBrand href={homeTarget} className="text-left">
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              className="size-7"
              fallback={<LogoMark className="size-7 text-primary" />}
            />
            <LogoLabel className="font-serif text-xl font-medium tracking-tight text-foreground" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav className="gap-8 [&>button]:font-medium">
          {nav.slice(0, -1).map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </NavbarNavLink>
          ))}
          <LocalServiceBookingButton
            lakebed={lakebed}
            intentLabel={bookLabel}
            service="Therapy session"
            source="navbar"
            pendingChildren={
              <LocalServiceMutationSpinner className="text-primary-foreground" />
            }
            className="rounded-none bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
          >
            {bookLabel}
          </LocalServiceBookingButton>
        </NavbarNav>

        <NavbarActions className="gap-2">
          <SignInButton
            variant="ghost"
            label={signIn}
            className="hidden sm:block"
          />
          <LocalServiceIntentBadge lakebed={lakebed} />
          <LocalServiceSearchButton
            lakebed={lakebed}
            buttonClassName="hidden size-9 items-center justify-center rounded-none border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:translate-y-px md:inline-flex"
          />
          <LocalServiceAccountButton
            lakebed={lakebed}
            buttonClassName="hidden size-9 items-center justify-center rounded-none border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:translate-y-px md:inline-flex"
          />
          <LocalServiceMobileMenu
            brand={brand}
            homeTarget={homeTarget}
            nav={nav}
            buttonClassName="inline-flex size-9 items-center justify-center rounded-none border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:translate-y-px md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
