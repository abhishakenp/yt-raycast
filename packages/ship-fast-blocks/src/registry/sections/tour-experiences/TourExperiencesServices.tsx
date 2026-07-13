import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { FeatureGrid } from '#/section-kit/FeatureGrid.tsx'

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
 * TourExperiencesServices — tour-category showcase for an adventure / guided-tour
 * brand. Composes the shared FeatureGrid composite as a 4-up grid of tour types
 * (City Tours, Food Tours, Adventure Tours, Cultural Tours), each with an inline
 * line icon, a title, and a vivid one-line description. Use to help visitors
 * self-select the kind of experience they want on tour-operator, expedition, and
 * travel-experience landing pages. Renders fully with no props via baked-in
 * defaults.
 */
export const TourExperiencesServices = defineCapsule({
  name: 'TourExperiencesServices',
  description:
    'Tour-category showcase for an adventure / guided-tour brand. Composes the shared FeatureGrid composite as a 4-up grid of tour types (City Tours, Food Tours, Adventure Tours, Cultural Tours), each with an inline line icon, a title, and a vivid one-line description. Use to help visitors self-select the kind of experience they want on tour-operator, expedition, and travel-experience landing pages.',
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
        <div className="mx-auto max-w-7xl">
          <FeatureGrid
            heading={props.heading ?? 'Find your kind of adventure'}
            subheading={
              props.subheading ??
              'Every traveler chases something different. Pick the experience that matches your pace, your appetite, and your sense of wonder.'
            }
            features={features}
            columns={4}
            className={props.className}
          />
        </div>
      </section>
    )
  },
})
