import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  CtaBand,
  CtaBandInner,
  CtaBandEyebrow,
  CtaBandTitle,
  CtaBandSubtitle,
  CtaAction,
} from '#/section-kit/CtaBand.tsx'
import { useNavigate } from '#/lib/use-navigate.tsx'
import {
  RestaurantMutationSpinner,
  RestaurantReservationButton,
} from './restaurant-interactions.tsx'
import { restaurantLakebed } from './restaurant-lakebed.ts'

/**
 * RestaurantCta — a bold, centered reservation band for a restaurant home page.
 * Thin configuration over the shared `CtaBand` composite at `tone="primary"`:
 * an hours eyebrow, a strong headline, a short supporting subheading, and a
 * centered row of two routable pill CTAs — a high-contrast "Reserve Now" button
 * (variant "primary", auto-inverted to a light pill on the primary band) plus an
 * outlined "Call Us" button (variant "outline") that routes to contact. Both
 * actions navigate through the kit's useNavigate so neither is a dead link. Use
 * near the bottom of a restaurant, bistro, ramen shop, sushi counter, or cafe
 * page to drive table reservations and calls. Renders fully with no props via
 * warm, appetizing baked-in defaults.
 */
export const RestaurantCta = defineCapsule({
  name: 'RestaurantCta',
  description:
    "Bold, centered reservation band for a restaurant home page: a full-width section wrapping a strong primary-colored card with a serif headline, a short supporting subheading, a centered row of two pill CTAs (a high-contrast 'Reserve Now' button plus an outlined 'Call Us' button), and a small hours-and-phone strip beneath. Both CTAs route through useNavigate. Use near the bottom of a restaurant, bistro, ramen shop, sushi counter, or cafe page to drive table reservations and phone calls.",
  props: z.object({
    /** Reservation headline (maps to CtaBand title). */
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
    /** Hours line shown as the band eyebrow. */
    hours: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: restaurantLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const headline = props.headline ?? 'Join us for an unforgettable evening'
    const subheading =
      props.subheading ??
      'Tables fill fast on weekends — reserve yours now and let our kitchen take care of the rest.'
    const primaryCta = props.primaryCta ?? 'Reserve Now'
    const primaryTarget = props.primaryTarget ?? 'Reservations'
    const secondaryCta = props.secondaryCta ?? 'Call Us'
    const secondaryTarget = props.secondaryTarget ?? 'Contact'
    const hours = props.hours ?? 'Open Tue–Sun · 5pm–11pm'

    return (
      <CtaBand tone="muted" className={props.className}>
        <CtaBandInner className="max-w-7xl rounded-2xl bg-primary px-6 py-14 sm:px-10 lg:px-16">
          <CtaBandEyebrow className="text-primary-foreground/75 normal-case tracking-[0.18em] font-medium">
            {hours}
          </CtaBandEyebrow>
          <CtaBandTitle className="font-serif text-primary-foreground">
            {headline}
          </CtaBandTitle>
          <CtaBandSubtitle className="text-primary-foreground/80">
            {subheading}
          </CtaBandSubtitle>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <RestaurantReservationButton
              lakebed={lakebed}
              input={{ label: primaryCta, source: primaryTarget }}
              className="inline-flex min-h-12 min-w-36 items-center justify-center rounded-full bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-background/90 disabled:pointer-events-none disabled:opacity-60"
              pendingChildren={<RestaurantMutationSpinner />}
            >
              {primaryCta}
            </RestaurantReservationButton>
            <CtaAction
              variant="outline"
              className="min-h-12 min-w-36 rounded-full border-primary-foreground/35 px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => go(secondaryTarget)}
            >
              {secondaryCta}
            </CtaAction>
          </div>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
