import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * JewelryStorePieces — featured-pieces product grid for a luxury jewelry
 * boutique. A header row pairs a gold eyebrow + serif heading with a
 * right-aligned underlined "View All" link, above a responsive grid (1/2/4
 * cols) of clickable product cards: a square image that zooms on hover with
 * an optional corner status badge (New uses primary, others use secondary),
 * a serif title, a muted spec line, and a gold price. Every card and the
 * View All link route through useNavigate. Use to merchandise individual
 * pieces (rings, necklaces, earrings, bracelets) for fine jewelers, diamond
 * houses, or watch maisons. Renders fully with no props via baked-in defaults.
 */
export const JewelryStorePieces = defineComponent({
  name: "JewelryStorePieces",
  description:
    "Featured-pieces product grid for a luxury jewelry boutique: a header row pairing a gold eyebrow + serif heading with a right-aligned underlined View All link, above a responsive grid (1/2/4 cols) of clickable product cards, each a square image that zooms on hover with an optional corner status badge (New = primary, others = secondary), a serif title, a muted spec line, and a gold price. Every card and the View All link route through useNavigate. Use to merchandise individual pieces (rings, necklaces, earrings, bracelets) for fine jewelers, diamond houses, or watch maisons.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    viewAll: z.string().optional(),
    items: z
      .array(
        z.object({
          title: z.string(),
          spec: z.string(),
          price: z.string(),
          imageAlt: z.string(),
          badge: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? "Current Selection"
    const heading = props.heading ?? "Featured Pieces"
    const viewAll = props.viewAll ?? "View All Jewelry"
    const items = props.items?.length
      ? props.items
      : [
          {
            title: "Solitaire Eternity Ring",
            spec: "Platinum, 2.1ct D-VVS1",
            price: "$18,500",
            badge: "New",
            imageAlt:
              "round brilliant cut diamond solitaire ring in platinum setting",
          },
          {
            title: "Pendant Lumière",
            spec: "18K Yellow Gold, 0.5ct",
            price: "$3,200",
            imageAlt: "gold chain necklace with small round diamond pendant",
          },
          {
            title: "Halo Stud Earrings",
            spec: "White Gold, 1.4ctw",
            price: "$7,800",
            badge: "Bestseller",
            imageAlt: "halo diamond stud earrings with milgrain detailing",
          },
          {
            title: "Tennis Classic Bracelet",
            spec: "White Gold, 5.0ctw",
            price: "$22,000",
            imageAlt:
              "tennis bracelet with round diamonds in white gold setting",
          },
          {
            title: "Pearl Cascade Drops",
            spec: "18K Gold, South Sea Pearls",
            price: "$4,500",
            imageAlt: "pearl drop earrings with diamond accents in yellow gold",
          },
          {
            title: "Onyx Signet Cufflinks",
            spec: "Sterling Silver, Onyx",
            price: "$1,450",
            imageAlt: "men's cufflinks with mother of pearl inlay in white gold",
          },
          {
            title: "Art Deco Sapphire Ring",
            spec: "Platinum, Ceylon Sapphire",
            price: "$32,500",
            badge: "Limited",
            imageAlt: "sapphire and diamond cocktail ring with art deco design",
          },
          {
            title: "Baguette Eternity Band",
            spec: "White Gold, 2.8ctw",
            price: "$12,800",
            imageAlt: "eternity band ring with channel-set baguette diamonds",
          },
        ]

    return (
      <section className={cn("bg-background py-32", props.className)}>
        <div className="w-full px-6 lg:px-12 xl:px-20">
          <div className="mb-16 flex flex-col lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-4 text-sm uppercase tracking-[0.3em] text-primary">
                {eyebrow}
              </p>
              <h2 className="font-serif text-4xl text-foreground lg:text-5xl">
                {heading}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => go(viewAll)}
              className="mt-6 inline-block w-fit border-b border-primary pb-0.5 text-sm uppercase tracking-widest text-primary lg:mt-0"
            >
              {viewAll}
            </button>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((p) => (
              <button
                key={p.title}
                type="button"
                onClick={() => go(p.title)}
                className="group block w-full cursor-pointer text-left"
              >
                <div className="relative mb-5 aspect-square overflow-hidden bg-muted">
                  <Image
                    alt={p.imageAlt}
                    w={600}
                    h={600}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {p.badge ? (
                    <span
                      className={cn(
                        "absolute left-4 top-4 px-3 py-1 text-xs uppercase tracking-widest",
                        p.badge === "New"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground",
                      )}
                    >
                      {p.badge}
                    </span>
                  ) : null}
                </div>
                <h3 className="mb-1 font-serif text-lg text-foreground">
                  {p.title}
                </h3>
                <p className="mb-2 text-sm text-muted-foreground">{p.spec}</p>
                <p className="text-primary">{p.price}</p>
              </button>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
