import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { foodDeliveryLakebed } from './food-delivery-lakebed.ts'
import { useFoodDeliverySearch } from './food-delivery-interactions.tsx'
import {
  SearchForm,
  SearchField,
  SearchFieldIcon,
  SearchFieldInput,
  SearchSubmit,
} from '#/section-kit/SearchForm.tsx'

/**
 * FoodDeliveryHero — playful-bold asymmetric 7:5 split hero for a food-delivery
 * / restaurant landing page under a giant ghost "HUNGRY?" watermark. On the
 * wide left: a mono index eyebrow + rotated live sticker chip, a big two-line
 * headline whose last word sits on a tilted primary marker highlight, a
 * supporting paragraph, a chunky 2px-bordered rounded-full delivery-address
 * search input with a leading map-pin icon and a hard-shadowed "Find Food"
 * submit pill with press feedback, plus a serving-cities note. On the narrow
 * right: a large food photo in a tilted 2px-bordered plate floating over a
 * primary-tinted offset frame, a rotated rounded-full ETA sticker, and a chunky
 * bordered "Order Confirmed / arriving in N min" tracking card. The form submit
 * writes shared Lakebed delivery search state so restaurant results update
 * below; the food image is alt-driven. Use as the opening hero for food-delivery
 * apps, restaurant aggregators, online-ordering platforms, or grocery/takeout
 * services.
 */
import { Container } from '#/section-kit/Container.tsx'
import { HeroSection } from '#/section-kit/HeroSection.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
export const FoodDeliveryHero = defineCapsule({
  name: 'FoodDeliveryHero',
  description:
    "Playful-bold asymmetric 7:5 split hero for a food-delivery / restaurant landing page under a giant ghost 'HUNGRY?' watermark: a wide left column with a mono index eyebrow + rotated live sticker chip, a two-line headline whose last word sits on a tilted primary marker highlight, a supporting paragraph, a chunky 2px-bordered rounded-full delivery-address search input (leading map-pin icon) and a hard-shadowed Find Food submit pill with press feedback plus a serving-cities note; a narrow right column with a large food photo in a tilted 2px-bordered plate over a primary-tinted offset frame, a rotated rounded-full ETA sticker, and a chunky bordered 'Order Confirmed / arriving in N min' tracking card. Form-submit writes shared Lakebed delivery search state so restaurant results update below; the food image is alt-driven. Use as the opening hero for food-delivery apps, restaurant aggregators, online-ordering platforms, or grocery/takeout services.",
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
    // Split the second headline line so its last word can carry the tilted
    // primary marker highlight without changing the copy.
    const bottomWords = headingBottom.trim().split(' ')
    const bottomLast = bottomWords.length > 1 ? bottomWords.pop() : null
    const bottomLead = bottomWords.join(' ')
    return (
      <HeroSection
        variant="split"
        className={cn(
          'relative overflow-hidden bg-card pb-16 pt-20 lg:pb-24 lg:pt-28',
          props.className,
        )}
      >
        <Watermark className="-right-8 top-10 text-[6rem] sm:text-[10rem] lg:text-[14rem]">
          HUNGRY?
        </Watermark>
        <Container className="relative">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
            <div className="max-w-2xl lg:col-span-7">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className="inline-flex -rotate-1 items-center gap-2 rounded-full border-2 border-foreground bg-background px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-foreground shadow-[3px_3px_0_0] shadow-primary/40">
                  <span
                    aria-hidden="true"
                    className="size-2 rounded-full bg-primary"
                  />
                  Live in your city
                </span>
                <MonoTag>01 / Order in</MonoTag>
              </div>
              <h1 className="text-4xl font-extrabold leading-[1.02] tracking-tighter text-foreground sm:text-5xl lg:text-6xl">
                {headingTop}
                <br />
                {bottomLast ? (
                  <>
                    {bottomLead}{' '}
                    <span className="relative inline-block whitespace-nowrap">
                      <span
                        aria-hidden="true"
                        className="absolute -inset-x-2 inset-y-1 -rotate-1 bg-primary"
                      />
                      <span className="relative text-primary-foreground">
                        {bottomLast}
                      </span>
                    </span>
                  </>
                ) : (
                  headingBottom
                )}
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
                {heroSub}
              </p>
              <SearchForm
                key={addressValue}
                layout="row"
                className="mt-8"
                onSubmit={foodSearch.submitSearch}
              >
                <SearchField className="max-w-sm flex-1">
                  <SearchFieldIcon>
                    <svg
                      className="size-5"
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
                  </SearchFieldIcon>
                  <SearchFieldInput
                    type="text"
                    name="address"
                    defaultValue={addressValue}
                    aria-label={addressPlaceholder}
                    placeholder={addressPlaceholder}
                    className="rounded-full border-2 border-foreground py-3.5 pl-11 transition-all focus:ring-ring/20"
                  />
                </SearchField>
                <SearchSubmit
                  aria-busy={foodSearch.isPending}
                  disabled={foodSearch.isPending}
                  className="rounded-full border-2 border-foreground bg-foreground px-6 py-3.5 text-sm font-bold text-background shadow-[3px_3px_0_0] shadow-primary/40 transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0] hover:shadow-primary/40 active:translate-y-px active:shadow-none"
                >
                  {foodSearch.isPending ? 'Finding' : searchCta}
                </SearchSubmit>
              </SearchForm>
              <p
                className="mt-3 text-sm text-muted-foreground"
                aria-live="polite"
              >
                {addressValue
                  ? `Showing restaurants for ${addressValue}.`
                  : 'Search is shared with the restaurant results below.'}
              </p>
              <p className="mt-4 font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
                {serving}
              </p>
            </div>
            <div className="relative lg:col-span-5">
              <div className="relative rotate-1">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 translate-x-3 translate-y-3 border-2 border-primary/40 bg-primary/10"
                />
                <Image
                  alt={heroImageAlt}
                  w={800}
                  h={600}
                  className="relative aspect-[4/3] w-full rounded-none border-2 border-foreground object-cover"
                />
                <span
                  aria-hidden="true"
                  className="absolute -right-3 -top-3 rotate-6 rounded-full border-2 border-foreground bg-primary px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-primary-foreground shadow-[2px_2px_0_0] shadow-foreground"
                >
                  25 min
                </span>
              </div>
              <div className="absolute -bottom-5 -left-4 flex -rotate-1 items-center gap-3 rounded-none border-2 border-foreground bg-background p-4 shadow-[4px_4px_0_0] shadow-foreground sm:-left-6">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-foreground bg-primary text-primary-foreground">
                  <svg
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {badgeTitle}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {badgeSubtitle}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
