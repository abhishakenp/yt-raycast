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
 * CleaningServiceNavbar — playful-Swiss sticky top navigation for a
 * home-cleaning / maid-service landing page. A blurred, hairline-bottomed
 * header with a square bordered sparkle-mark tile + extrabold wordmark on the
 * left, a centered row of mono uppercase micro-label nav links on desktop, and
 * on the right a phone number (shown only at xl to keep the bar uncrowded),
 * square search/account chips, and a square bright-primary "Book Cleaning"
 * button with a hard offset shadow and mechanical press feedback. Every brand
 * click, nav link, phone button, and CTA routes through route hrefs. Use as
 * the sticky site header for residential cleaning companies, maid services,
 * housekeeping platforms, janitorial businesses, or any local home-service
 * brand. Renders fully with no props via baked-in "PureSpace" defaults.
 */
export const CleaningServiceNavbar = defineCapsule({
  name: 'CleaningServiceNavbar',
  description:
    "Playful-Swiss sticky top navigation bar for a home-cleaning / maid-service landing page: blurred hairline-bottomed header with a square bordered sparkle-mark tile + extrabold wordmark on the left, mono uppercase micro-label nav links on desktop center, and a phone number (xl and up), square search/account chips, and a square bright-primary 'Book Cleaning' CTA with hard offset shadow and press feedback on the right. Brand click, nav links, phone button, and CTA route through route hrefs. Use as the sticky site header for residential cleaning companies, maid services, housekeeping, janitorial, or local home-service brands.",
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
          'grid place-items-center rounded-none border-2 border-foreground bg-primary text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="16"
          height="16"
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
        className={cn(
          'border-b-2 border-foreground bg-background/95',
          props.className,
        )}
      >
        <NavbarBrand href={homeTarget} className="gap-2">
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              className="size-7"
              fallback={<SparkleMark className="size-7" />}
            />
            <LogoLabel className="text-lg font-extrabold tracking-tight text-foreground" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground active:translate-y-px"
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="gap-2.5">
          <LocalServiceIntentBadge lakebed={lakebed} />
          <LocalServiceSearchButton
            lakebed={lakebed}
            buttonClassName="hidden size-9 items-center justify-center rounded-none border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground active:translate-y-px md:inline-flex"
          />
          <LocalServiceAccountButton
            lakebed={lakebed}
            buttonClassName="hidden size-9 items-center justify-center rounded-none border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground active:translate-y-px md:inline-flex"
          />
          <a
            href={`tel:${phone.replace(/[^\d+]/g, '')}`}
            className="hidden items-center gap-2 font-mono text-xs font-semibold tabular-nums text-muted-foreground transition-colors hover:text-foreground active:translate-y-px xl:flex"
          >
            <PhoneIcon className="size-4" />
            {phone}
          </a>
          <LocalServiceBookingButton
            lakebed={lakebed}
            intentLabel={ctaTarget}
            service={ctaLabel}
            source="navbar"
            pendingChildren={
              <LocalServiceMutationSpinner className="text-primary-foreground" />
            }
            className="hidden items-center whitespace-nowrap rounded-none border-2 border-foreground bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-[3px_3px_0_0] shadow-foreground transition-all duration-150 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:pointer-events-none disabled:opacity-70 sm:inline-flex"
          >
            {ctaLabel}
          </LocalServiceBookingButton>
          <LocalServiceMobileMenu
            brand={brand}
            homeTarget={homeTarget}
            nav={nav}
            buttonClassName="inline-flex size-9 items-center justify-center rounded-none border border-border text-foreground transition-colors hover:border-foreground active:translate-y-px md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
