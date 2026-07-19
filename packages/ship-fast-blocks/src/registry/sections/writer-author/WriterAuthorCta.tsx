import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  CtaBand,
  CtaBandInner,
  CtaBandEyebrow,
  CtaBandTitle,
  CtaBandSubtitle,
  CtaBandActions,
  CtaAction,
} from '#/section-kit/CtaBand.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * WriterAuthorCta — a bold, centered book-purchase band for a literary author
 * home page. Thin configuration over the shared `CtaBand` composite at
 * `tone="primary"`: an "Out now" eyebrow, a strong serif headline, a short
 * supporting subheading, and a centered row of two routable pill CTAs — a
 * high-contrast "Buy the Book" button (variant "primary", auto-inverted to a
 * light pill on the primary band) plus an outlined "Find a Store" button
 * (variant "outline") that routes to the store locator. Both actions navigate
 * through the kit's section-kit route links so neither is a dead link. Use near the bottom
 * of an author, novelist, poet, or book-launch page to drive sales. Renders
 * fully with no props via baked-in "Eleanor Vance" defaults.
 */
export const WriterAuthorCta = defineCapsule({
  name: 'WriterAuthorCta',
  description:
    "Bold, centered book-purchase band for a literary author home page: a full-width primary-toned section with an 'Out now' eyebrow, a serif headline, a short supporting subheading, and a centered row of two pill CTAs (a high-contrast 'Buy the Book' button plus an outlined 'Find a Store' button). Both CTAs route through section-kit route links. Use near the bottom of an author, novelist, poet, or book-launch page to drive book sales.",
  props: z.object({
    /** Small eyebrow line above the headline (maps to CtaBand eyebrow). */
    eyebrow: z.string().optional(),
    /** Purchase headline (maps to CtaBand title). */
    title: z.string().optional(),
    /** Short supporting line under the headline (maps to CtaBand subtitle). */
    subtitle: z.string().optional(),
    /** High-contrast primary CTA label. */
    primaryLabel: z.string().optional(),
    /** Route label the primary CTA navigates to. */
    primaryTarget: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryLabel: z.string().optional(),
    /** Route label the secondary CTA navigates to. */
    secondaryTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Out now'
    const title = props.title ?? 'Get your copy today'
    const subtitle =
      props.subtitle ??
      "Eleanor Vance's latest novel is available now wherever books are sold."
    const primaryLabel = props.primaryLabel ?? 'Buy the Book'
    const primaryTarget = props.primaryTarget ?? 'Books'
    const secondaryLabel = props.secondaryLabel ?? 'Find a Store'
    const secondaryTarget = props.secondaryTarget ?? 'Stores'

    return (
      <CtaBand tone="primary" className={props.className}>
        <CtaBandInner>
          <CtaBandEyebrow>{eyebrow}</CtaBandEyebrow>
          <CtaBandTitle>{title}</CtaBandTitle>
          <CtaBandSubtitle>{subtitle}</CtaBandSubtitle>
          <CtaBandActions>
            <CtaAction variant="primary" asChild>
              <NavbarRouteLink href={primaryTarget}>
                {primaryLabel}
              </NavbarRouteLink>
            </CtaAction>
            <CtaAction variant="outline" asChild>
              <NavbarRouteLink href={secondaryTarget}>
                {secondaryLabel}
              </NavbarRouteLink>
            </CtaAction>
          </CtaBandActions>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
