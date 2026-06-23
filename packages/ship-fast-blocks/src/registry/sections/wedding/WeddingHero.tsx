import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

export const WeddingHero = defineComponent({
  name: "WeddingHero",
  description:
    "Romantic full-bleed wedding hero: an alt-driven golden-hour ceremony photograph behind a soft dark overlay, with an uppercase save-the-date eyebrow pill, a large serif couple-names headline, the wedding date and venue, and dual call-to-action buttons (RSVP plus Our Story). Use as the opening viewport of a wedding invitation or celebration site to set an elegant, heartfelt tone.",
  props: z.object({
    eyebrow: z.string().optional(),
    coupleNames: z.string().optional(),
    date: z.string().optional(),
    venue: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    primaryTarget: z.string().optional(),
    secondaryCta: z.string().optional(),
    secondaryTarget: z.string().optional(),
    imageAlt: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? "We're getting married"
    const coupleNames = props.coupleNames ?? "Ava & Liam"
    const date = props.date ?? "September 14, 2025"
    const venue = props.venue ?? "Willowbrook Gardens · Napa Valley"
    const subheading =
      props.subheading ??
      "Two hearts, one beautiful beginning. Join us for an evening of vows, candlelight, and dancing under the stars."
    const primaryCta = props.primaryCta ?? "RSVP"
    const primaryTarget = props.primaryTarget ?? "RSVP"
    const secondaryCta = props.secondaryCta ?? "Our Story"
    const secondaryTarget = props.secondaryTarget ?? "Story"
    const imageAlt =
      props.imageAlt ??
      "romantic outdoor wedding ceremony at golden hour with floral arch and soft bokeh"

    return (
      <section className={cn("relative isolate overflow-hidden", props.className)}>
        <Image
          alt={imageAlt}
          w={1920}
          h={1080}
          loading="lazy"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-foreground/60" aria-hidden="true" />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-b from-foreground/40 via-transparent to-foreground/70"
          aria-hidden="true"
        />

        <div className="mx-auto flex min-h-[88vh] max-w-4xl flex-col items-center justify-center px-6 py-28 text-center lg:px-8">
          <span className="mb-6 inline-flex items-center rounded-full border border-background/30 bg-background/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-background backdrop-blur-sm">
            {eyebrow}
          </span>

          <h1 className="font-serif text-5xl font-medium leading-tight text-background sm:text-6xl lg:text-7xl">
            {coupleNames}
          </h1>

          <p className="mt-6 text-lg font-medium uppercase tracking-[0.18em] text-background/80">
            {date}
          </p>
          <p className="mt-2 text-base text-background/80">{venue}</p>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-background/80">{subheading}</p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => go(primaryTarget)}
              className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              {primaryCta}
            </button>
            <button
              type="button"
              onClick={() => go(secondaryTarget)}
              className="rounded-full border border-border bg-card/10 px-8 py-3 text-sm font-semibold text-background backdrop-blur-sm transition hover:bg-card/20"
            >
              {secondaryCta}
            </button>
          </div>
        </div>
      </section>
    )
  },
})
