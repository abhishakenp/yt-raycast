import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo } from '#/section-kit/Logo.tsx'
import {
  NavbarActions,
  NavbarBrand,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/index.ts'
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
 * CleaningServiceNavbar — sticky, translucent top navigation bar for a home-cleaning / maid-service landing page. A blurred, border-bottomed header pinned to the top with a brand sparkle-mark logo tile + company name on the left, a horizontal row of service-section nav links on the desktop center, and a phone number + pill-shaped "Book Cleaning" CTA on the right. Every brand click, nav link, phone button, and CTA routes through useNavigate. Use as the sticky site header for residential cleaning companies, maid services, housekeeping platforms, janitorial businesses, or any local home-service brand. Renders fully with no props via baked-in "PureSpace" defaults.
 */
export const CleaningServiceNavbar = defineCapsule({
  name: 'CleaningServiceNavbar',
  description:
    "Sticky translucent top navigation bar for a home-cleaning / maid-service landing page: blurred border-bottomed header with a brand sparkle-mark logo tile + company name on the left, horizontal nav links on desktop center, and a phone number + pill-shaped 'Book Cleaning' CTA on the right. Brand click, nav links, phone button, and CTA route through useNavigate. Use as the sticky site header for residential cleaning companies, maid services, housekeeping, janitorial, or local home-service brands.",
  props: z.object({
    /** Brand / company name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Nav link labels mapped to section routes. */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the brand logo click. */
    homeTarget: z.string().optional(),
    /** Label on the pill-shaped primary CTA button. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the primary CTA button. */
    ctaTarget: z.string().optional(),
    /** Phone number displayed and routed via the phone button. */
    phone: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: localServiceLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'PureSpace'
    const nav = props.nav?.length
      ? props.nav
      : ['Services', 'How It Works', 'Pricing', 'Reviews', 'FAQ']
    const homeTarget = props.homeTarget ?? nav[0]
    const ctaLabel = props.ctaLabel ?? 'Book Cleaning'
    const ctaTarget = props.ctaTarget ?? 'Book Your Cleaning'
    const phone = props.phone ?? '(555) 123-4567'
    const SparkleMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-lg bg-primary text-primary-foreground',
          className,
        )}
        aria-hidden="true"
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
        >
          <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      </span>
    )
    const PhoneIcon = ({ className }: { className?: string }) => (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    )
    return (
      <SiteNav
        position="sticky"
        height="responsive"
        className={cn('bg-background/95', props.className)}
      >
        <NavbarBrand asChild>
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="gap-2"
          >
            <BrandLogo
              brand={brand}
              fallback={<SparkleMark className="size-8" />}
              labelClassName="text-xl font-semibold tracking-tight text-foreground"
            />
          </button>
        </NavbarBrand>

        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink key={label} onClick={() => go(label)}>
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="gap-3">
          <LocalServiceIntentBadge lakebed={lakebed} />
          <LocalServiceSearchButton
            lakebed={lakebed}
            buttonClassName="hidden size-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:inline-flex"
          />
          <LocalServiceAccountButton
            lakebed={lakebed}
            buttonClassName="hidden size-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:inline-flex"
          />
          <button
            type="button"
            onClick={() => go(phone)}
            className="hidden items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:flex"
          >
            <PhoneIcon className="size-4" />
            {phone}
          </button>
          <LocalServiceBookingButton
            lakebed={lakebed}
            intentLabel={ctaTarget}
            service={ctaLabel}
            source="navbar"
            pendingChildren={
              <LocalServiceMutationSpinner className="text-primary-foreground" />
            }
            className="hidden items-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70 sm:inline-flex"
          >
            {ctaLabel}
          </LocalServiceBookingButton>
          <LocalServiceMobileMenu
            brand={brand}
            homeTarget={homeTarget}
            nav={nav}
            buttonClassName="inline-flex size-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
