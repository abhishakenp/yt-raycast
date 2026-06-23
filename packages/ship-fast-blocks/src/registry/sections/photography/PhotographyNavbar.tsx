import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { SiteNav } from "#/section-kit/SiteNav.tsx"

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
export const PhotographyNavbar = defineComponent({
  name: "PhotographyNavbar",
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
      : ["Work", "Services", "About", "Testimonials", "Contact"]
    return (
      <SiteNav
        brand={props.brand ?? "Elena Vossen"}
        brandClassName="font-serif text-2xl font-medium tracking-tight"
        nav={nav}
        cta={{
          label: props.ctaLabel ?? "Book a Shoot",
          target: props.ctaTarget ?? "Contact",
        }}
        homeTarget={props.homeTarget ?? nav[0]}
        className={props.className}
      />
    )
  },
})
