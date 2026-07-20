import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'

/** Inline icon set — currentColor → theme token, adventurous line art. */
function CityIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 21h18M5 21V7l5-3v17M14 21V11l5-2v12M9 9h.01M9 13h.01M9 17h.01" />
    </svg>
  )
}
function FoodIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M7 2v7a3 3 0 0 0 6 0V2M10 9v13M18 2c-1.5 0-3 2-3 5s1 4 3 4v11" />
    </svg>
  )
}
function AdventureIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m3 20 6-12 4 7 2-3 6 8H3ZM9 8 6.5 13" />
    </svg>
  )
}
function CultureIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 21h18M5 21V10l7-4 7 4v11M9 21v-6h6v6M4 10h16" />
    </svg>
  )
}

/**
 * TourExperiencesServices — tour-category itinerary ledger for an adventure /
 * guided-tour brand. A mono metadata header above a collapsed-border,
 * sharp-cornered ledger of tour types (City Tours, Food Tours, Adventure Tours,
 * Cultural Tours) — each row carries a mono index label, an inline line icon, a
 * title, and a vivid one-line description, sharing hairline rules like an
 * itinerary. Use to help visitors self-select the kind of experience they want
 * on tour-operator, expedition, and travel-experience landing pages. Renders
 * fully with no props via baked-in defaults.
 */
export const TourExperiencesServices = defineCapsule({
  name: 'TourExperiencesServices',
  description:
    'Tour-category itinerary ledger for an adventure / guided-tour brand: a mono metadata header above a collapsed-border sharp-cornered ledger of tour types (City Tours, Food Tours, Adventure Tours, Cultural Tours), each row carrying a mono index label, an inline line icon, a title, and a vivid one-line description while sharing hairline rules like an itinerary. Use to help visitors self-select the kind of experience they want on tour-operator, expedition, and travel-experience landing pages.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting subheading under the heading. */
    subheading: z.string().optional(),
    /** Tour categories (title + description per card). */
    features: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const defaults = [
      {
        title: 'City Tours',
        description:
          'Weave through hidden lanes, rooftop bars, and landmark icons with a guide who lives there.',
        icon: <CityIcon className="size-6" />,
      },
      {
        title: 'Food Tours',
        description:
          'Graze your way through markets and family kitchens, tasting the dishes locals actually eat.',
        icon: <FoodIcon className="size-6" />,
      },
      {
        title: 'Adventure Tours',
        description:
          'Summit ridgelines, paddle hidden coves, and chase waterfalls on guided outdoor escapes.',
        icon: <AdventureIcon className="size-6" />,
      },
      {
        title: 'Cultural Tours',
        description:
          "Step inside temples, workshops, and living traditions for stories you won't find online.",
        icon: <CultureIcon className="size-6" />,
      },
    ]
    const icons = [
      <CityIcon className="size-6" />,
      <FoodIcon className="size-6" />,
      <AdventureIcon className="size-6" />,
      <CultureIcon className="size-6" />,
    ]
    const features = props.features?.length
      ? props.features.map((f, i) => ({ ...f, icon: icons[i % icons.length] }))
      : defaults

    return (
      <section className="bg-background px-6 pt-28 pb-20 lg:px-8 lg:pt-32 lg:pb-24">
        <Container size="xl" className={props.className}>
          {/* Mono metadata header. */}
          <div className="flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 flex items-center gap-2 tracking-[0.18em]">
                <span aria-hidden="true" className="size-1.5 bg-primary" />
                Itinerary
              </MonoTag>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {props.heading ?? 'Find your kind of adventure'}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {props.subheading ??
                  'Every traveler chases something different. Pick the experience that matches your pace, your appetite, and your sense of wonder.'}
              </p>
            </div>
            <MonoTag
              tone="faint"
              aria-hidden="true"
              className="shrink-0 tracking-[0.18em]"
            >
              {String(features.length).padStart(2, '0')} experiences
            </MonoTag>
          </div>

          {/* Collapsed-border experience ledger. */}
          <div className="border-t border-border">
            {features.map((f, i) => {
              const __iv__ = f as {
                title: string
                description: string
                icon?: React.ReactNode
                points?: string[]
                cta?: string
                price?: string
                imageAlt?: string
              }
              return (
                <div
                  key={__iv__.title}
                  className="group grid grid-cols-[auto_1fr] items-start gap-x-5 gap-y-2 border-b border-border py-7 sm:grid-cols-[4rem_auto_1fr] sm:items-center sm:gap-x-7"
                >
                  <span
                    aria-hidden="true"
                    className="font-mono text-sm font-semibold tabular-nums text-muted-foreground/70 sm:text-base"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="row-span-2 grid size-11 place-items-center border border-border text-foreground transition-colors duration-150 group-hover:border-primary group-hover:text-primary sm:row-span-1">
                    {__iv__.icon}
                  </span>
                  <div className="col-start-2 sm:col-start-3">
                    <h3 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                      {__iv__.title}
                    </h3>
                    <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                      {__iv__.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </Container>
      </section>
    )
  },
})
