import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { CtaBand } from "#/section-kit/CtaBand.tsx"

/**
 * DocsCta — a clean, centered closing band for a developer documentation home
 * page. Thin configuration over the shared `CtaBand` composite at
 * `tone="primary"`: a short eyebrow, a confident headline, a concise supporting
 * subheading, and a centered row of two routable pill CTAs — a high-contrast
 * "Start building" button (variant "primary", auto-inverted to a light pill on
 * the primary band) that routes to the quickstart, plus an outlined "View API
 * Reference" button (variant "outline"). Both actions navigate through the kit's
 * useNavigate so neither is a dead link. Use near the bottom of a docs home,
 * API reference, SDK guide, or developer portal page to push readers into the
 * quickstart. Renders fully with no props via crisp, developer-friendly baked-in
 * defaults.
 */
export const DocsCta = defineComponent({
  name: "DocsCta",
  description:
    "Clean, centered closing call-to-action band for a developer documentation home page: a full-width section wrapping a primary-colored band with a short eyebrow, a confident headline, a concise supporting subheading, and a centered row of two pill CTAs (a high-contrast 'Start building' button that routes to the quickstart plus an outlined 'View API Reference' button). Both CTAs route through useNavigate. Use near the bottom of a docs home, API reference, SDK guide, or developer portal page to push readers into getting started.",
  props: z.object({
    /** Short label shown above the headline (maps to CtaBand eyebrow). */
    eyebrow: z.string().optional(),
    /** Closing headline (maps to CtaBand title). */
    headline: z.string().optional(),
    /** Short supporting line under the headline (maps to CtaBand subtitle). */
    subheading: z.string().optional(),
    /** High-contrast primary CTA label. */
    primaryCta: z.string().optional(),
    /** Route label the primary CTA navigates to. */
    primaryTarget: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Route label the secondary CTA navigates to. */
    secondaryTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    return (
      <CtaBand
        tone="primary"
        eyebrow={props.eyebrow ?? "Ready to build?"}
        title={props.headline ?? "Start building in minutes"}
        subtitle={
          props.subheading ??
          "Grab an API key, follow the quickstart, and ship your first request — the full reference is one click away."
        }
        actions={[
          {
            label: props.primaryCta ?? "Start building",
            target: props.primaryTarget ?? "Getting Started",
            variant: "primary",
          },
          {
            label: props.secondaryCta ?? "View API Reference",
            target: props.secondaryTarget ?? "API Reference",
            variant: "outline",
          },
        ]}
        className={props.className}
      />
    )
  },
})
