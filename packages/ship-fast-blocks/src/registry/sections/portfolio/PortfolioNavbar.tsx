import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo } from '#/section-kit/Logo.tsx'
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
 * PortfolioNavbar — fixed, blur-backdrop top navigation for a creative-individual
 * portfolio. Thin configuration over the shared `SiteNav` composite: a bold
 * wordmark brand, horizontal desktop nav links, a "Get in touch" CTA pill on the
 * right, and a real mobile drawer (Sheet) on small screens. Every link and the
 * CTA route through useNavigate so labels drive page-switching. Use as the
 * sticky site header for a 3D artist, motion designer, art director, animator,
 * or visual designer personal site. Renders fully with no props via baked-in
 * "Kaelen Vance" defaults.
 */
export const PortfolioNavbar = defineCapsule({
  name: 'PortfolioNavbar',
  description:
    "Fixed blur-backdrop site header for a creative-individual portfolio built on the shared SiteNav composite: a bold wordmark brand, horizontal desktop nav links, a 'Get in touch' CTA pill, and a real mobile drawer (Sheet) on small screens. Every link and the CTA route through useNavigate for page-switching. Use as the sticky site header for a 3D artist, motion designer, art director, animator, or visual designer personal site.",
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
    const go = useNavigate()

    return (
      <SiteNav position="fixed" height="default" className={props.className}>
        <NavbarBrand asChild>
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="gap-3"
          >
            <Logo
              brand={brand}
              labelClassName="text-xl font-bold tracking-tight"
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
