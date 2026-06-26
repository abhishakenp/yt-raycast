import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * FoodDeliveryCta — inverted app-download CTA panel for a food-delivery /
 * restaurant-marketplace site. A centered rounded foreground-on-background dark
 * card with a heading, a supporting paragraph, and two app-store buttons (Apple
 * App Store + Google Play, each with its brand glyph) on a light surface. Both
 * buttons route through useNavigate. Use as a final conversion push to drive app
 * installs for food-delivery apps, restaurant aggregators, or online-ordering
 * platforms. Renders fully with no props via baked-in defaults.
 */
export const FoodDeliveryCta = defineComponent({
  name: 'FoodDeliveryCta',
  description:
    'Inverted app-download CTA panel for a food-delivery / restaurant-marketplace site: a centered rounded foreground-on-background dark card with a heading, a supporting paragraph, and two app-store buttons (Apple App Store + Google Play, each with its brand glyph) on a light surface. Both buttons route through useNavigate. Use as a final conversion push to drive app installs for food-delivery apps, restaurant aggregators, online-ordering platforms, or takeout services.',
  props: z.object({
    /** CTA heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** App Store button label (also the navigate target). */
    appStore: z.string().optional(),
    /** Google Play button label (also the navigate target). */
    googlePlay: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const ctaHeading = props.heading ?? 'Ready to order?'
    const ctaDesc =
      props.description ??
      'Download the app and get your first delivery fee waived. Join over 2 million happy customers today.'
    const ctaAppStore = props.appStore ?? 'App Store'
    const ctaGooglePlay = props.googlePlay ?? 'Google Play'

    return (
      <section className={cn('py-20 lg:py-28', props.className)}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl bg-foreground p-8 text-center sm:p-12 lg:p-16">
            <h2 className="text-3xl font-semibold tracking-tight text-background sm:text-4xl">
              {ctaHeading}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-background/70">
              {ctaDesc}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                type="button"
                onClick={() => go(ctaAppStore)}
                className="inline-flex items-center gap-2 rounded-lg bg-background px-6 py-3 font-medium text-foreground transition-colors hover:bg-muted"
              >
                <svg
                  className="size-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.84-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                {ctaAppStore}
              </button>
              <button
                type="button"
                onClick={() => go(ctaGooglePlay)}
                className="inline-flex items-center gap-2 rounded-lg bg-background px-6 py-3 font-medium text-foreground transition-colors hover:bg-muted"
              >
                <svg
                  className="size-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M3,20.5V3.5C3,2.91 3.4,2.38 4,2.2L13.69,12.5L4,22.8C3.4,22.63 3,22.09 3,21.5V20.5M13.69,12.5L22.18,4.41C22.69,3.91 23.5,3.99 23.91,4.58C24.03,4.75 24.09,4.95 24.09,5.16V18.84C24.09,19.26 23.86,19.65 23.5,19.87C23.22,20.03 22.88,20.06 22.57,19.95L13.69,15.4V12.5M4,2.2L16.58,8.86L13.69,11.5L4,2.2Z" />
                </svg>
                {ctaGooglePlay}
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  },
})
