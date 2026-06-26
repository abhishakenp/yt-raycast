import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

/**
 * FoodTruckHero — warm, editorial split hero for a gourmet food-truck landing page.
 * A two-column layout pairing a now-serving location pill, a large stacked multi-line
 * headline, a chef-story paragraph, dual rounded CTAs (filled primary + outlined
 * secondary), and a rating + open-hours row on the left, with a tall rounded dish
 * photo carrying a floating chef-owner card (avatar + name + role) on the right. CTAs
 * route through useNavigate; imagery uses the alt-driven Image component. Use as the
 * top hero for food trucks, street-food vendors, taco/burger/bowl concepts or
 * chef-driven mobile-food brands.
 */
export const FoodTruckHero = defineComponent({
  name: 'FoodTruckHero',
  description:
    'Warm, editorial split hero for a gourmet food-truck landing page: a two-column layout pairing a now-serving location pill, a large stacked multi-line headline, a chef-story paragraph, dual rounded CTAs (filled primary and outlined secondary), and a star-rating + open-hours row on the left, with a tall rounded dish photo carrying a floating chef-owner card (avatar, name, role) on the right. CTAs route through useNavigate; the photos use the alt-driven Image component. Use as the top hero for food trucks, street-food vendors, taco / burger / bowl concepts, pop-up kitchens or any chef-driven mobile-food brand.',
  props: z.object({
    badge: z.string().optional(),
    /** Heading lines rendered stacked. */
    headingLines: z.array(z.string()).optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    rating: z.string().optional(),
    hours: z.string().optional(),
    imageAlt: z.string().optional(),
    chefName: z.string().optional(),
    chefRole: z.string().optional(),
    chefAvatarAlt: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heroBadge = props.badge ?? 'Now serving Los Angeles'
    const heroHeadingLines = props.headingLines?.length
      ? props.headingLines
      : ['Street food.', 'Chef-made.', 'Served fresh.']
    const heroSub =
      props.subheading ??
      'Chef Marcus Chen brings 15 years of fine dining experience to the streets. Seasonal ingredients, bold flavors, zero pretension.'
    const heroPrimary = props.primaryCta ?? "View Today's Menu"
    const heroSecondary = props.secondaryCta ?? 'Find Us'
    const heroRating = props.rating ?? '4.9/5 (2,847 reviews)'
    const heroHours = props.hours ?? 'Open today 11am–8pm'
    const heroImageAlt =
      props.imageAlt ??
      'Gourmet tacos being prepared on a food truck griddle with fresh ingredients'
    const chefName = props.chefName ?? 'Chef Marcus Chen'
    const chefRole = props.chefRole ?? 'Executive Chef & Owner'
    const chefAvatarAlt =
      props.chefAvatarAlt ??
      'Professional headshot of Chef Marcus Chen in his kitchen uniform'

    const Star = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="16"
        height="16"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    return (
      <section
        className={cn('px-6 pb-20 pt-32 md:pb-32 md:pt-40', props.className)}
      >
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <div className="space-y-6">
            <span className="inline-block rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              {heroBadge}
            </span>
            <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              {heroHeadingLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
            <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
              {heroSub}
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => go(heroPrimary)}
                className="rounded-full bg-foreground px-6 py-3 font-medium text-background transition-colors hover:bg-foreground/90"
              >
                {heroPrimary}
              </button>
              <button
                type="button"
                onClick={() => go(heroSecondary)}
                className="rounded-full border border-border px-6 py-3 font-medium text-foreground transition-colors hover:bg-muted"
              >
                {heroSecondary}
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Star className="size-4 text-primary" />
                {heroRating}
              </span>
              <span className="flex items-center gap-2">
                <svg
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {heroHours}
              </span>
            </div>
          </div>
          <div className="relative">
            <Image
              alt={heroImageAlt}
              w={800}
              h={600}
              className="h-[400px] w-full rounded-2xl object-cover md:h-[500px]"
            />
            <div className="absolute -bottom-6 -left-6 hidden rounded-xl bg-card p-4 shadow-lg md:block">
              <div className="flex items-center gap-3">
                <Image
                  alt={chefAvatarAlt}
                  w={120}
                  h={120}
                  className="size-12 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-card-foreground">
                    {chefName}
                  </p>
                  <p className="text-xs text-muted-foreground">{chefRole}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  },
})
