import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { CtaBand } from "#/section-kit/CtaBand.tsx"

/**
 * PropertyListingCta — a closing call-to-action band for a property portal. A
 * rounded card surface centers an eyebrow, a bold headline, a supporting line,
 * and dual CTAs (filled "Start Searching" + outlined "Post a Listing") with a
 * small reassurance note beneath. Both CTAs route through useNavigate. Use to
 * convert searchers near the bottom of a property marketplace page. Renders
 * fully with no props via baked-in defaults.
 */
export const PropertyListingCta = defineComponent({
  name: "PropertyListingCta",
  description:
    "Closing call-to-action band for a property portal: a rounded card surface centering an eyebrow, a bold headline, a supporting line, and dual CTAs (filled 'Start Searching' + outlined 'Post a Listing') with a small reassurance note beneath. Both CTAs route through useNavigate. Use to convert searchers near the bottom of a property marketplace page.",
  props: z.object({
    /** Small uppercase eyebrow above the headline. */
    eyebrow: z.string().optional(),
    /** Bold headline. */
    heading: z.string().optional(),
    /** Supporting line beneath the headline. */
    subheading: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Route label the primary CTA navigates to. */
    primaryTarget: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Route label the secondary CTA navigates to. */
    secondaryTarget: z.string().optional(),
    /** Small reassurance note beneath the CTAs. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? "Your search starts here"
    const heading = props.heading ?? "Find your next place"
    const subheading =
      props.subheading ??
      "Browse thousands of verified listings, save your favorites, and get alerted the moment the right home shows up."
    const primaryCta = props.primaryCta ?? "Start Searching"
    const primaryTarget = props.primaryTarget ?? "For Sale"
    const secondaryCta = props.secondaryCta ?? "Post a Listing"
    const secondaryTarget = props.secondaryTarget ?? "Post"
    const note = props.note ?? "Free to browse · No account required to start"

    return (
      <CtaBand
        tone="primary"
        eyebrow={eyebrow}
        title={heading}
        subtitle={note ? `${subheading} ${note}` : subheading}
        actions={[
          { label: primaryCta, target: primaryTarget, variant: "primary" },
          { label: secondaryCta, target: secondaryTarget, variant: "outline" },
        ]}
        className={props.className}
      />
    )
  },
})
