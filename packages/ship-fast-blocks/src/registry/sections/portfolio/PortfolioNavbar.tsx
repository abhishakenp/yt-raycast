import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { SiteNav } from '#/section-kit/SiteNav.tsx'

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
    return (
      <SiteNav
        brand={props.brand ?? 'Kaelen Vance'}
        brandClassName="text-xl font-bold tracking-tight"
        nav={nav}
        cta={{
          label: props.ctaLabel ?? 'Get in touch',
          target: props.ctaTarget ?? 'Contact',
        }}
        homeTarget={props.homeTarget ?? nav[0]}
        className={props.className}
      />
    )
  },
})
