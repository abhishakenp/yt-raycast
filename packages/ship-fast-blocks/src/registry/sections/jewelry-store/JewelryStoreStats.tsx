import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"

/**
 * JewelryStoreStats — heritage stats band for a luxury jewelry maison. A clean
 * centered responsive grid (1/2/4 cols) of metric blocks, each pairing a large
 * gold serif value with a wide letter-spaced uppercase muted label. Use to
 * convey legacy and scale — years of heritage, pieces crafted, master artisans,
 * global boutiques — for fine jewelers, diamond houses, or high-jewelry maisons.
 * Renders fully with no props via baked-in defaults.
 */
export const JewelryStoreStats = defineComponent({
  name: "JewelryStoreStats",
  description:
    "Heritage stats band for a luxury jewelry maison: a clean centered responsive grid (1/2/4 cols) of metric blocks, each pairing a large gold serif value with a wide letter-spaced uppercase muted label. Use to convey legacy and scale — years of heritage, pieces crafted, master artisans, global boutiques — for fine jewelers, diamond houses, or high-jewelry maisons.",
  props: z.object({
    items: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const items = props.items?.length
      ? props.items
      : [
          { value: "130+", label: "Years of Heritage" },
          { value: "12,000+", label: "Pieces Crafted" },
          { value: "47", label: "Master Artisans" },
          { value: "4", label: "Global Boutiques" },
        ]

    return (
      <section className={cn("bg-background py-32", props.className)}>
        <div className="w-full px-6 lg:px-12 xl:px-20">
          <div className="grid gap-12 text-center md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {items.map((s) => (
              <div key={s.label}>
                <p className="mb-3 font-serif text-5xl text-primary lg:text-6xl">
                  {s.value}
                </p>
                <p className="text-sm uppercase tracking-widest text-muted-foreground">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
