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
 * PortfolioNavbar — fixed, blur-backdrop editorial-personal top navigation for a
 * creative-individual portfolio. Thin configuration over the shared `SiteNav`
 * composite: a sharp rounded-none initial mark (hairline frame, hard offset
 * shadow) beside an extrabold tight-tracked wordmark on the left, a row of mono
 * uppercase micro-label nav links, a high-contrast inverted (bg-foreground)
 * rounded-none "Get in touch" CTA with a hard offset shadow and mechanical press
 * feedback on the right, and a real mobile drawer (Sheet) on small screens.
 * Every link and the CTA route through route hrefs so labels drive
 * page-switching. Use as the sticky site header for a designer, art director,
 * animator, motion or 3D artist personal site. Renders fully with no props via
 * baked-in "Kaelen Vance" defaults.
 */
export const PortfolioNavbar = defineCapsule({
  name: 'PortfolioNavbar',
  description:
    "Fixed blur-backdrop editorial-personal site header for a creative-individual portfolio built on the shared SiteNav composite: a sharp rounded-none initial mark (hairline frame, hard offset shadow) beside an extrabold tight-tracked wordmark, mono uppercase micro-label nav links, a high-contrast inverted rounded-none 'Get in touch' CTA with a hard offset shadow and press feedback, and a real mobile drawer (Sheet) on small screens. Every link and the CTA route through route hrefs for page-switching. Use as the sticky site header for a designer, art director, animator, motion or 3D artist personal site.",
  props: z.object({
    /** Brand / person name shown as the wordmark. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match the site's route labels). */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the logo / brand click. */
    homeTarget: z.string().optional(),
    /** Pill-shaped CTA label on the right. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the pill CTA. */
    ctaTarget: z.string().optional(),
    /** Label for the sign-in button. */
    signIn: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const nav = props.nav?.length
      ? props.nav
      : ['Work', 'About', 'Services', 'Contact']
    const brand = props.brand ?? 'Kaelen Vance'
    const ctaLabel = props.ctaLabel ?? 'Get in touch'
    const ctaTarget = props.ctaTarget ?? 'Contact'
    const homeTarget = props.homeTarget ?? nav[0]

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        aria-hidden="true"
        className={cn(
          'grid place-items-center rounded-none border-2 border-foreground bg-background font-extrabold leading-none text-foreground shadow-[3px_3px_0_0] shadow-foreground/20',
          className,
        )}
      >
        {brand.charAt(0).toUpperCase()}
      </span>
    )
    const signIn = props.signIn ?? 'Sign in'

    return (
      <SiteNav position="fixed" height="default" className={props.className}>
        <NavbarBrand href={homeTarget} className="gap-3 text-foreground">
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              className="size-7"
              fallback={<LogoMark className="size-7 text-xs" />}
            />
            <LogoLabel className="text-lg font-extrabold tracking-tight" />
          </BrandLogo>
        </NavbarBrand>
        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink
              key={label}
              href={label}
              className="rounded-none font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground hover:bg-transparent hover:text-foreground"
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>
        <NavbarActions>
          <SignInButton
            variant="ghost"
            label={signIn}
            className="hidden sm:block"
          />
          <NavbarCta
            variant="primary-pill"
            className="hidden rounded-none border-2 border-foreground bg-foreground px-5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-background shadow-[4px_4px_0_0] shadow-foreground/20 transition-all duration-100 hover:-translate-y-0.5 hover:bg-foreground active:translate-x-[2px] active:translate-y-[2px] active:shadow-none sm:inline-flex"
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
