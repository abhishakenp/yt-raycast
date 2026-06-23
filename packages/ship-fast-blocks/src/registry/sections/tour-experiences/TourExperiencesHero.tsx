import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * TourExperiencesHero — vivid, full-bleed adventure hero for a guided-tour /
 * expedition brand. A cinematic landscape photo fills the band behind a
 * token-driven dark gradient overlay, with an eyebrow pill, a large headline,
 * supporting copy, and dual CTAs ("Explore Tours" primary + "How it works"
 * outline) that route through useNavigate. A trust strip of rating and tour
 * stats anchors the bottom. Use as the opening hero for tour operators,
 * adventure outfitters, travel-experience marketplaces, and destination guides.
 * Renders fully with no props via baked-in "Wanderwild Tours" defaults.
 */
export const TourExperiencesHero = defineComponent({
  name: "TourExperiencesHero",
  description:
    "Vivid full-bleed adventure hero for a guided-tour / expedition brand: a cinematic landscape photo behind a token-driven dark gradient overlay, with an eyebrow pill, a large headline, supporting copy, and dual CTAs ('Explore Tours' primary + 'How it works' outline) that route through useNavigate, plus a bottom trust strip of rating and tour stats. Use as the opening hero for tour operators, adventure outfitters, travel-experience marketplaces, and destination guides.",
  props: z.object({
    /** Eyebrow / kicker pill text above the headline. */
    eyebrow: z.string().optional(),
    /** Large hero headline. */
    heading: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Primary (filled) CTA label. */
    primaryCta: z.string().optional(),
    /** Navigation target for the primary CTA. */
    primaryTarget: z.string().optional(),
    /** Secondary (outline) CTA label. */
    secondaryCta: z.string().optional(),
    /** Navigation target for the secondary CTA. */
    secondaryTarget: z.string().optional(),
    /** Alt text driving the full-bleed adventure landscape photo. */
    imageAlt: z.string().optional(),
    /** Trust / stat strip beneath the hero copy. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? "Small-group adventures since 2012"
    const heading = props.heading ?? "Go beyond the guidebook"
    const subheading =
      props.subheading ??
      "Hand-crafted tours led by local guides who know the hidden trails, the best street food, and the viewpoints that never make the postcards. Big adventures, small footprints."
    const primaryCta = props.primaryCta ?? "Explore Tours"
    const primaryTarget = props.primaryTarget ?? "Tours"
    const secondaryCta = props.secondaryCta ?? "How it works"
    const secondaryTarget = props.secondaryTarget ?? "How it works"
    const imageAlt =
      props.imageAlt ??
      "Epic mountain valley at golden hour with a group of travelers hiking a ridgeline trail toward a dramatic sunlit peak"
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: "4.9/5", label: "From 12,000+ travelers" },
          { value: "180+", label: "Destinations worldwide" },
          { value: "60", label: "Expert local guides" },
        ]

    return (
      <section
        className={cn(
          "relative isolate overflow-hidden bg-foreground text-background",
          props.className,
        )}
      >
        <Image
          alt={imageAlt}
          w={1920}
          h={1080}
          className="absolute inset-0 -z-10 size-full object-cover"
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-t from-foreground via-foreground/70 to-foreground/30"
          aria-hidden="true"
        />

        <div className="mx-auto flex min-h-[36rem] max-w-7xl flex-col justify-center px-6 py-32 lg:px-8 lg:py-40">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-background/30 bg-background/10 px-4 py-2 text-sm font-medium text-background backdrop-blur-sm">
              <span className="size-2 rounded-full bg-primary" />
              {eyebrow}
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-background sm:text-5xl lg:text-6xl">
              {heading}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-background/80">
              {subheading}
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => go(primaryTarget)}
                className="inline-flex items-center justify-center rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {primaryCta}
              </button>
              <button
                type="button"
                onClick={() => go(secondaryTarget)}
                className="inline-flex items-center justify-center rounded-full border border-background/40 bg-background/10 px-7 py-3.5 text-sm font-semibold text-background backdrop-blur-sm transition-colors hover:bg-background/20"
              >
                {secondaryCta}
              </button>
            </div>
          </div>

          <div className="mt-14 grid max-w-2xl grid-cols-3 gap-6 border-t border-background/20 pt-8">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-bold text-background sm:text-3xl">
                  {s.value}
                </div>
                <div className="mt-1 text-sm text-background/70">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
