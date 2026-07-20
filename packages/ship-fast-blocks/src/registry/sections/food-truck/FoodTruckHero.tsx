import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { HeroSection, HeroContent } from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { commerceCartLakebed } from '../commerce/cart-lakebed.ts'
import {
  CommerceAddItemButton,
  CommerceMutationSpinner,
  commerceProduct,
  useSyncCommerceCatalog,
} from '../commerce/commerce-interactions.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * FoodTruckHero — sticker-poster split hero for a gourmet food-truck landing page.
 * An asymmetric 7:5 split under a giant ghost watermark word: on the wide left a
 * rotated rubber-stamp "now serving" chip + a mono index rail, a chunky extrabold
 * slab headline whose final line sits on a tilted bg-primary marker highlight, a
 * chef-story paragraph, a trio of hard-bordered rounded-none slab CTAs (filled slab
 * primary + outlined + add-to-cart) with offset token shadows and press feedback,
 * and a mono rating + open-hours meta strip over a hazard-lite accent rule. On the
 * narrow right a tall dish photo in a sharp 2px-bordered plate tilted over a
 * primary-tinted offset frame, carrying a rotated chef-owner sticker card. CTAs route
 * through section-kit route links; imagery uses the alt-driven Image component. Use as
 * the top hero for food trucks, street-food vendors, taco/burger/bowl concepts or
 * chef-driven mobile-food brands.
 */
