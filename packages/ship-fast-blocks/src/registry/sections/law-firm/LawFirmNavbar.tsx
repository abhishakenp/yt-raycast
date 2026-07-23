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
/**
 * LawFirmNavbar — sticky editorial-gravitas top navigation for a corporate /
 * trial law-firm site. A backdrop-blurred bordered header pinned to the top on
 * the card surface: a hairline-framed squared brand seal bearing the firm
 * initial sits beside a two-line lockup — a serif wordmark over a mono
 * tracked-uppercase tagline — on the left; a row of quiet monochrome nav links
 * with a thin column-rule separator, plus a square-cornered solid "Free
 * Consultation" CTA with press feedback on the right (desktop); and a hamburger
 * menu button on mobile. Authoritative, traditional-yet-modern newsprint
 * aesthetic with sharp binary corners. Every link routes through route hrefs so
 * labels can drive page-switching. Use as the sticky site header for law firms,
 * attorneys, legal practices, solicitors, barristers, corporate counsel,
 * litigation boutiques, estate-planning, tax or accounting/advisory sites.
 * Renders fully with no props via baked-in "Reinhart & Associates" defaults.
 */
export const LawFirmNavbar = defineCapsule({
  name: 'LawFirmNavbar',
  description:
    "Sticky editorial-gravitas top navigation for a corporate / trial law-firm site on the card surface: a hairline-framed squared brand seal bearing the firm initial beside a two-line lockup (serif wordmark over a mono tracked-uppercase tagline) on the left, a row of quiet monochrome nav links with a thin column-rule separator plus a square-cornered solid 'Free Consultation' CTA with press feedback on the right (desktop), and a hamburger menu button on mobile. Authoritative, traditional-yet-modern newsprint aesthetic with sharp binary corners and backdrop blur. Links route through route hrefs for page-switching. Use as the sticky site header for law firms, attorneys, legal practices, solicitors, barristers, corporate counsel, litigation boutiques, estate-planning, tax or accounting/advisory firms.",
  props: z.object({
    /** Firm / brand name shown in the wordmark and brand tile initial. */
    brand: z.string().optional(),
    /** Tracked-uppercase tagline shown under the firm name. */
    tagline: z.string().optional(),
    /** Top-level nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** CTA button label on the right of the bar. */
    ctaLabel: z.string().optional(),
    /** Label for the sign-in button. */
    signIn: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Reinhart & Associates'
    const tagline = props.tagline ?? 'Attorneys at Law'
    const nav = props.nav?.length
      ? props.nav
      : ['Practice Areas', 'Attorneys', 'Testimonials', 'FAQ', 'Contact']
    const ctaLabel = props.ctaLabel ?? 'Free Consultation'
    const brandInitial =
      brand
        .replace(/[^A-Za-z]/g, '')
        .charAt(0)
        .toUpperCase() || 'R'
    const signIn = props.signIn ?? 'Sign in'
    return (
      <SiteNav
        position="sticky"
        height="default"
        className={cn('bg-card', props.className)}
      >
        <NavbarBrand href={nav[0]} className="text-left">
          <BrandLogo brand={brand} className="flex items-center gap-3">
            <LogoImage
              className="size-10 rounded-none"
              fallback={
                <span
                  className="grid size-10 place-items-center rounded-none border border-foreground/15 bg-primary font-serif text-lg font-bold text-primary-foreground"
                  aria-hidden="true"
                >
                  {brandInitial}
                </span>
              }
            />
            <span className="flex flex-col leading-none">
              <LogoLabel className="font-serif text-lg font-semibold tracking-tight text-foreground" />
              <span
                aria-hidden="true"
                className="mt-1 hidden font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:block"
              >
                {tagline}
              </span>
            </span>
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav>
          {nav.slice(0, -1).map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="text-muted-foreground hover:text-foreground"
            >
              {label}
            </NavbarNavLink>
          ))}
          <span
            aria-hidden="true"
            className="hidden h-6 w-px bg-border lg:block"
          />
          <NavbarCta
            variant="primary"
            href={nav[nav.length - 1]}
            className="rounded-none px-6 py-3 transition-transform duration-150 active:translate-y-px"
          >
            {ctaLabel}
          </NavbarCta>
        </NavbarNav>

        <NavbarActions>
          <SignInButton
            variant="ghost"
            label={signIn}
            className="hidden sm:block"
          />
        </NavbarActions>

        <MobileNavDrawer
          brand={brand}
          nav={nav}
          homeTarget={nav[0]}
          cta={{
            label: ctaLabel,
            target: nav[nav.length - 1],
          }}
          buttonClassName="p-2 text-foreground md:hidden"
        />
      </SiteNav>
    )
  },
})
