import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { SiteNav } from "#/section-kit/SiteNav.tsx"

/**
 * DocsNavbar — sticky site header for a developer DOCUMENTATION / API-reference
 * site. Thin configuration over the shared `SiteNav` composite: a clean
 * stacked-blocks brand mark beside the product wordmark, desktop section links,
 * a "Get Started" CTA, and a real mobile drawer (Sheet) on small screens. Every
 * link routes through SiteNav's useNavigate so PageSwitch can swap pages, and
 * nav labels match site routes. Use as the sticky header for docs homes, API
 * references, SDK guides, developer portals, or knowledge bases. Renders fully
 * with no props via baked-in "StackForge" defaults.
 */
const StackedBlocksMark = ({ className }: { className?: string }) => (
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
    <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
)

export const DocsNavbar = defineComponent({
  name: "DocsNavbar",
  description:
    "Sticky developer DOCUMENTATION / API-reference site header built on the shared SiteNav composite: a clean stacked-blocks brand mark + product wordmark, desktop section links, a 'Get Started' CTA, and a real mobile drawer. Links route through useNavigate for page-switching and nav labels match site routes. Use as the sticky header for docs homes, API references, SDK guides, developer portals, or knowledge bases.",
  props: z.object({
    /** Brand / product name shown beside the logo mark. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
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
      : ["Getting Started", "API Reference", "SDKs", "Changelog"]
    return (
      <SiteNav
        brand={props.brand ?? "StackForge"}
        brandMark={<StackedBlocksMark className="size-8 text-primary" />}
        nav={nav}
        cta={{
          label: props.ctaLabel ?? "Get Started",
          target: props.ctaTarget ?? "Getting Started",
        }}
        homeTarget={props.homeTarget ?? nav[0]}
        className={props.className}
      />
    )
  },
})
