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
 * PhotographyNavbar — fixed, backdrop-blurred gallery header for a fine-art /
 * wedding photographer portfolio. Extreme-restraint chrome over the shared
 * `SiteNav` composite: a serif wordmark brand, a row of mono, wide-tracked
 * uppercase nav labels, a square-edged (rounded-none) "Book a Shoot" CTA with
 * press feedback, and a real mobile drawer (Sheet) on small screens, all under
 * a single hairline bottom rule. Every link and the CTA route through route
 * hrefs so labels drive page-switching; the CTA is gated to sm+ so the bar
 * never crowds. Tokens-only, so the treatment flips cleanly between light and
 * dark themes. Use as the sticky site header for wedding photographers,
 * portrait studios, elopement shooters, or gallery-first visual creatives.
 * Renders fully with no props via baked-in "Elena Vossen" defaults.
 */
export const PhotographyNavbar = defineCapsule({
  name: 'PhotographyNavbar',
  description:
    "Fixed, backdrop-blurred gallery site header for a fine-art / wedding photographer portfolio built on the shared SiteNav composite: a serif wordmark brand, a row of mono wide-tracked uppercase nav labels, a square-edged 'Book a Shoot' CTA with press feedback, and a real mobile drawer (Sheet) on small screens, all under a single hairline bottom rule. Every link and the CTA route through route hrefs for page-switching; the CTA is gated to sm+ so the bar never crowds. Tokens-only and theme-adaptive. Use as the sticky site header for wedding photographers, portrait studios, elopement shooters, or warm editorial visual-creative portfolios.",
  props: z.object({
    /** Photographer / studio name shown as the serif wordmark. */
    brand: z.string().optional(),
    /** Nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the logo / brand click. */
    homeTarget: z.string().optional(),
    /** Pill-shaped CTA label on the right. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the pill CTA. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const nav = props.nav?.length
      ? props.nav
      : ['Work', 'Services', 'About', 'Testimonials', 'Contact']
    const brand = props.brand ?? 'Elena Vossen'
    const ctaLabel = props.ctaLabel ?? 'Book a Shoot'
    const ctaTarget = props.ctaTarget ?? 'Contact'
    const homeTarget = props.homeTarget ?? nav[0]

    return (
      <SiteNav
        position="fixed"
        height="default"
        className={cn(
          'border-b border-border bg-background/80 backdrop-blur-md',
          props.className,
        )}
      >
        <NavbarBrand href={homeTarget} className="flex items-center gap-2">
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage className="size-7" />
            <LogoLabel className="font-serif text-xl font-medium tracking-tight md:text-2xl" />
          </BrandLogo>
        </NavbarBrand>
        <NavbarNav className="gap-7 lg:gap-9">
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="rounded-none px-0 font-mono text-[11px] uppercase tracking-[0.2em]"
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>
        <NavbarActions>
          <NavbarCta
            variant="dark"
            className="hidden rounded-none px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] transition-transform duration-150 active:translate-y-px motion-reduce:transform-none sm:inline-flex"
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
