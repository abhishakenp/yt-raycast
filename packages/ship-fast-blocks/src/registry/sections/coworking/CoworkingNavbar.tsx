import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { SiteNav } from "#/section-kit/SiteNav.tsx"

/**
 * CoworkingNavbar — sticky site header for a coworking / workspace brand. Thin
 * configuration over the shared `SiteNav` composite: a rounded brand-initial
 * logo tile beside the workspace name, centered desktop nav links, an optional
 * front-desk phone number, a single "Book a Tour" CTA, and a real mobile drawer
 * (Sheet) on small screens. Use as the sticky header for coworking spaces,
 * shared offices, flex-office platforms, or any membership-driven workspace
 * brand. Renders fully with no props via baked-in "Northside" defaults.
 */
const BrandTile = ({ letter }: { letter: string }) => (
  <span
    className="grid size-8 place-items-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground"
    aria-hidden="true"
  >
    {letter}
  </span>
)

export const CoworkingNavbar = defineComponent({
  name: "CoworkingNavbar",
  description:
    "Sticky coworking / workspace site header built on the shared SiteNav composite: a rounded brand-initial logo tile beside the workspace name, centered desktop nav links, an optional front-desk phone number, a single 'Book a Tour' pill CTA, and a real mobile drawer. All links route through useNavigate. Use as the sticky site header for coworking spaces, shared offices, flex-office platforms, or workspace membership pages.",
  props: z.object({
    /** Brand / workspace name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Optional front-desk phone number shown on the right (desktop). */
    phone: z.string().optional(),
    /** Navigation target for the logo / brand click. */
    homeTarget: z.string().optional(),
    /** Pill-shaped CTA label on the right. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the pill CTA. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? "Northside"
    const nav = props.nav?.length
      ? props.nav
      : ["Spaces", "Amenities", "Pricing", "Gallery", "FAQ"]
    return (
      <SiteNav
        brand={brand}
        brandMark={<BrandTile letter={brand.charAt(0).toUpperCase()} />}
        brandClassName="text-lg font-semibold"
        nav={nav}
        phone={props.phone}
        cta={{
          label: props.ctaLabel ?? "Book a Tour",
          target: props.ctaTarget ?? "Pricing",
        }}
        homeTarget={props.homeTarget ?? brand}
        className={props.className}
      />
    )
  },
})
