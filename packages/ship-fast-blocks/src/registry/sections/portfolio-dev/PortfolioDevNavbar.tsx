import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { SiteNav } from "#/section-kit/SiteNav.tsx"

const CodeMark = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="m8 8-4 4 4 4" />
    <path d="m16 8 4 4-4 4" />
  </svg>
)

export const PortfolioDevNavbar = defineComponent({
  name: "PortfolioDevNavbar",
  description:
    "Sticky developer-portfolio header built on the shared SiteNav composite: a mono wordmark beside an inline </> code mark, centered desktop nav links, and a 'Hire Me' CTA that routes to Contact. Includes a real mobile drawer on small screens and omits the phone slot, matching how engineers, freelancers, and indie hackers present themselves. Use as the site-wide header for developer, engineer, or freelancer portfolios; renders fully with no props via baked-in 'alex.dev' defaults.",
  props: z.object({
    /** Developer / brand handle shown as the mono wordmark. */
    brand: z.string().optional(),
    /** Nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the logo / brand click. */
    homeTarget: z.string().optional(),
    /** CTA label on the right. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the CTA. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const nav = props.nav?.length
      ? props.nav
      : ["Work", "Services", "About", "Contact"]
    return (
      <SiteNav
        brand={props.brand ?? "alex.dev"}
        brandMark={<CodeMark className="size-7 text-primary" />}
        brandClassName="font-mono text-lg font-semibold"
        nav={nav}
        cta={{ label: props.ctaLabel ?? "Hire Me", target: props.ctaTarget ?? "Contact" }}
        homeTarget={props.homeTarget ?? nav[0]}
        className={props.className}
      />
    )
  },
})
