import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'

/**
 * InteriorDesignLogos — understated "trusted by" brand logo strip for an upscale
 * interior-design / architecture studio site. A muted, border-top-and-bottom
 * band with a centered uppercase tracked caption above a responsive 2/4/6-column
 * grid of light-weight wordmark logos at reduced opacity (extra items hide below
 * large screens). Editorial and minimal — pure social proof, no links. Use
 * beneath the hero to signal partner brands, press, retailers or showroom
 * affiliations for design studios, architecture firms or furniture businesses.
 * Renders fully with no props via baked-in defaults.
 */
export const InteriorDesignLogos = defineComponent({
  name: 'InteriorDesignLogos',
  description:
    "Understated 'trusted by' brand logo strip for an upscale interior-design / architecture studio site: a muted, border-top-and-bottom band with a centered uppercase tracked caption above a responsive 2/4/6-column grid of light-weight wordmark logos at reduced opacity (extra items hide below large screens). Editorial and minimal — pure social proof. Use beneath the hero to signal partner brands, press, retailers or showroom affiliations for design studios, architecture firms or furniture businesses.",
  props: z.object({
    heading: z.string().optional(),
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Trusted by leading brands'
    const items = props.items?.length
      ? props.items
      : [
          'West Elm',
          'Restoration',
          'Crate&Barrel',
          'Design Within',
          'Herman Miller',
          'Knoll',
        ]

    return (
      <section
        className={cn('border-y border-border bg-muted py-16', props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-10 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {heading}
          </p>
          <div className="grid grid-cols-2 items-center gap-8 opacity-60 md:grid-cols-4 lg:grid-cols-6">
            {items.map((logo, i) => (
              <div
                key={logo}
                className={cn(
                  'flex h-12 items-center justify-center',
                  i >= 4 && 'hidden lg:flex',
                )}
              >
                <span className="text-xl font-light tracking-wide text-foreground">
                  {logo}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
