import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { SiteNav } from "#/section-kit/SiteNav.tsx"

/** Inline compass brand mark — adventurous, currentColor → theme token. */
const CompassMark = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m15.5 8.5-2.2 5.3-5.3 2.2 2.2-5.3 5.3-2.2Z"
    />
    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
  </svg>
)

/**
 * TourExperiencesNavbar — sticky site header for an adventure / guided-tour
 * brand. Composes the shared SiteNav composite (brand mark + name, desktop nav
 * links, phone, a pill "Book a Tour" CTA, and a real mobile drawer) with vivid,
 * travel-ready defaults. Every nav label and the CTA route through the shared
 * navigation so labels drive page-switching. Use as the top navigation for tour
 * operators, expedition companies, day-trip outfitters, and travel-experience
 * landing pages. Renders fully with no props via baked-in "Wanderwild Tours"
 * defaults.
 */
export const TourExperiencesNavbar = defineComponent({
  name: "TourExperiencesNavbar",
  description:
    "Sticky site header for an adventure / guided-tour brand. Composes the shared SiteNav composite — inline compass brand mark + name, desktop nav links, phone, a pill 'Book a Tour' CTA, and a real mobile drawer — with vivid travel-ready defaults. Every nav label and the CTA route through the shared navigation so labels drive page-switching. Use as the top navigation for tour operators, expedition companies, day-trip outfitters, and travel-experience landing pages.",
  props: z.object({
    /** Brand / company name shown beside the compass mark. */
    brand: z.string().optional(),
    /** Nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Phone number rendered as a tel: link on larger screens. */
    phone: z.string().optional(),
    /** Navigation target for the logo / home click. */
    homeTarget: z.string().optional(),
    /** Pill CTA label on the right. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the pill CTA. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const nav = props.nav?.length
      ? props.nav
      : ["Tours", "Destinations", "Pricing", "Reviews", "Book a Tour"]
    return (
      <SiteNav
        brand={props.brand ?? "Wanderwild Tours"}
        brandMark={<CompassMark className="size-8 text-primary" />}
        nav={nav}
        phone={props.phone ?? "(415) 555-0188"}
        cta={{
          label: props.ctaLabel ?? "Book a Tour",
          target: props.ctaTarget ?? "Book a Tour",
        }}
        homeTarget={props.homeTarget ?? nav[0]}
        className={props.className}
      />
    )
  },
})
