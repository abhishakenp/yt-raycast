import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { SiteNav } from "#/section-kit/SiteNav.tsx"

/**
 * BlogNavbar — sticky editorial site header for a blog, magazine, newsroom, or
 * content hub. Thin configuration over the shared `SiteNav` composite: a clean
 * wordmark beside a gradient brand tile + inline mark, horizontal nav links with
 * a home highlight on desktop, a "Subscribe" CTA, and a real mobile drawer
 * (Sheet) on small screens. No phone number — editorial publications don't show
 * one. Use as the header for blogs, publications, journals, or any content site.
 * Renders fully with no props.
 */
const QuillMark = ({ className }: { className?: string }) => (
  <span
    className={`grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-sm ${className ?? ""}`}
  >
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="5" cy="19" r="2" />
      <circle cx="19" cy="5" r="2" />
      <path d="M5 17C5 9 11 5 17 5" />
    </svg>
  </span>
)

export const BlogNavbar = defineComponent({
  name: "BlogNavbar",
  description:
    "Sticky editorial site header for a blog, magazine, newsroom, or content hub built on the shared SiteNav composite: a clean wordmark beside a gradient brand tile + inline mark, horizontal desktop nav links with a home highlight, a 'Subscribe' CTA, and a real mobile drawer. No phone number — editorial publications don't show one. Use as the header for blogs, publications, journals, or any content site.",
  props: z.object({
    /** Brand / publication name shown beside the logo tile. */
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
      : ["Home", "Design", "Engineering", "Product", "About"]
    return (
      <SiteNav
        brand={props.brand ?? "Form & Function"}
        brandMark={<QuillMark className="size-8 text-primary" />}
        brandClassName="text-xl font-bold tracking-tight"
        nav={nav}
        cta={{
          label: props.ctaLabel ?? "Subscribe",
          target: props.ctaTarget ?? "Subscribe",
        }}
        homeTarget={props.homeTarget ?? nav[0]}
        className={props.className}
      />
    )
  },
})
