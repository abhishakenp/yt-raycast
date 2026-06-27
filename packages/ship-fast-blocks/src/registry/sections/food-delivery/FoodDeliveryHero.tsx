import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { foodDeliveryLakebed } from './food-delivery-lakebed.ts'
import { useFoodDeliverySearch } from './food-delivery-interactions.tsx'

/**
 * FoodDeliveryHero — split two-column hero band for a food-delivery / restaurant
 * landing page. On the left: a big two-line headline, a supporting paragraph, a
 * rounded-full delivery-address search input with a leading map-pin icon and a
 * filled "Find Food" submit button, plus a small serving-cities note. On the
 * right: a large rounded food photo with a floating "Order Confirmed / arriving
 * in N min" tracking card pinned to its bottom-left corner. The form submit
 * writes shared Lakebed delivery search state so restaurant results update below.
 * Use as the opening hero for food-delivery apps, restaurant aggregators,
 * online-ordering platforms, or grocery/takeout services.
 */
export const FoodDeliveryHero = defineCapsule({
  name: 'FoodDeliveryHero',
  description:
    "Split two-column hero band for a food-delivery / restaurant landing page: left column with a big two-line headline, a supporting paragraph, a rounded-full delivery-address search input (leading map-pin icon) and a filled Find Food submit button plus a serving-cities note; right column with a large rounded food photo and a floating 'Order Confirmed / arriving in N min' tracking card pinned to its bottom-left. Form-submit writes shared Lakebed delivery search state so restaurant results update below; the food image is alt-driven. Use as the opening hero for food-delivery apps, restaurant aggregators, online-ordering platforms, or grocery/takeout services.",
  props: z.object({
    /** First headline line. */
    headingTop: z.string().optional(),
    /** Second headline line. */
    headingBottom: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Placeholder text for the delivery-address input. */
    addressPlaceholder: z.string().optional(),
    /** Filled search submit button label (also the navigate target). */
    searchCta: z.string().optional(),
    /** Small serving-cities note under the search form. */
    serving: z.string().optional(),
    /** Alt text for the hero food photo. */
    imageAlt: z.string().optional(),
    /** Title line of the floating tracking card. */
    badgeTitle: z.string().optional(),
    /** Subtitle line of the floating tracking card. */
    badgeSubtitle: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: foodDeliveryLakebed,
  component: ({ props, lakebed }) => {
    const foodSearch = useFoodDeliverySearch(lakebed)
    const headingTop = props.headingTop ?? 'Your favorite food,'
    const headingBottom = props.headingBottom ?? 'delivered in minutes'
    const heroSub =
      props.subheading ??
      'From local favorites to national chains, Nosh brings the best restaurants in your city straight to your door. Track your order in real-time, every time.'
    const addressPlaceholder =
      props.addressPlaceholder ?? 'Enter your delivery address'
    const searchCta = props.searchCta ?? 'Find Food'
    const serving =
      props.serving ??
      'Serving San Francisco, Los Angeles, New York & 40+ cities nationwide'
    const heroImageAlt =
      props.imageAlt ??
      'Overhead view of colorful gourmet dishes arranged on marble table with fresh vegetables and herbs'
    const badgeTitle = props.badgeTitle ?? 'Order Confirmed'
    const badgeSubtitle = props.badgeSubtitle ?? 'Arriving in 24 min'
    const addressValue = foodSearch.state?.address ?? ''

    return (
      <section className={cn('pb-16 pt-32 lg:pb-24 lg:pt-40', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                {headingTop}
                <br />
                {headingBottom}
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
                {heroSub}
              </p>
              <form
                key={addressValue}
                className="mt-8 flex flex-col gap-3 sm:flex-row"
                onSubmit={foodSearch.submitSearch}
              >
                <div className="relative max-w-sm flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <svg
                      className="size-5 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="address"
                    defaultValue={addressValue}
                    aria-label={addressPlaceholder}
                    placeholder={addressPlaceholder}
                    className="w-full rounded-full border border-input bg-background py-3.5 pl-11 pr-4 text-foreground placeholder-muted-foreground transition-all focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>
                <button
                  type="submit"
                  aria-busy={foodSearch.isPending}
                  disabled={foodSearch.isPending}
                  className="inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
                >
                  {foodSearch.isPending ? 'Finding' : searchCta}
                </button>
              </form>
              <p
                className="mt-3 text-sm text-muted-foreground"
                aria-live="polite"
              >
                {addressValue
                  ? `Showing restaurants for ${addressValue}.`
                  : 'Search is shared with the restaurant results below.'}
              </p>
              <p className="mt-4 text-sm text-muted-foreground">{serving}</p>
            </div>
            <div className="relative">
              <Image
                alt={heroImageAlt}
                w={800}
                h={600}
                className="aspect-[4/3] w-full rounded-xl object-cover shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 flex items-center gap-3 rounded-xl bg-card p-4 shadow-lg">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                  <svg
                    className="size-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-card-foreground">
                    {badgeTitle}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {badgeSubtitle}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  },
})
