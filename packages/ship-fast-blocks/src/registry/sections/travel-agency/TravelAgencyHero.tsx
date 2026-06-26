import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

export const TravelAgencyHero = defineComponent({
  name: 'TravelAgencyHero',
  description:
    "Bespoke, full-bleed wanderlust hero for the Travel Agency page family. Renders a breathtaking destination image behind a token-based dark overlay, with an eyebrow, an oversized aspirational heading, supporting copy, and an inline destination search affordance (Where to? / Dates / Travelers cells plus a 'Find your trip' button wired through useNavigate). Use as the opening viewport of a premium travel agency page. All content is prop-driven with baked defaults so it renders with no props.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
    imageAlt: z.string().optional(),
    destinationPlaceholder: z.string().optional(),
    datesPlaceholder: z.string().optional(),
    travelersPlaceholder: z.string().optional(),
    searchLabel: z.string().optional(),
    searchTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Where will you go next'
    const heading = props.heading ?? 'Journeys worth a lifetime of stories'
    const subheading =
      props.subheading ??
      "Hand-crafted itineraries to the world's most breathtaking destinations, designed around the way you love to travel."
    const imageAlt =
      props.imageAlt ?? 'Breathtaking premium travel destination at golden hour'
    const destinationPlaceholder = props.destinationPlaceholder ?? 'Where to?'
    const datesPlaceholder = props.datesPlaceholder ?? 'Dates'
    const travelersPlaceholder = props.travelersPlaceholder ?? 'Travelers'
    const searchLabel = props.searchLabel ?? 'Find your trip'
    const searchTarget = props.searchTarget ?? 'Plan a Trip'

    return (
      <section
        className={cn(
          'relative isolate overflow-hidden bg-background text-foreground',
          props.className,
        )}
      >
        <div className="absolute inset-0 -z-10">
          <Image
            alt={imageAlt}
            w={1920}
            h={1280}
            className="h-full w-full object-cover"
          />
          <div
            className="absolute inset-0 bg-foreground/60"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/40 to-transparent"
            aria-hidden="true"
          />
        </div>

        <div className="mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-center px-6 py-28 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full border border-background/30 bg-background/10 px-4 py-2 text-sm font-medium uppercase tracking-wider text-background backdrop-blur-sm">
              {eyebrow}
            </span>
            <h1 className="mt-6 text-5xl font-bold leading-tight text-background sm:text-6xl lg:text-7xl">
              {heading}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-background/85">
              {subheading}
            </p>
          </div>

          <div className="mt-12 w-full max-w-4xl rounded-3xl border border-border bg-card/95 p-3 shadow-[0_24px_80px_rgba(0,0,0,0.25)] backdrop-blur-md">
            <div className="grid gap-2 sm:grid-cols-[1.3fr_1fr_1fr_auto]">
              <label className="flex flex-col gap-1 rounded-2xl bg-muted px-4 py-3 text-left">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Destination
                </span>
                <input
                  type="text"
                  placeholder={destinationPlaceholder}
                  className="bg-transparent text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1 rounded-2xl bg-muted px-4 py-3 text-left">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  When
                </span>
                <input
                  type="text"
                  placeholder={datesPlaceholder}
                  className="bg-transparent text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1 rounded-2xl bg-muted px-4 py-3 text-left">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Who
                </span>
                <input
                  type="text"
                  placeholder={travelersPlaceholder}
                  className="bg-transparent text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </label>
              <button
                type="button"
                onClick={() => go(searchTarget)}
                className="inline-flex items-center justify-center rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                {searchLabel}
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  },
})
