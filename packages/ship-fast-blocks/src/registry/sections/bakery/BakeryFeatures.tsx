import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'

/**
 * BakeryFeatures — "why our bread is different" value-proposition trio for an
 * artisan-bakery page, in a playful-geometric warm language. An asymmetric
 * 4:8 split: the left rail holds a mono "02 / Craft" index tag, an oversized
 * serif heading, the lead paragraph, and a row of three chunky geometric
 * ornaments (circle / square / arch) in warm muted washes; the right column
 * stacks three staggered feature cards that alternate blob corner radii and
 * horizontal offsets, each a chunky-bordered card with a soft offset shadow, a
 * giant serif italic ordinal numeral in the corner, a title, and a
 * description. A giant ghost flour-star watermark bleeds off the right edge.
 * Tokens-only, no links. Use to explain a bakery's craft, sourcing, and
 * process — local grains, slow fermentation, no shortcuts — or any "what makes
 * us different" trio for food makers. Renders fully with no props via three
 * baked-in default features.
 */
export const BakeryFeatures = defineCapsule({
  name: 'BakeryFeatures',
  description:
    "'Why our bread is different' value-proposition trio for an artisan-bakery page in a playful-geometric warm language: an asymmetric 4:8 split with a left rail holding a mono index tag, an oversized serif heading, the lead paragraph and a row of three chunky geometric ornaments (circle / square / arch) in warm muted washes, beside a right column of three staggered feature cards alternating blob corner radii and horizontal offsets — each a chunky-bordered card with soft offset shadow, giant serif italic ordinal numeral, title and description — under a giant ghost flour-star watermark. Tokens-only, no links. Use to explain a bakery's craft, sourcing and process (local grains, slow fermentation, no shortcuts) or any 'what makes us different' / how-we-work trio for food makers.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Feature cards: title + description. */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Why our bread is different'
    const description =
      props.description ??
      'We believe great bread takes time. Our 36-hour fermentation process develops complex flavors that mass-produced bread simply cannot match.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Local Grains',
            description:
              'We partner with Camas Country Mill in Eugene for organic wheat, rye, and spelt. Our flour travels less than 100 miles from field to bakery.',
          },
          {
            title: 'Slow Fermentation',
            description:
              'Our sourdough levain matures for 12 hours before mixing. Each loaf undergoes a full 36-hour cold ferment for optimal flavor and digestibility.',
          },
          {
            title: 'No Shortcuts',
            description:
              'No commercial yeast, no dough conditioners, no preservatives. Just flour, water, salt, and time. The way bread has been made for millennia.',
          },
        ]

    const cardShapes = [
      'rounded-[2rem] rounded-bl-none',
      'rounded-[2rem] rounded-tr-none sm:translate-x-8',
      'rounded-[2rem] rounded-br-none sm:-translate-x-4',
    ]

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background py-16 lg:py-24',
          props.className,
        )}
      >
        <Watermark
          aria-hidden="true"
          className="-right-14 top-6 font-serif text-[11rem] italic sm:text-[16rem] lg:text-[20rem]"
        >
          ❋
        </Watermark>
        <Container className="relative">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-4">
              <MonoTag>02 / Craft</MonoTag>
              <h2 className="mt-4 font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {heading}
              </h2>
              <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground lg:text-lg">
                {description}
              </p>
              {/* Chunky geometric ornaments: circle / square / arch. */}
              <div
                aria-hidden="true"
                className="pointer-events-none mt-8 flex items-end gap-3"
              >
                <span className="size-10 rounded-full bg-primary/20" />
                <span className="size-10 rotate-6 rounded-md bg-muted" />
                <span className="h-12 w-10 rounded-t-full bg-primary/10" />
              </div>
            </div>

            <div className="space-y-6 lg:col-span-8 lg:space-y-8">
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
                return (
                  <div
                    key={__iv__.title}
                    className={cn(
                      'relative grid grid-cols-[auto_1fr] items-start gap-4 border-2 border-foreground/15 bg-card p-5 shadow-[6px_6px_0_0] shadow-foreground/10 transition-transform duration-150 hover:-translate-y-0.5 sm:gap-6 sm:p-8',
                      cardShapes[i % cardShapes.length],
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="select-none font-serif text-5xl italic leading-none text-foreground/15 sm:text-7xl"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      {__iv__.icon ? (
                        <div className="mb-3 grid size-11 place-items-center rounded-full border-2 border-foreground/15 bg-primary/10 text-primary">
                          {__iv__.icon}
                        </div>
                      ) : null}
                      <h3 className="font-serif text-xl font-medium text-card-foreground sm:text-2xl">
                        {__iv__.title}
                      </h3>
                      <p className="mt-2 leading-relaxed text-muted-foreground">
                        {__iv__.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
