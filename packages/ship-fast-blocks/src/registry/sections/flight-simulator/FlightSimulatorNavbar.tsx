import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { SiteNav } from "#/section-kit/SiteNav.tsx"

/**
 * FlightSimulatorNavbar — sticky site header for a consumer flight simulator
 * product (PC / console sim, study-level aircraft, photoreal scenery). Thin
 * configuration over the shared `SiteNav` composite: a bold wordmark beside an
 * inline winged-plane line mark, centered desktop nav links, and a prominent
 * "Get the Sim" CTA that routes to the buy page, with a real mobile drawer on
 * small screens. Use as the header for flight simulators, combat / airliner
 * sims, aviation training titles, or any immersive aircraft game. Renders fully
 * with no props via baked-in "SkyForge Sim" defaults.
 */
const WingMark = ({ className }: { className?: string }) => (
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
    <path d="M2 12h7l4-7 2 7h7" />
    <path d="M9 12l-3 5" />
    <path d="M22 12l-4 5" />
    <path d="M9 12l4 5" />
  </svg>
)

export const FlightSimulatorNavbar = defineComponent({
  name: "FlightSimulatorNavbar",
  description:
    "Sticky flight-simulator site header built on the shared SiteNav composite: a bold wordmark + inline winged-plane line mark, centered desktop nav links (Features, Editions, Gallery, Community), and a prominent 'Get the Sim' CTA routing to the buy page, plus a real mobile drawer. Use as the header for flight simulators, combat / airliner sims, aviation training titles, or any immersive aircraft game.",
  props: z.object({
    /** Product / brand name shown beside the logo mark. */
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
      : ["Features", "Editions", "Gallery", "Community"]
    return (
      <SiteNav
        brand={props.brand ?? "SkyForge Sim"}
        brandMark={<WingMark className="size-8 text-primary" />}
        brandClassName="text-xl font-bold tracking-tight"
        nav={nav}
        cta={{
          label: props.ctaLabel ?? "Get the Sim",
          target: props.ctaTarget ?? "Buy",
        }}
        homeTarget={props.homeTarget ?? nav[0]}
        className={props.className}
      />
    )
  },
})
