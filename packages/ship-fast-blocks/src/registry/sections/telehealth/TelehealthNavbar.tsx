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
/**
 * TelehealthNavbar — calm clinical + warmth sticky header for a telehealth /
 * virtual-care site, built on the shared SiteNav composite. A backdrop-blurred,
 * hairline border-bottomed bar: a square rounded-none primary heart-pulse glyph
 * tile beside the brand wordmark on the left, quiet muted section links
 * (desktop), and on the right a mono tabular click-to-call phone link, plus a
 * square filled-primary "Book a Visit" CTA with press feedback that routes to
 * the contact page; a hamburger opens the real mobile drawer. Every link and
 * the CTA route through route hrefs so labels can drive page-switching. Precise
 * yet warm, telemedicine-flavored aesthetic. Use as the first band of any
 * telehealth page so visitors can immediately reach booking, pricing, or
 * support.
 */
export const TelehealthNavbar = defineCapsule({
  name: 'TelehealthNavbar',
  description:
    "Calm clinical + warmth sticky top navigation header for a telehealth / virtual care site, built on the shared SiteNav composite: a backdrop-blurred, hairline border-bottomed bar with a square rounded-none primary heart-pulse glyph tile + brand wordmark on the left, quiet muted section links (How it works, Services, Pricing, Reviews, FAQ) on desktop, and a mono tabular click-to-call phone link plus a square filled-primary 'Book a Visit' CTA with press feedback that routes to the contact page on the right; a hamburger opens the real mobile drawer. Links and CTA route through route hrefs for page-switching. Use as the first band of any telehealth page so visitors can immediately reach booking, pricing, or support.",
  props: z.object({
    brand: z.string().optional(),
    nav: z.array(z.string()).optional(),
    phone: z.string().optional(),
    ctaLabel: z.string().optional(),
    ctaTarget: z.string().optional(),
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'MendWell'
    const nav = props.nav?.length
      ? props.nav
      : ['How it works', 'Services', 'Pricing', 'Reviews', 'FAQ']
    const phone = props.phone ?? '(800) 555-0142'
    const ctaLabel = props.ctaLabel ?? 'Book a Visit'
    const ctaTarget = props.ctaTarget ?? 'Contact'
    const homeTarget = props.homeTarget ?? 'Home'

    const PulseMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-none bg-primary text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="62%"
          height="62%"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 12h4l2 5 4-12 2 7h6" />
        </svg>
      </span>
    )

    return (
      <SiteNav
        position="fixed"
        height="default"
        className={cn('bg-background/90 backdrop-blur-md', props.className)}
      >
        <NavbarBrand href={homeTarget} className="shrink-0 gap-3 text-left">
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              className="size-7"
              fallback={<PulseMark className="size-7" />}
            />
            <LogoLabel className="whitespace-nowrap text-lg font-bold tracking-tight text-foreground" />
          </BrandLogo>
        </NavbarBrand>
        <NavbarNav
          breakpoint="lg"
          className="shrink-0 gap-6 [&>button]:font-medium"
        >
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
        <NavbarActions className="shrink-0 gap-2">
          {phone ? (
            <a
              href={`tel:${phone.replace(/[^\d+]/g, '')}`}
              className="hidden shrink-0 items-center gap-2 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground xl:flex"
            >
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-primary"
              />
              <span className="tabular-nums">{phone}</span>
            </a>
          ) : null}
          <NavbarCta
            variant="primary-pill"
            className="hidden rounded-none px-5 py-2.5 active:translate-y-px sm:inline-flex"
            href={ctaTarget}
          >
            {ctaLabel}
          </NavbarCta>
          <MobileNavDrawer
            brand={brand}
            nav={nav}
            homeTarget={homeTarget}
            cta={{ label: ctaLabel, target: ctaTarget }}
            buttonClassName="inline-flex size-9 items-center justify-center rounded-none border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:translate-y-px lg:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
