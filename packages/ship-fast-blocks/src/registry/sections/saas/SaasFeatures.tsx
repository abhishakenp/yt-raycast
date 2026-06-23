import type { ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { FeatureGrid } from "#/section-kit/FeatureGrid.tsx"

/**
 * SaasFeatures — a centered-heading 3-column feature grid for a B2B SaaS /
 * AI-product landing page. Thin configuration over the shared `FeatureGrid`
 * composite: a centered heading + supporting subheading above a responsive grid
 * of feature cards, each pairing an inline stroke-SVG glyph (cycled per index)
 * with a bold title and a muted blurb. Use to showcase a product's core
 * capabilities — scheduling, integrations, analytics, security, automation,
 * collaboration — beneath a SaaS hero. Renders fully with no props via baked-in
 * defaults.
 */
const ICONS: ReactNode[] = [
  // calendar / scheduling
  <>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </>,
  // integrations / puzzle
  <>
    <path d="M4 7h3a2 2 0 0 0 2-2V4a2 2 0 1 1 4 0v1a2 2 0 0 0 2 2h3v3a2 2 0 0 0 2 2h0a2 2 0 1 1 0 4h0a2 2 0 0 0-2 2v3h-3a2 2 0 0 1-2-2v0a2 2 0 0 0-4 0v0a2 2 0 0 1-2 2H4v-3a2 2 0 0 0-2-2H2a2 2 0 1 1 0-4h0a2 2 0 0 0 2-2V7Z" />
  </>,
  // analytics / chart
  <>
    <path d="M3 3v18h18" />
    <path d="M7 15l4-5 3 3 5-7" />
  </>,
  // security / shield
  <>
    <path d="M12 2l8 4v6c0 5-3.4 7.7-8 10-4.6-2.3-8-5-8-10V6l8-4Z" />
    <path d="M9 12l2 2 4-4" />
  </>,
  // automation / zap
  <>
    <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8Z" />
  </>,
  // collaboration / users
  <>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </>,
]

const FeatureIcon = ({ glyph }: { glyph: ReactNode }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {glyph}
  </svg>
)

export const SaasFeatures = defineComponent({
  name: "SaasFeatures",
  description:
    "Centered-heading 3-column feature grid for a B2B SaaS / AI-product landing page built on the shared FeatureGrid composite: a centered heading + supporting subheading above a responsive grid of feature cards, each pairing an inline stroke-SVG glyph (cycled per index) with a bold title and a muted blurb. Use to showcase a product's core capabilities — scheduling, integrations, analytics, security, automation, collaboration — beneath a SaaS hero.",
  props: z.object({
    /** Centered section heading above the grid. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    subheading: z.string().optional(),
    /** Feature cells: each with a title and a short description blurb. */
    features: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? "Everything you need to ship faster"
    const subheading =
      props.subheading ??
      "A complete toolkit that adapts to how your team already works — no rip-and-replace, no steep learning curve, just measurable results from day one."
    const features = props.features?.length
      ? props.features
      : [
          {
            title: "AI scheduling",
            description:
              "Let intelligent agents read your calendar and book meetings at the perfect time, automatically resolving conflicts before they happen.",
          },
          {
            title: "Native integrations",
            description:
              "Connect Slack, Notion, GitHub, and 80+ tools in a single click so your data and workflows stay perfectly in sync.",
          },
          {
            title: "Real-time analytics",
            description:
              "Track adoption, velocity, and ROI with live dashboards that turn raw activity into decisions your whole team can trust.",
          },
          {
            title: "Enterprise security",
            description:
              "SOC 2 Type II, SSO, and granular role-based access keep every byte encrypted and every action auditable end to end.",
          },
          {
            title: "Smart automation",
            description:
              "Trigger multi-step workflows from any event and let recurring busywork run itself while your team focuses on what matters.",
          },
          {
            title: "Team collaboration",
            description:
              "Shared spaces, inline comments, and live presence keep everyone aligned whether they're across the desk or across the globe.",
          },
        ]

    return (
      <FeatureGrid
        heading={heading}
        subheading={subheading}
        features={features.map((f, i) => ({
          title: f.title,
          description: f.description,
          icon: <FeatureIcon glyph={ICONS[i % ICONS.length]} />,
        }))}
        className={props.className}
      />
    )
  },
})
