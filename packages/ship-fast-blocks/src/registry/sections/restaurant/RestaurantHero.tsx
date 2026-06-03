import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { CalendarCheck, ChevronDown, Utensils } from "lucide-react"
import { cn } from "#/lib/utils.ts"
import { Image } from "#/lib/img.tsx"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * RestaurantHero — full-bleed cinematic hero band for a warm, image-led food
 * brand (ramen shop, izakaya, bistro). A near-full-viewport section over a
 * full-bleed appetizing food photo with a warm angled dark gradient scrim: an
 * uppercased kicker with a leading rule, a huge serif headline with a trailing
 * word in the gold/primary accent, a supporting paragraph, dual CTAs (filled
 * primary "view menu" + outlined "book a table"), and an animated bottom scroll
 * cue. Both CTAs and the scroll cue route through useNavigate. Use as the
 * opening hero for cozy premium restaurants, noodle bars, sushi counters, or
 * cafes where mouth-watering imagery sells the experience. Renders fully with
 * no props via baked-in "Kaze Ramen" defaults.
 */
export const RestaurantHero = defineComponent({
  name: "RestaurantHero",
  description:
    "Full-bleed cinematic hero band for a warm, image-led food brand (ramen shop, izakaya, bistro): a near-full-viewport section over an appetizing food photo with a warm angled dark gradient scrim, an uppercased kicker with a leading rule, a huge serif headline with a trailing word in the gold/primary accent, a supporting paragraph, dual CTAs (filled primary 'view menu' + outlined 'book a table'), and an animated bottom scroll cue. CTAs and the scroll cue route through useNavigate. Use as the opening hero for cozy premium restaurants, noodle bars, sushi counters, or cafes where mouth-watering imagery sells the experience.",
  props: z.object({
    /** Small uppercased kicker above the headline. */
    eyebrow: z.string().optional(),
    /** Main serif headline (before the accent word). */
    heading: z.string().optional(),
    /** Trailing word in the heading rendered in the gold/primary accent. */
    highlight: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Short description of the hero food photo (drives the Image). */
    alt: z.string().optional(),
    /** Navigation target for the animated scroll cue (usually the story/about section). */
    scrollTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? "Portland's Pearl District"
    const heading = props.heading ?? "Noodles Crafted with"
    const highlight = props.highlight ?? "Soul"
    const subheading =
      props.subheading ??
      "Hand-pulled noodles, 18-hour tonkotsu broths, and seasonally inspired toppings. Experience ramen the way it's meant to be — rich, complex, and unforgettable."
    const primaryCta = props.primaryCta ?? "View Our Menu"
    const secondaryCta = props.secondaryCta ?? "Book a Table"
    const alt =
      props.alt ??
      "Steaming bowl of tonkotsu ramen with chashu pork, soft-boiled egg, and fresh scallions"
    const scrollTarget = props.scrollTarget ?? "Our Story"

    return (
      <section
        className={cn(
          "relative flex min-h-[88vh] items-center overflow-hidden",
          props.className,
        )}
      >
        <div className="absolute inset-0 -z-10">
          <Image
            alt={alt}
            w={1920}
            h={1200}
            loading="eager"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/60 to-foreground/25" />
        </div>

        <div className="mx-auto w-[min(1200px,92vw)] px-1 pt-[72px]">
          <div className="max-w-[620px] text-background">
            <p className="mb-5 inline-flex items-center gap-2.5 text-xs font-semibold tracking-[0.12em] text-primary uppercase before:h-px before:w-8 before:bg-primary">
              {eyebrow}
            </p>
            <h1 className="font-serif text-5xl font-bold leading-[1.1] tracking-tight text-balance md:text-7xl">
              {heading} <span className="text-primary">{highlight}</span>
            </h1>
            <p className="mt-5 max-w-[480px] text-lg leading-relaxed text-background/85">
              {subheading}
            </p>
            <div className="mt-9 flex flex-wrap gap-3.5">
              <button
                type="button"
                onClick={() => go(primaryCta)}
                className="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/35 transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-primary/45"
              >
                <Utensils className="size-4" /> {primaryCta}
              </button>
              <button
                type="button"
                onClick={() => go(secondaryCta)}
                className="inline-flex items-center justify-center gap-2.5 rounded-md border border-background/35 bg-transparent px-8 py-3.5 text-sm font-semibold text-background transition-all hover:border-background/55 hover:bg-background/10"
              >
                <CalendarCheck className="size-4" /> {secondaryCta}
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => go(scrollTarget)}
          aria-label="Scroll to story section"
          className="absolute bottom-8 left-1/2 flex -translate-x-1/2 animate-bounce flex-col items-center gap-2 text-xs font-medium tracking-wider text-background/50 uppercase"
        >
          <span>Scroll</span>
          <ChevronDown className="size-4" />
        </button>
      </section>
    )
  },
})
