import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * MarketplaceSellers — a "Featured Sellers" section. A heading + description on
 * the left and a "View all sellers" link on the right cap a responsive
 * 2/4-column grid of storefront cards; each card stacks a rounded cover photo
 * (with a star-rating chip and an optional eco-verified badge overlaid), then a
 * row pairing a circular seller avatar with the store name, location, and a
 * product-count + follower-count meta line. Clean, neutral, light e-commerce
 * aesthetic. Cards and the view-all link route through useNavigate; cover and
 * avatar use the alt-driven Image component. Use to spotlight top vendors on
 * online marketplaces, multi-vendor or maker/artisan platforms, and seller
 * communities.
 */
export const MarketplaceSellers = defineComponent({
  name: "MarketplaceSellers",
  description:
    "'Featured Sellers' section: a heading + description on the left and a 'View all sellers' link on the right cap a responsive 2/4-column grid of storefront cards, each stacking a rounded cover photo (with a star-rating chip and an optional eco-verified badge overlaid) above a row pairing a circular seller avatar with the store name, location, and a product-count + follower-count meta line. Clean, neutral, light e-commerce aesthetic. Cards and the view-all link route through useNavigate; cover and avatar use the alt-driven Image component. Use to spotlight top vendors on online marketplaces, multi-vendor or maker/artisan platforms, and seller communities.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    viewAll: z.string().optional(),
    items: z
      .array(
        z.object({
          name: z.string(),
          location: z.string(),
          rating: z.string(),
          products: z.string(),
          followers: z.string(),
          coverAlt: z.string(),
          avatarAlt: z.string(),
          eco: z.boolean().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const sellersHeading = props.heading ?? "Featured Sellers"
    const sellersDesc =
      props.description ??
      "Discover our most trusted and top-rated sellers, each verified and committed to quality"
    const sellersViewAll = props.viewAll ?? "View all 12,483 sellers"
    const sellerItems = props.items?.length
      ? props.items
      : [
          {
            name: "Artisan Home Co.",
            location: "Portland, Oregon",
            rating: "4.9",
            products: "847 products",
            followers: "12.4k followers",
            coverAlt:
              "Handcrafted wooden kitchen utensils and cutting boards on marble countertop",
            avatarAlt: "Portrait of male artisan woodworker in his workshop",
          },
          {
            name: "Tech Forward",
            location: "Austin, Texas",
            rating: "4.8",
            products: "1,234 products",
            followers: "28.9k followers",
            coverAlt:
              "Modern electronic gadgets including smartphone, earbuds, and smartwatch on dark surface",
            avatarAlt: "Professional headshot of female tech entrepreneur with short hair",
          },
          {
            name: "Green Earth Organics",
            location: "Sonoma, California",
            rating: "5.0",
            products: "342 products",
            followers: "8.2k followers",
            coverAlt:
              "Organic fresh produce and vegetables in woven baskets at farmers market",
            avatarAlt: "Portrait of male organic farmer in field wearing work shirt",
            eco: true,
          },
          {
            name: "Vintage Revival",
            location: "Brooklyn, New York",
            rating: "4.9",
            products: "567 products",
            followers: "15.6k followers",
            coverAlt:
              "Collection of vintage leather bags and accessories on rustic wooden shelf",
            avatarAlt:
              "Portrait of female vintage curator with styled hair and statement earrings",
          },
        ]

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className ?? "size-4"}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    const Star = ({ className }: { className?: string }) => (
      <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    const Check = ({ className }: { className?: string }) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    const BoxIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    )

    const UsersIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )

    return (
      <section
        className={cn("bg-background py-20 lg:py-28", props.className)}
        aria-labelledby="sellers-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h2
                id="sellers-heading"
                className="mb-4 text-3xl font-semibold text-foreground sm:text-4xl"
              >
                {sellersHeading}
              </h2>
              <p className="text-lg text-muted-foreground">{sellersDesc}</p>
            </div>
            <button
              type="button"
              onClick={() => go(sellersViewAll)}
              className="inline-flex items-center gap-2 font-medium text-foreground transition-colors hover:text-muted-foreground"
            >
              <span>{sellersViewAll}</span>
              <ArrowRight className="size-5" />
            </button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {sellerItems.map((seller) => (
              <button
                key={seller.name}
                type="button"
                onClick={() => go(seller.name)}
                className="group block w-full text-left"
              >
                <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                  <Image
                    alt={seller.coverAlt}
                    w={600}
                    h={450}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-card/95 px-2.5 py-1 text-xs font-semibold text-card-foreground backdrop-blur-sm">
                    <Star className="size-3 text-primary" />
                    {seller.rating}
                  </div>
                  {seller.eco ? (
                    <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-primary/15 px-2 py-1 text-xs font-semibold text-primary">
                      <Check className="size-3" />
                      Eco Verified
                    </div>
                  ) : null}
                </div>
                <div className="flex items-start gap-3">
                  <span className="size-10 shrink-0 overflow-hidden rounded-full border-2 border-card bg-muted shadow-sm">
                    <Image
                      alt={seller.avatarAlt}
                      w={100}
                      h={100}
                      className="size-full object-cover"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-foreground">
                      {seller.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {seller.location}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <BoxIcon className="size-3" />
                        {seller.products}
                      </span>
                      <span className="flex items-center gap-1">
                        <UsersIcon className="size-3" />
                        {seller.followers}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
