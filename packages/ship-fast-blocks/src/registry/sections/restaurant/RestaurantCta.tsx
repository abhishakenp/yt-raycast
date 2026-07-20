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
import { Watermark } from '#/section-kit/Decor.tsx'
import {
  RestaurantMutationSpinner,
  RestaurantReservationButton,
} from './restaurant-interactions.tsx'
import { restaurantLakebed } from './restaurant-lakebed.ts'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * RestaurantCta — a menu-editorial reservation band for a restaurant home page.
 * Thin configuration over the shared `CtaBand` composite at `tone="muted"`: a
 * square-edged bordered card floats on the warm muted band, carrying a giant
 * faint "RESERVE" ghost watermark, a rotated hairline mono hours "stamp"
 * eyebrow, a warm serif headline, a short supporting subheading, and a centered
 * row of two square-edged CTAs with press feedback — a filled primary "Reserve
 * Now" button plus a hairline-outlined "Call Us" button that routes to contact.
 * Both actions navigate through the kit's section-kit route links so neither is
 * a dead link, and the accent stays reserved for the primary button. Use near
 * the bottom of a restaurant, bistro, ramen shop, sushi counter, or cafe page
 * to drive table reservations and calls. Renders fully with no props via warm,
 * appetizing baked-in defaults.
 */
export const RestaurantCta = defineCapsule({
  name: 'RestaurantCta',
  description:
    "Menu-editorial reservation band for a restaurant home page: a square-edged bordered card floats on the warm muted band, carrying a giant faint 'RESERVE' ghost watermark, a rotated hairline mono hours 'stamp' eyebrow, a warm serif headline, a short supporting subheading, and a centered row of two square-edged CTAs with press feedback (a filled primary 'Reserve Now' button plus a hairline-outlined 'Call Us' button). Both CTAs route through section-kit route links and the accent stays reserved for the primary button. Use near the bottom of a restaurant, bistro, ramen shop, sushi counter, or cafe page to drive table reservations and phone calls.",
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
        <CtaBandInner className="relative my-4 max-w-5xl overflow-hidden rounded-none border-2 border-foreground bg-background px-6 py-14 shadow-[10px_10px_0_0] shadow-foreground/15 sm:px-10 lg:px-16">
          <Watermark className="bottom-1 right-6 text-[3.5rem] leading-none sm:text-[5rem] lg:text-[6rem]">
            RESERVE
          </Watermark>
          <CtaBandEyebrow className="relative inline-flex rotate-[-2deg] items-center border border-foreground/30 px-2.5 py-1 font-mono text-[11px] font-normal uppercase tracking-[0.18em] text-muted-foreground opacity-100">
            {hours}
          </CtaBandEyebrow>
          <CtaBandTitle className="relative font-serif text-foreground">
            {headline}
          </CtaBandTitle>
          <CtaBandSubtitle className="relative text-muted-foreground">
            {subheading}
          </CtaBandSubtitle>
          <div className="relative flex flex-col items-center justify-center gap-3 sm:flex-row">
            <RestaurantReservationButton
              lakebed={lakebed}
              input={{ label: primaryCta, source: primaryTarget }}
              className="inline-flex min-h-12 min-w-36 items-center justify-center rounded-none bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-[background-color,transform] duration-150 hover:bg-primary/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-60"
              pendingChildren={<RestaurantMutationSpinner />}
            >
              {primaryCta}
            </RestaurantReservationButton>
            <CtaAction
              variant="outline"
              className="min-h-12 min-w-36 rounded-none border-foreground/30 px-6 py-3 text-sm font-semibold text-foreground transition-[background-color,transform] duration-150 hover:bg-muted active:translate-y-px"
              asChild
            >
              <NavbarRouteLink href={secondaryTarget}>
                {secondaryCta}
              </NavbarRouteLink>
            </CtaAction>
          </div>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
