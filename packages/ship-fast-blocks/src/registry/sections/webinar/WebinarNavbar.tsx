import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { SiteNav } from "#/section-kit/SiteNav.tsx"

/**
 * WebinarNavbar — sticky site header for a live webinar or virtual event.
 * Thin configuration over the shared `SiteNav` composite: a semibold wordmark
 * beside an inline broadcast/calendar mark, centered nav links on desktop, a
 * high-contrast "Register" CTA, and a real mobile drawer on small screens. Use
 * as the header for webinars, summits, masterclasses, product launches, or any
 * registration-driven event landing page. Renders fully with no props.
 */
const BroadcastMark = ({ className }: { className?: string }) => (
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
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 9h18" />
    <path d="M8 3v4" />
    <path d="M16 3v4" />
    <circle cx="12" cy="14" r="2" />
  </svg>
)

export const WebinarNavbar = defineComponent({
  name: "WebinarNavbar",
  description:
    "Sticky webinar/virtual-event site header built on the shared SiteNav composite: a semibold wordmark + broadcast-calendar mark, centered desktop nav links (Overview, Agenda, Speakers, FAQ), a high-contrast 'Register' CTA, and a real mobile drawer. Use as the header for webinars, summits, masterclasses, product launches, or any registration-driven event landing page.",
  props: z.object({
    /** Brand / event host name shown beside the logo mark. */
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
      : ["Overview", "Agenda", "Speakers", "FAQ"]
    return (
      <SiteNav
        brand={props.brand ?? "Catalyst Labs"}
        brandMark={<BroadcastMark className="size-8 text-primary" />}
        brandClassName="font-semibold tracking-tight"
        nav={nav}
        cta={{
          label: props.ctaLabel ?? "Register",
          target: props.ctaTarget ?? "Register",
        }}
        homeTarget={props.homeTarget ?? nav[0]}
        className={props.className}
      />
    )
  },
})
