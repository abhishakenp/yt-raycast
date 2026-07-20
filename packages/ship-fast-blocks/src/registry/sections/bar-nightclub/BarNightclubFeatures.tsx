import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'

/**
 * BarNightclubFeatures — collapsed-border poster pillars strip for a
 * cocktail-bar / nightclub page. A single 2px-bordered grid (2-up on mobile,
 * 3-up on desktop) of venue pillars; each cell stacks a hollow oversized index
 * numeral (01/02/03 via text stroke), a condensed uppercase title, a muted
 * description, and a small primary tick — with the middle cell flipped to a
 * full foreground-on-background inversion for poster drama. Dark-kinetic,
 * sharp-cornered, mono-labeled. Use directly under the hero to summarize the
 * venue's three pillars (e.g. craft cocktails, live DJ sets, late night) on
 * bar, nightclub, lounge, or speakeasy pages. Renders fully with no props via
 * baked-in defaults.
 */
export const BarNightclubFeatures = defineCapsule({
  name: 'BarNightclubFeatures',
  description:
    "Collapsed-border poster pillars strip for a cocktail-bar / nightclub page: a single 2px-bordered grid (2-up mobile, 3-up desktop) of venue pillars, each cell stacking a hollow oversized index numeral, a condensed uppercase title, a muted description and a small primary tick, with the middle cell flipped to a full foreground-on-background inversion for poster drama. Dark-kinetic, sharp-cornered and mono-labeled; used to summarize the venue's three pillars such as craft cocktails, live DJ sets, and late night. Use directly under the hero on bar, nightclub, lounge, or speakeasy pages.",
  props: z.object({
    /** Three feature cards (title + description). */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Craft Cocktails',
            description:
              'Award-winning mixologists creating signature drinks with house-made syrups, rare spirits, and precision technique.',
          },
          {
            title: 'Live DJ Sets',
            description:
              'Resident and guest DJs spinning deep house, techno, and disco every Thursday through Saturday until 4 AM.',
          },
          {
            title: 'Late Night',
            description:
              'Open until 4 AM on weekends. Private booths, VIP sections, and bottle service available all night.',
          },
        ]

    return (
      <section className={cn('py-14 sm:py-20 lg:py-24', props.className)}>
        <Container>
          <div className="grid grid-cols-2 border-2 border-foreground lg:grid-cols-3">
            {items.map((f, i) => {
              const __iv__ = f as {
                title: string
                description: string
                icon?: React.ReactNode
                points?: string[]
                cta?: string
                price?: string
                imageAlt?: string
              }
              const inverted = i % 3 === 1
              return (
                <div
                  key={__iv__.title}
                  className={cn(
                    'relative flex flex-col gap-3 p-5 sm:p-8',
                    inverted
                      ? 'bg-foreground text-background'
                      : 'bg-background text-foreground',
                    i % 2 === 1 && 'border-l-2 border-foreground lg:border-l-0',
                    i >= 2 && 'border-t-2 border-foreground lg:border-t-0',
                    i === items.length - 1 &&
                      items.length % 2 === 1 &&
                      'col-span-2 lg:col-span-1',
                    i % 3 !== 0 && 'lg:border-l-2 lg:border-foreground',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'select-none text-5xl font-black leading-none tracking-tighter [-webkit-text-fill-color:transparent] [-webkit-text-stroke-width:1.5px] sm:text-7xl',
                      inverted ? 'text-background/60' : 'text-foreground/30',
                    )}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {__iv__.icon && (
                    <span aria-hidden="true" className="text-2xl">
                      {__iv__.icon}
                    </span>
                  )}
                  <h3 className="text-lg font-black uppercase leading-tight tracking-tight sm:text-xl">
                    {__iv__.title}
                  </h3>
                  <p
                    className={cn(
                      'text-sm leading-relaxed',
                      inverted ? 'text-background/70' : 'text-muted-foreground',
                    )}
                  >
                    {__iv__.description}
                  </p>
                  <span
                    aria-hidden="true"
                    className="mt-auto flex items-center gap-1 pt-2"
                  >
                    <span className="h-1.5 w-6 bg-primary" />
                    <span
                      className={cn(
                        'h-1.5 w-1.5',
                        inverted ? 'bg-background/40' : 'bg-foreground/20',
                      )}
                    />
                  </span>
                  <MonoTag
                    aria-hidden="true"
                    tone={inverted ? 'inverted' : 'faint'}
                    className="absolute right-4 top-5 text-[9px] sm:top-8"
                  >
                    / 0{items.length}
                  </MonoTag>
                </div>
              )
            })}
          </div>
        </Container>
      </section>
    )
  },
})
