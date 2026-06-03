import type { ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * MarketplaceCategories — a "Browse by Category" section on a subtle muted band.
 * A centered heading + description sits above a responsive 2/3/4-column grid of
 * tappable category tiles; each card is a bordered surface with a rounded
 * icon-chip (rotating line-icon set) that tints on hover, a category title, and
 * an item-count line. Clean, neutral, light e-commerce aesthetic. Every tile
 * routes through useNavigate by category title. Use to surface top product
 * categories on online marketplaces, multi-vendor or maker/artisan platforms,
 * handmade/craft stores, and retail aggregators.
 */
export const MarketplaceCategories = defineComponent({
  name: "MarketplaceCategories",
  description:
    "'Browse by Category' section on a subtle muted band: a centered heading + description above a responsive 2/3/4-column grid of tappable category tiles, each a bordered surface with a rounded icon-chip (rotating line-icon set) that tints on hover, a category title, and an item-count line. Clean, neutral, light e-commerce aesthetic. Every tile routes through useNavigate by category title. Use to surface top product categories on online marketplaces, multi-vendor or maker/artisan platforms, handmade/craft stores, and retail aggregators.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(z.object({ title: z.string(), count: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const catHeading = props.heading ?? "Browse by Category"
    const catDesc =
      props.description ??
      "Explore our curated collection across 8 major categories with over 50,000 unique products"
    const catItems = props.items?.length
      ? props.items
      : [
          { title: "Electronics", count: "12,847 items" },
          { title: "Fashion", count: "24,392 items" },
          { title: "Home & Living", count: "8,156 items" },
          { title: "Art & Collectibles", count: "5,203 items" },
          { title: "Health & Beauty", count: "6,891 items" },
          { title: "Sports & Outdoors", count: "4,127 items" },
          { title: "Books & Media", count: "9,564 items" },
          { title: "Crafts & Supplies", count: "3,742 items" },
        ]

    const categoryIcons: ReactNode[] = [
      <svg key="i0" className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>,
      <svg key="i1" className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>,
      <svg key="i2" className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>,
      <svg key="i3" className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>,
      <svg key="i4" className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>,
      <svg key="i5" className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
      </svg>,
      <svg key="i6" className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>,
      <svg key="i7" className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>,
    ]

    return (
      <section
        className={cn("bg-muted/40 py-20 lg:py-28", props.className)}
        aria-labelledby="categories-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2
              id="categories-heading"
              className="mb-4 text-3xl font-semibold text-foreground sm:text-4xl"
            >
              {catHeading}
            </h2>
            <p className="text-lg text-muted-foreground">{catDesc}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {catItems.map((cat, i) => (
              <button
                key={cat.title}
                type="button"
                onClick={() => go(cat.title)}
                className="group rounded-2xl border border-border bg-card p-6 text-center transition-all hover:border-input hover:shadow-lg"
              >
                <div className="mx-auto mb-4 grid size-16 place-items-center rounded-xl bg-muted text-muted-foreground transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                  {categoryIcons[i % categoryIcons.length]}
                </div>
                <h3 className="mb-1 font-semibold text-card-foreground">
                  {cat.title}
                </h3>
                <p className="text-sm text-muted-foreground">{cat.count}</p>
              </button>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
