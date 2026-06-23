import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { SiteNav } from "#/section-kit/SiteNav.tsx"

/**
 * BlogPostNavbar — sticky reading-page header for a single-article / editorial
 * blog page. Thin configuration over the shared `SiteNav` composite: a feather /
 * pen wordmark on the left, centered desktop nav links, a "Subscribe" CTA, and a
 * real mobile drawer on small screens. Clean editorial voice. Use as the sticky
 * site header for a blog post, magazine article, journal, or any editorial
 * publication detail page. Renders fully with no props via baked-in defaults.
 */
const FeatherMark = ({ className }: { className?: string }) => (
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
    <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
    <path d="M16 8 2 22" />
    <path d="M17.5 15H9" />
  </svg>
)

export const BlogPostNavbar = defineComponent({
  name: "BlogPostNavbar",
  description:
    "Sticky reading-page header for a single-article / editorial blog page built on the shared SiteNav composite: a feather/pen wordmark, centered desktop nav links, a 'Subscribe' CTA, and a real mobile drawer on small screens. Clean editorial voice. Use as the sticky site header for a blog post, magazine article, journal, or any editorial publication detail page.",
  props: z.object({
    /** Publication / brand name shown in the navbar. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Label for the subscribe CTA on the right. */
    subscribeCta: z.string().optional(),
    /** Navigation target for the logo / brand click (defaults to first nav item). */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const nav = props.nav?.length
      ? props.nav
      : ["Home", "Articles", "Topics", "About"]
    return (
      <SiteNav
        brand={props.brand ?? "The Editorial"}
        brandMark={<FeatherMark className="size-7 text-primary" />}
        brandClassName="text-xl font-semibold"
        nav={nav}
        cta={{ label: props.subscribeCta ?? "Subscribe", target: "Subscribe" }}
        homeTarget={props.homeTarget ?? nav[0]}
        className={props.className}
      />
    )
  },
})
