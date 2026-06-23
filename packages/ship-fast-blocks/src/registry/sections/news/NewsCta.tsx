import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { CtaBand } from "#/section-kit/CtaBand.tsx"

/**
 * NewsCta — "Support Independent Journalism" subscribe call-to-action band for
 * a news / editorial site. Thin configuration over the shared `CtaBand`
 * composite at `tone="primary"`: a membership eyebrow, a strong headline, a
 * short supporting subheading, and a centered row of two routable pill CTAs — a
 * high-contrast "Subscribe Now" button (variant "primary") plus an outlined
 * "View All Plans" button (variant "outline"). Both actions route through the
 * kit's useNavigate so neither is a dead link. Use as the subscription /
 * membership CTA near the bottom of a newspaper, magazine or publication
 * homepage. Renders fully with no props via baked-in defaults.
 */
export const NewsCta = defineComponent({
  name: "NewsCta",
  description:
    "'Support Independent Journalism' subscribe call-to-action band for a news / editorial site built on the shared CtaBand composite at tone='primary': a membership eyebrow, a strong headline, a short supporting subheading, and a centered row of two pill CTAs (a high-contrast 'Subscribe Now' button plus an outlined 'View All Plans' button). Both CTAs route through useNavigate. Use as the subscription / membership CTA near the bottom of a newspaper, magazine or publication homepage.",
  props: z.object({
    /** CTA heading (maps to CtaBand title). */
    heading: z.string().optional(),
    /** Short supporting line under the heading (maps to CtaBand subtitle). */
    subheading: z.string().optional(),
    /** Small eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** High-contrast primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    return (
      <CtaBand
        tone="primary"
        eyebrow={props.eyebrow ?? "Become a member"}
        title={props.heading ?? "Support Independent Journalism"}
        subtitle={
          props.subheading ??
          "Subscribe today for unlimited access to award-winning reporting, expert analysis, and exclusive features. No paywalls on breaking news—ever."
        }
        actions={[
          {
            label: props.primaryCta ?? "Subscribe Now",
            target: "Subscribe",
            variant: "primary",
          },
          {
            label: props.secondaryCta ?? "View All Plans",
            target: "Plans",
            variant: "outline",
          },
        ]}
        className={props.className}
      />
    )
  },
})
