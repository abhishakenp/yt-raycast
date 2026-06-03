import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * HotelResortCta — full-bleed image call-to-action band for a luxury hotel /
 * resort & spa site. A centered section over a full-cover background photo with
 * a darkening token overlay: an uppercase eyebrow, a thin oversized headline, a
 * light supporting paragraph, and dual CTAs (solid light primary + glassy
 * outlined secondary, e.g. book + call). Cinematic and conversion-focused; CTAs
 * route through useNavigate. Use as a closing booking push for hotels, resorts,
 * spa retreats, villas, or inns. Background uses the alt-driven Image component.
 * Renders fully with no props via baked-in resort defaults.
 */
export const HotelResortCta = defineComponent({
  name: "HotelResortCta",
  description:
    "Full-bleed image call-to-action band for a luxury hotel / resort & spa site: a centered section over a full-cover background photo with a darkening token overlay, an uppercase eyebrow, a thin oversized headline, a light supporting paragraph, and dual CTAs (solid light primary + glassy outlined secondary, e.g. book + call). Cinematic and conversion-focused; CTAs route through useNavigate and the background uses the alt-driven Image component. Use as a closing booking push for hotels, resorts, spa retreats, villas, or boutique inns.",
  props: z.object({
    /** Uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Headline. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Solid light primary CTA label. */
    primaryCta: z.string().optional(),
    /** Glassy outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Alt text driving the full-bleed background image. */
    imageAlt: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? "Limited Availability"
    const heading = props.heading ?? "Begin your Azure Coast experience"
    const description =
      props.description ??
      "Book direct for exclusive perks: complimentary room upgrade, late checkout, and a $100 resort credit. Summer availability is filling quickly."
    const primaryCta = props.primaryCta ?? "Check Availability"
    const secondaryCta = props.secondaryCta ?? "Call 1-800-555-1234"
    const imageAlt =
      props.imageAlt ??
      "Sunset view over ocean from luxury resort balcony with warm golden lighting"

    return (
      <section
        className={cn(
          "relative overflow-hidden py-24 lg:py-32",
          props.className,
        )}
      >
        <div className="absolute inset-0">
          <Image
            alt={imageAlt}
            w={1920}
            h={1080}
            loading="lazy"
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-foreground/50" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center lg:px-8">
          <p className="mb-4 text-sm uppercase tracking-widest text-background/80">
            {eyebrow}
          </p>
          <h2 className="mb-6 text-3xl font-light text-background md:text-4xl lg:text-5xl">
            {heading}
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg font-light text-background/80">
            {description}
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => go(primaryCta)}
              className="rounded-md bg-background px-10 py-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {primaryCta}
            </button>
            <button
              type="button"
              onClick={() => go(secondaryCta)}
              className="rounded-md border border-background/30 bg-background/10 px-10 py-4 text-sm font-medium text-background backdrop-blur-sm transition-colors hover:bg-background/20"
            >
              {secondaryCta}
            </button>
          </div>
        </div>
      </section>
    )
  },
})
