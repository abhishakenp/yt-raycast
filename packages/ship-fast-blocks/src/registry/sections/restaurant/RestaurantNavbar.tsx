import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { SiteNav } from "#/section-kit/SiteNav.tsx"

/**
 * RestaurantNavbar — sticky site header for a restaurant (casual neighborhood
 * spot or upscale dining room). Thin configuration over the shared `SiteNav`
 * composite: a serif wordmark beside an inline fork-and-knife mark, centered
 * nav links on desktop, a reservations phone number, a "Book a Table" CTA, and
 * a real mobile drawer (Sheet) on small screens. Use as the header for bistros,
 * trattorias, steak houses, sushi counters, or any dining brand where
 * reservations matter. Renders fully with no props.
 */
const ForkKnifeMark = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M6 3v6a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V3" />
    <path d="M8 11v10" />
    <path d="M16 3c-1.66 0-3 2.24-3 5s1.34 5 3 5" />
    <path d="M16 3v18" />
  </svg>
)

export const RestaurantNavbar = defineComponent({
  name: "RestaurantNavbar",
  description:
    "Sticky restaurant site header (casual or upscale dining) built on the shared SiteNav composite: serif wordmark + fork-and-knife mark, centered desktop nav links, a reservations phone number, a 'Book a Table' CTA, and a real mobile drawer. Use as the header for bistros, trattorias, steak houses, sushi counters, or any dining brand where reservations matter.",
  props: z.object({
    /** Restaurant / brand name shown beside the logo mark. */
    brand: z.string().optional(),
    /** Nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Reservations phone number shown on the right (desktop). */
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
    const nav = props.nav?.length
      ? props.nav
      : ["Menu", "About", "Gallery", "Reservations", "Contact"]
    return (
      <SiteNav
        brand={props.brand ?? "Saffron & Sage"}
        brandMark={<ForkKnifeMark className="size-8 text-primary" />}
        brandClassName="font-serif text-xl font-medium"
        nav={nav}
        phone={props.phone ?? "(415) 555-0182"}
        cta={{
          label: props.ctaLabel ?? "Book a Table",
          target: props.ctaTarget ?? "Reservations",
        }}
        homeTarget={props.homeTarget ?? nav[0]}
        className={props.className}
      />
    )
  },
})
