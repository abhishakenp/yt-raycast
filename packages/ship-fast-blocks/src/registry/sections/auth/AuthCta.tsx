import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { CtaBand } from "#/section-kit/CtaBand.tsx"

/**
 * AuthCta — bold, centered conversion band for Authly, a developer authentication
 * product. Thin configuration over the shared `CtaBand` composite at
 * `tone="primary"`: an eyebrow, a strong headline ("Add auth in minutes"), a
 * short developer-focused subtitle, and a centered row of two routable CTAs — a
 * high-contrast "Start Free" button (variant "primary") routing to sign-up plus
 * an outlined "Read the Docs" button. Both actions route through useNavigate. Use
 * near the bottom of an auth platform, identity API, or login SDK page to drive
 * sign-ups. Renders fully with no props.
 */
export const AuthCta = defineComponent({
  name: "AuthCta",
  description:
    "Bold, centered conversion band for a developer-auth product built on the shared CtaBand composite at tone='primary': an eyebrow, a strong headline ('Add auth in minutes'), a short developer-focused subtitle, and a centered row of two routable CTAs — a high-contrast 'Start Free' button routing to sign-up plus an outlined 'Read the Docs' button. Both route through useNavigate. Use near the bottom of an auth platform, identity API, or login SDK page to drive sign-ups.",
  props: z.object({
    /** Small eyebrow above the headline. */
    eyebrow: z.string().optional(),
    /** Conversion headline (maps to CtaBand title). */
    headline: z.string().optional(),
    /** Short supporting line (maps to CtaBand subtitle). */
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
    const eyebrow = props.eyebrow ?? "Get started"
    const headline = props.headline ?? "Add auth in minutes"
    const subheading =
      props.subheading ??
      "Spin up secure sign-in, SSO, and MFA with a few lines of code. Free up to 10,000 monthly active users — no credit card required."
    const primaryCta = props.primaryCta ?? "Start Free"
    const primaryTarget = props.primaryTarget ?? "Sign Up"
    const secondaryCta = props.secondaryCta ?? "Read the Docs"
    const secondaryTarget = props.secondaryTarget ?? "Docs"

    return (
      <CtaBand
        tone="primary"
        eyebrow={eyebrow}
        title={headline}
        subtitle={subheading}
        actions={[
          { label: primaryCta, target: primaryTarget, variant: "primary" },
          { label: secondaryCta, target: secondaryTarget, variant: "outline" },
        ]}
        className={props.className}
      />
    )
  },
})
