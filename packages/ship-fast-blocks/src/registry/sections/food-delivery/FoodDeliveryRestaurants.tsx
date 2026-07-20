import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { foodDeliveryLakebed } from './food-delivery-lakebed.ts'
import {
  foodDeliveryRestaurant,
  useFoodDeliveryRestaurants,
  useFoodDeliverySearch,
  useSyncFoodDeliveryRestaurants,
} from './food-delivery-interactions.tsx'

/**
 * FoodDeliveryRestaurants — playful-bold staggered menu grid for a food-delivery
 * marketplace. A card-surfaced band with an asymmetric header (left-aligned mono
 * eyebrow + extrabold heading + subhead, a right-aligned chunky "View all" pill
 * link) above a responsive 2/4-up grid of clickable cuisine cards that stagger
 * downward in a checker rhythm. Each card is a chunky 2px-bordered plate with an
 * alt-driven food photo (zoom on hover), an overlaid cuisine chip and a rotated
 * rounded-full rating sticker, then a bold name, a mono category line, and a
 * delivery-time / delivery-fee row; a hard offset shadow lifts the card on hover
 * and the selected card wears a primary hard shadow. Restaurant cards update
 * shared Lakebed selected restaurant state, and the view-all link clears search
 * filters. Use to showcase restaurant discovery for food-delivery apps,
 * restaurant aggregators, or online-ordering platforms.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  RestaurantList,
  RestaurantItem,
} from '#/section-kit/RestaurantList.tsx'
export const FoodDeliveryRestaurants = defineCapsule({
  name: 'FoodDeliveryRestaurants',
  description:
    'Playful-bold staggered menu grid for a food-delivery marketplace: a card-surfaced band with an asymmetric header (left-aligned mono eyebrow + extrabold heading + subhead, right-aligned chunky View all pill link) above a responsive 2/4-up grid of clickable cuisine cards staggered in a checker rhythm. Each card is a chunky 2px-bordered plate with an alt-driven food photo (zoom-on-hover), an overlaid cuisine chip and a rotated rounded-full rating sticker, then a bold name, a mono category line, and a delivery-time / delivery-fee row, with a hard offset shadow lift on hover and a primary hard shadow when selected. Cards update shared Lakebed selected restaurant state; the view-all link clears shared search filters. Use to showcase restaurant discovery for food-delivery apps, restaurant aggregators, online-ordering platforms, or grocery/takeout services.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Subhead under the heading. */
    description: z.string().optional(),
    /** Right-aligned view-all link label (also the navigate target). */
    viewAll: z.string().optional(),
    /** Restaurant cards. */
    items: z
      .array(
        z.object({
          name: z.string(),
          cuisine: z.string(),
          category: z.string(),
          rating: z.string(),
          time: z.string(),
          delivery: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: foodDeliveryLakebed,
  component: ({ props, lakebed }) => {
    const foodSearch = useFoodDeliverySearch(lakebed)
    const restaurantActions = useFoodDeliveryRestaurants(lakebed)
    const restaurantsHeading = props.heading ?? 'Popular restaurants'
    const restaurantsDesc =
      props.description ?? 'Top-rated spots in your neighborhood'
    const restaurantsViewAll = props.viewAll ?? 'View all 240+ restaurants'
    const restaurantItems = props.items?.length
      ? props.items
      : [
          {
            name: "Mario's Pizzeria",
            cuisine: 'Italian',
            category: 'Pizza, Pasta, Italian',
            rating: '4.8',
            time: '25-35 min',
            delivery: '$2.49 delivery',
            imageAlt:
              'Wood-fired Neapolitan pizza with melted mozzarella and fresh basil on rustic wooden table',
          },
          {
            name: 'Sakura Sushi Bar',
            cuisine: 'Japanese',
            category: 'Sushi, Ramen, Japanese',
            rating: '4.9',
            time: '30-45 min',
            delivery: '$3.99 delivery',
            imageAlt:
              'Fresh salmon sushi rolls and sashimi platter on black slate serving board',
          },
          {
            name: 'The Burger Joint',
            cuisine: 'American',
            category: 'Burgers, Fries, Shakes',
            rating: '4.7',
            time: '20-30 min',
            delivery: 'Free delivery',
            imageAlt:
              'Juicy gourmet beef burger with melted cheese and caramelized onions on brioche bun',
          },
          {
            name: 'Thai Orchid',
            cuisine: 'Thai',
            category: 'Thai, Noodles, Curry',
            rating: '4.6',
            time: '35-50 min',
            delivery: '$2.99 delivery',
            imageAlt:
              'Steaming bowl of authentic Thai pad thai with shrimp and crushed peanuts',
          },
          {
            name: 'Olive Garden',
            cuisine: 'Mediterranean',
            category: 'Mediterranean, Greek',
            rating: '4.8',
            time: '25-40 min',
            delivery: '$2.49 delivery',
            imageAlt:
              'Colorful Mediterranean mezze platter with hummus falafel and pita bread',
          },
          {
            name: 'Wing King',
            cuisine: 'Wings',
            category: 'Chicken Wings, BBQ',
            rating: '4.5',
            time: '20-35 min',
            delivery: '$1.99 delivery',
            imageAlt:
              'Crispy golden fried chicken wings with buffalo sauce and celery sticks',
          },
          {
            name: 'Curry House',
            cuisine: 'Indian',
            category: 'Indian, Curry, Tandoori',
            rating: '4.7',
            time: '40-55 min',
            delivery: '$3.49 delivery',
            imageAlt:
              'Rich creamy Indian butter chicken curry with naan bread and rice',
          },
          {
            name: 'Sweet Treats Bakery',
            cuisine: 'Desserts',
            category: 'Cakes, Pastries, Coffee',
            rating: '4.9',
            time: '15-25 min',
            delivery: '$2.99 delivery',
            imageAlt:
              'Decadent chocolate cake with berries and powdered sugar dusting',
          },
        ]
    const syncedRestaurants = restaurantItems.map((item) =>
      foodDeliveryRestaurant(item),
    )
    useSyncFoodDeliveryRestaurants(lakebed, syncedRestaurants)
    const activeQuery = restaurantActions.state?.query.toLowerCase() ?? ''
    const selectedRestaurant = restaurantActions.state?.selectedRestaurant ?? ''
    const matchingRestaurants = restaurantItems.filter((restaurant) => {
      if (!activeQuery) return true
      const haystack = [
        restaurant.name,
        restaurant.cuisine,
        restaurant.category,
        restaurant.time,
        restaurant.delivery,
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(activeQuery)
    })
    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M9 5l7 7-7 7" />
      </svg>
    )
    return (
      <section
        className={cn('bg-card pt-20 pb-16 lg:pt-28 lg:pb-24', props.className)}
      >
        <Container>
          <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              align="left"
              eyebrow="On the menu"
              title={restaurantsHeading}
              subtitle={restaurantsDesc}
              className="max-w-2xl gap-3"
              eyebrowClassName="font-mono text-[11px] uppercase tracking-[0.2em] text-primary"
              titleClassName="text-3xl font-extrabold leading-[1.03] tracking-tighter text-foreground sm:text-4xl"
              subtitleClassName="text-lg text-muted-foreground"
            />
            <button
              type="button"
              onClick={() =>
                foodSearch.chooseSearch({
                  address: '',
                  query: '',
                })
              }
              className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border-2 border-foreground bg-background px-4 py-2 text-sm font-bold text-foreground shadow-[3px_3px_0_0] shadow-foreground transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0] hover:shadow-foreground active:translate-y-px active:shadow-none sm:self-auto"
            >
              {restaurantsViewAll}
              <ArrowRight className="size-4" />
            </button>
          </div>

          <p
            className="mb-6 font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground"
            aria-live="polite"
          >
            {matchingRestaurants.length} restaurant
            {matchingRestaurants.length === 1 ? '' : 's'} match the current
            search
            {restaurantActions.state?.selectionCount
              ? ` · ${restaurantActions.state.selectionCount} opened`
              : ''}
          </p>

          <RestaurantList className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {matchingRestaurants.map((r, i) => (
              <RestaurantItem
                asChild
                key={r.name}
                className={cn(i % 2 === 1 && 'lg:translate-y-8')}
              >
                <button
                  type="button"
                  aria-pressed={selectedRestaurant === r.name}
                  onClick={() => {
                    void restaurantActions.select({
                      cuisine: r.cuisine,
                      name: r.name,
                    })
                  }}
                  className={cn(
                    'group block w-full overflow-hidden rounded-none border-2 bg-background text-left transition-all hover:-translate-y-1 active:translate-y-px active:shadow-none motion-reduce:transform-none',
                    selectedRestaurant === r.name
                      ? 'border-foreground shadow-[5px_5px_0_0] shadow-primary/50'
                      : 'border-foreground/25 hover:border-foreground hover:shadow-[5px_5px_0_0] hover:shadow-foreground',
                  )}
                >
                  <div className="relative aspect-[4/3] overflow-hidden border-b-2 border-inherit">
                    <Image
                      alt={r.imageAlt}
                      w={400}
                      h={300}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="absolute left-3 top-3 rounded-full border-2 border-foreground bg-background/95 px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-foreground backdrop-blur-sm">
                      {r.cuisine}
                    </span>
                    <span className="absolute right-3 top-3 inline-flex rotate-3 items-center gap-1 rounded-full border-2 border-foreground bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground shadow-[2px_2px_0_0] shadow-foreground tabular-nums">
                      ★ {r.rating}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-extrabold tracking-tight text-foreground">
                      {r.name}
                    </h3>
                    <p className="mt-1 font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">
                      {r.category}
                    </p>
                    <div className="mt-4 flex items-center justify-between gap-2 border-t-2 border-foreground/10 pt-3">
                      <span className="text-sm font-medium text-muted-foreground tabular-nums">
                        {r.time}
                      </span>
                      <span className="rounded-full border-2 border-foreground/20 px-2.5 py-0.5 text-xs font-bold text-foreground">
                        {r.delivery}
                      </span>
                    </div>
                  </div>
                </button>
              </RestaurantItem>
            ))}
            {!matchingRestaurants.length ? (
              <div className="rounded-none border-2 border-dashed border-foreground/30 bg-background p-8 text-center font-mono text-sm uppercase tracking-[0.1em] text-muted-foreground sm:col-span-2 lg:col-span-4">
                No restaurants match the current search.
              </div>
            ) : null}
          </RestaurantList>
        </Container>
      </section>
    )
  },
})
