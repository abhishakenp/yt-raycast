import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { Image } from "#/lib/img.tsx"

/**
 * HotelResortAmenities — editorial amenities grid for a luxury hotel / resort &
 * spa site. A left-aligned eyebrow + thin heading + supporting paragraph, then
 * a 2-up / 3-up grid of cards, each a rounded image that gently zooms on hover
 * above a title and a short description. Airy and high-end. Use to showcase
 * resort amenities — spa & wellness, dining, pools, fitness, beach access,
 * events — for hotels, resorts, spa retreats, inns, or wellness destinations.
 * Imagery uses the alt-driven Image component. Renders fully with no props via
 * baked-in resort defaults.
 */
export const HotelResortAmenities = defineComponent({
  name: "HotelResortAmenities",
  description:
    "Editorial amenities grid for a luxury hotel / resort & spa site: a left-aligned uppercase eyebrow + thin heading + supporting paragraph, then a 2-up / 3-up grid of cards, each a rounded image that gently zooms on hover above a title and short description. Airy and high-end; imagery uses the alt-driven Image component. Use to showcase resort amenities — spa & wellness, dining, pools, fitness, beach access, events — for hotels, resorts, spa retreats, inns, or wellness destinations.",
  props: z.object({
    /** Uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Amenity cards: title, description, image alt. */
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? "Amenities"
    const heading = props.heading ?? "Every detail considered"
    const description =
      props.description ??
      "From sunrise yoga on the beach to private chef dinners, experience amenities designed for the discerning traveler."
    const items = props.items?.length
      ? props.items
      : [
          {
            title: "Azure Spa & Wellness",
            description:
              "12,000 square feet of tranquility featuring 14 treatment rooms, hydrotherapy pools, and signature ocean-inspired therapies.",
            imageAlt:
              "Luxury spa treatment room with massage tables, warm lighting, and ocean views",
          },
          {
            title: "Coastal Dining",
            description:
              "Three restaurants including Selene, our Michelin-starred tasting menu experience featuring locally-sourced California cuisine.",
            imageAlt:
              "Elegant fine dining restaurant interior with white tablecloths and ambient lighting",
          },
          {
            title: "Oceanfront Pools",
            description:
              "Three temperature-controlled pools including our signature infinity pool with private cabanas and full beverage service.",
            imageAlt:
              "Infinity edge swimming pool overlooking the ocean with lounge chairs",
          },
          {
            title: "Fitness Center",
            description:
              "24-hour state-of-the-art facility with Peloton bikes, free weights, and daily yoga, Pilates, and meditation classes.",
            imageAlt:
              "Modern fitness center with floor-to-ceiling windows overlooking the ocean",
          },
          {
            title: "Private Beach Access",
            description:
              "1.2 miles of pristine coastline with complimentary beach chairs, umbrellas, and evening bonfire experiences by reservation.",
            imageAlt:
              "Beach bonfire setup at dusk with comfortable seating and ocean waves",
          },
          {
            title: "Events & Weddings",
            description:
              "8,500 square feet of event space including our oceanfront terrace, perfect for intimate gatherings up to 200 guests.",
            imageAlt:
              "Elegant event space with ocean views set for a wedding reception",
          },
        ]

    return (
      <section className={cn("py-24 lg:py-32", props.className)}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-16 max-w-2xl">
            <p className="mb-3 text-sm uppercase tracking-widest text-muted-foreground">
              {eyebrow}
            </p>
            <h2 className="mb-4 text-3xl font-light text-foreground lg:text-4xl">
              {heading}
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div key={item.title} className="group">
                <div className="mb-5 aspect-[4/3] overflow-hidden rounded-lg">
                  <Image
                    alt={item.imageAlt}
                    w={800}
                    h={600}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="mb-2 text-lg font-medium">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
