import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import { MobileNavDrawer } from '#/section-kit/MobileNavDrawer.tsx'
import {
  NavbarActions,
  NavbarBrand,
  NavbarCta,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/index.ts'

/**
 * PhotographyNavbar — fixed, translucent top navigation bar for a fine-art /
 * wedding photographer portfolio. Thin configuration over the shared `SiteNav`
 * composite: a serif wordmark brand, evenly spaced desktop nav links, a "Book a
 * Shoot" CTA pill on the right, and a real mobile drawer (Sheet) on small
 * screens. Every link and the CTA route through useNavigate so labels drive
 * page-switching. Use as the sticky site header for wedding photographers,
 * portrait studios, elopement shooters, or any warm, editorial visual-creative
 * portfolio. Renders fully with no props via baked-in "Elena Vossen" defaults.
 */
export const PhotographyNavbar = defineCapsule({
  name: 'PhotographyNavbar',
  description:
    "Fixed translucent site header for a fine-art / wedding photographer portfolio built on the shared SiteNav composite: a serif wordmark brand, evenly spaced desktop nav links, a 'Book a Shoot' CTA pill, and a real mobile drawer (Sheet) on small screens. Every link and the CTA route through useNavigate for page-switching. Use as the sticky site header for wedding photographers, portrait studios, elopement shooters, or warm editorial visual-creative portfolios.",
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
    const go = useNavigate()

    return (
      <SiteNav position="fixed" height="default" className={props.className}>
        <NavbarBrand asChild>
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="gap-3"
          >
            <Logo brand={brand}>
              <LogoImage />
              <LogoLabel className="font-serif text-2xl font-medium tracking-tight" />
            </Logo>
          </button>
        </NavbarBrand>
        <NavbarNav>
          {nav.map((label) => (
            <NavbarNavLink key={label} onClick={() => go(label)}>
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>
        <NavbarActions>
          <NavbarCta
            variant="primary-pill"
            className="hidden px-5 py-2.5 sm:inline-flex"
            onClick={() => go(ctaTarget)}
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