export const FoodTruckHero = defineCapsule({
  name: 'FoodTruckHero',
  description:
    'Sticker-poster split hero for a gourmet food-truck landing page: an asymmetric 7:5 split under a giant ghost watermark word, with a rotated rubber-stamp now-serving chip and mono index rail, a chunky extrabold slab headline whose final line sits on a tilted bg-primary marker highlight, a chef-story paragraph, a trio of hard-bordered rounded-none slab CTAs (filled slab primary, outlined, and add-to-cart) with offset token shadows and press feedback, and a mono star-rating + open-hours meta strip; the dish photo sits in a sharp 2px-bordered plate tilted over a primary-tinted offset frame carrying a rotated chef-owner sticker card. CTAs route through section-kit route links; the photos use the alt-driven Image component. Use as the top hero for food trucks, street-food vendors, taco / burger / bowl concepts, pop-up kitchens or any chef-driven mobile-food brand.',
  props: z.object({
    badge: z.string().optional(),
    /** Heading lines rendered stacked. */
    headingLines: z.array(z.string()).optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    featuredItemName: z.string().optional(),
    featuredItemPrice: z.string().optional(),
    featuredItemSubtitle: z.string().optional(),
    addLabel: z.string().optional(),
    rating: z.string().optional(),
    hours: z.string().optional(),
    imageAlt: z.string().optional(),
    chefName: z.string().optional(),
    chefRole: z.string().optional(),
    chefAvatarAlt: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: commerceCartLakebed,
  component: ({ props, lakebed }) => {
    const heroBadge = props.badge ?? 'Now serving Los Angeles'
    const heroHeadingLines = props.headingLines?.length
      ? props.headingLines
      : ['Street food.', 'Chef-made.', 'Served fresh.']
    const heroSub =
      props.subheading ??
      'Chef Marcus Chen brings 15 years of fine dining experience to the streets. Seasonal ingredients, bold flavors, zero pretension.'
    const heroPrimary = props.primaryCta ?? "View Today's Menu"
    const heroSecondary = props.secondaryCta ?? 'Find Us'
    const featuredItemName = props.featuredItemName ?? 'Korean Short Rib Tacos'
    const featuredItemPrice = props.featuredItemPrice ?? '$14'
    const featuredItemSubtitle =
      props.featuredItemSubtitle ?? 'Chef favorite · signature menu'
    const addLabel = props.addLabel ?? 'Add to cart'
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

    useSyncCommerceCatalog(lakebed, [
      commerceProduct({
        imageAlt: heroImageAlt,
        label: featuredItemName,
        price: featuredItemPrice,
        subtitle: featuredItemSubtitle,
      }),
    ])

    // Split the headline so the last line carries the tilted marker highlight
    // without altering the copy.
    const headingLead = heroHeadingLines.slice(0, -1)
    const headingLast = heroHeadingLines[heroHeadingLines.length - 1]

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
      <HeroSection
        variant="default"
        className={cn(
          'relative overflow-hidden px-6 pt-24 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Watermark className="-right-8 top-10 text-[6rem] sm:text-[10rem] lg:text-[15rem]">
          FRESH
        </Watermark>
        <Container asChild size="lg">
          <HeroContent className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <span className="inline-flex -rotate-2 items-center gap-2 rounded-full border-2 border-foreground bg-background px-3.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-foreground shadow-[3px_3px_0_0] shadow-primary/40">
                  <span
                    aria-hidden="true"
                    className="size-2 rounded-full bg-primary"
                  />
                  {heroBadge}
                </span>
                <MonoTag>01 / Street Food</MonoTag>
              </div>

              <h1 className="text-5xl font-extrabold leading-[0.95] tracking-tighter sm:text-6xl lg:text-7xl">
                {headingLead.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
                <span className="mt-1 block">
                  <span className="relative inline-block whitespace-nowrap">
                    <span
                      aria-hidden="true"
                      className="absolute -inset-x-2 inset-y-1 -rotate-1 bg-primary"
                    />
                    <span className="relative text-primary-foreground">
                      {headingLast}
                    </span>
                  </span>
                </span>
              </h1>

              <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
                {heroSub}
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <NavbarRouteLink
                  className="rounded-none border-2 border-foreground bg-foreground px-6 py-3 font-bold text-background shadow-[4px_4px_0_0] shadow-primary/40 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0] active:translate-y-px active:shadow-none"
                  href={heroPrimary}
                >
                  {heroPrimary}
                </NavbarRouteLink>
                <NavbarRouteLink
                  className="rounded-none border-2 border-foreground bg-background px-6 py-3 font-bold text-foreground transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0] hover:shadow-foreground active:translate-y-px active:shadow-none"
                  href={heroSecondary}
                >
                  {heroSecondary}
                </NavbarRouteLink>
                <CommerceAddItemButton
                  lakebed={lakebed}
                  item={{
                    label: featuredItemName,
                    price: featuredItemPrice,
                  }}
                  aria-label={`${addLabel} ${featuredItemName}`}
                  pendingChildren={<CommerceMutationSpinner />}
                  className="inline-flex items-center justify-center rounded-none border-2 border-foreground bg-primary px-6 py-3 font-bold text-primary-foreground shadow-[4px_4px_0_0] shadow-foreground transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0] active:translate-y-px active:shadow-none disabled:pointer-events-none disabled:opacity-70"
                >
                  {addLabel}
                </CommerceAddItemButton>
              </div>

              <div
                aria-hidden="true"
                className="mt-8 h-1.5 w-full bg-[repeating-linear-gradient(45deg,currentColor_0px,currentColor_3px,transparent_3px,transparent_9px)] text-foreground/20"
              />
              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground">
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
                  className="relative h-[400px] w-full rounded-none border-2 border-foreground object-cover md:h-[500px]"
                />
              </div>
              <div className="absolute -bottom-5 -left-4 hidden -rotate-2 rounded-none border-2 border-foreground bg-card p-3.5 shadow-[4px_4px_0_0] shadow-foreground md:block">
                <div className="flex items-center gap-3">
                  <Image
                    alt={chefAvatarAlt}
                    w={120}
                    h={120}
                    className="size-11 rounded-none border-2 border-foreground object-cover"
                  />
                  <div>
                    <p className="text-sm font-extrabold text-card-foreground">
                      {chefName}
                    </p>
                    <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                      {chefRole}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </HeroContent>
        </Container>
      </HeroSection>
    )
  },
})
