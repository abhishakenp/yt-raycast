import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { MobileNavDrawer } from '#/section-kit/MobileNavDrawer.tsx'
import { cn } from '#/lib/utils.ts'
import {
  NavbarActions,
  NavbarBrand,
  NavbarCta,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/SiteNav.tsx'
/**
 * SpaWellnessNavbar — airy calm-luxury navigation bar for a day-spa / wellness
 * site. A thin, backdrop-blurred, hairline-bordered header on the shared
 * `SiteNav` composite: a delicate serif wordmark paired with a mono
 * micro-label behind a hairline divider on the left, quiet muted nav links
 * (Treatments / Memberships / Gift Cards / Contact) on the right, a
 * sharp-cornered filled-primary "Book Now" CTA with press feedback, and a real
 * mobile drawer (Sheet) on small screens. The wordmark and every nav item
 * route through route hrefs. Use as the opening site navigation for spas,
 * wellness retreats, massage studios, bathhouses, and treatment clinics.
 * Renders fully with no props via baked-in defaults.
 */
export const SpaWellnessNavbar = defineCapsule({
  name: 'SpaWellnessNavbar',
  description:
    "Airy calm-luxury navigation bar for a day-spa / wellness site on the shared SiteNav composite: a thin backdrop-blurred hairline-bordered header with a delicate serif wordmark and a mono micro-label behind a hairline divider on the left, quiet muted nav links (Treatments / Memberships / Gift Cards / Contact) on the right, a sharp-cornered filled-primary 'Book Now' CTA with press feedback, and a real mobile drawer on small screens. The wordmark and links route through route hrefs. Use as the opening site navigation for spas, wellness retreats, massage studios, bathhouses, and treatment clinics.",
  props: z.object({
    /** Serif wordmark / brand name on the left. */
    brand: z.string().optional(),
    /** Center nav link labels. */
    links: z.array(z.string()).optional(),
    /** Primary booking CTA label. */
    cta: z.string().optional(),
    /** Route label the CTA navigates to. */
    ctaTarget: z.string().optional(),
    /** Route label the wordmark navigates to. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const links = props.links?.length
      ? props.links
      : ['Treatments', 'Memberships', 'Gift Cards', 'Contact']
    const brand = props.brand ?? 'Lumen Spa'
    const brandClassName = 'font-serif text-xl font-semibold tracking-tight'
    const ctaLabel = props.cta ?? 'Book Now'
    const ctaTarget = props.ctaTarget ?? 'Booking'
    const homeTarget = props.homeTarget ?? 'Home'

    return (
      <SiteNav
        position="fixed"
        height="default"
        className={cn('bg-background/90', props.className)}
      >
        <NavbarBrand href={homeTarget} className="gap-3 text-left">
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage className="size-7" />
            <LogoLabel className={brandClassName} />
          </BrandLogo>
          <span
            aria-hidden="true"
            className="hidden h-4 w-px bg-border lg:block"
          />
          <MonoTag className="hidden lg:inline-block">Day Spa</MonoTag>
        </NavbarBrand>
        <NavbarNav className="gap-8 [&>button]:font-normal">
          {links.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>
        <NavbarActions>
          <NavbarCta
            variant="primary-pill"
            className="hidden rounded-none px-5 py-2.5 transition-colors active:translate-y-px sm:inline-flex"
            href={ctaTarget}
          >
            {ctaLabel}
          </NavbarCta>
          <MobileNavDrawer
            brand={brand}
            nav={links}
            homeTarget={homeTarget}
            cta={{ label: ctaLabel, target: ctaTarget }}
            buttonClassName="inline-flex size-9 items-center justify-center rounded-none border border-border p-0 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:translate-y-px md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
