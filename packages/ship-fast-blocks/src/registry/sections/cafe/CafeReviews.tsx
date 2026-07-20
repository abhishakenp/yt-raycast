import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * CafeReviews — newsprint press-clipping review wall for a cozy cafe / coffee
 * shop page. A mono dateline rail (cap stamp, hairline rule, clipping count)
 * above the serif headline, over a giant serif ghost quotation-mark watermark.
 * The reviews run as a 3-up grid of staggered hairline clipping cards (middle
 * card nudged down on desktop, each slightly rotated in alternation): every
 * card opens with a rotated mono five-star stamp chip, a serif italic quote,
 * and a hairline-ruled attribution row with the name and a mono role line.
 * Below, a mono underlined "more reviews" link with an arrow routes via
 * section-kit route links. Use for social proof on cafes, bakeries, tea
 * houses, or any local service business. Renders fully with no props via
 * baked-in defaults.
 */
export const CafeReviews = defineCapsule({
  name: 'CafeReviews',
  description:
    "Newsprint press-clipping review wall for a cozy cafe page: a mono dateline rail (cap stamp, hairline rule, clipping count) above a serif headline over a giant serif ghost quotation-mark watermark; reviews run as a 3-up grid of staggered, slightly rotated hairline clipping cards — each opening with a rotated mono five-star stamp chip, a serif italic quote, and a hairline-ruled attribution row with name and mono role. A mono underlined 'more reviews' arrow link routes via section-kit route links. Use for social proof on cafes, bakeries, tea houses, or local service businesses.",
  props: z.object({
    /** Eyebrow / cap text. */
    cap: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** "More reviews" link label. */
    moreLink: z.string().optional(),
    /** Navigation target for the more-link button. */
    moreTarget: z.string().optional(),
    /** Review cards: quote, name, role, avatarAlt. */
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          role: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const cap = props.cap ?? 'What People Say'
    const heading = props.heading ?? 'Loved by the neighborhood'
    const moreLink = props.moreLink ?? 'Read 247 more reviews on Google'
    const moreTarget = props.moreTarget ?? 'Reviews'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'This is my third place. The baristas know my name, my order, and genuinely ask about my day. The Ethiopian pour over is consistently the best in the city.',
            name: 'David Park',
            role: 'Software Engineer, Pearl District',
            avatarAlt:
              'Professional headshot of David Park, a smiling man with short black hair in a casual button-up shirt',
          },
          {
            quote:
              'As a pastry chef myself, I can tell you their croissants are the real deal. Proper lamination, French butter, perfect honeycomb structure. Worth every penny.',
            name: 'Maria Gonzalez',
            role: 'Pastry Chef, Le Cordon Bleu Graduate',
            avatarAlt:
              'Professional headshot of Maria Gonzalez, a smiling woman with curly brown hair and warm brown eyes',
          },
          {
            quote:
              "I bring all my out-of-town clients here. The space is beautiful without trying too hard, the coffee is impeccable, and it's quiet enough for actual conversation.",
            name: 'Jennifer Walsh',
            role: 'Real Estate Broker, Compass',
            avatarAlt:
              'Professional headshot of Jennifer Walsh, a smiling woman in her 40s wearing a navy blazer',
          },
        ]

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background pt-24 pb-16 lg:pt-32 lg:pb-24',
          props.className,
        )}
      >
        <Watermark className="-top-16 left-[-2%] font-serif text-[14rem] text-foreground/[0.05] sm:text-[20rem] lg:text-[26rem]">
          &ldquo;
        </Watermark>

        <Container size="xl" className="relative px-6">
          <div className="flex items-center gap-4">
            <MonoTag>{cap}</MonoTag>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
            <MonoTag tone="faint" className="hidden sm:inline">
              Clippings 01–{String(items.length).padStart(2, '0')}
            </MonoTag>
          </div>

          <h2 className="mt-6 max-w-2xl font-serif text-4xl font-medium leading-[1.05] tracking-tight text-foreground sm:text-5xl">
            {heading}
          </h2>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-8">
            {items.map((t, i) => {
              const __iv__ = t as {
                quote: string
                name: string
                role?: string
                company?: string
                meta?: string
                rating?: number
                avatarAlt?: string
              }
              return (
                <figure
                  key={__iv__.name}
                  className={cn(
                    'flex flex-col border border-foreground/20 bg-card p-6 sm:p-7',
                    i % 2 === 1 ? 'rotate-[0.4deg]' : '-rotate-[0.4deg]',
                    i === 1 && 'lg:translate-y-8',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="inline-flex w-fit -rotate-2 items-center border border-dashed border-primary/50 px-2.5 py-1 font-mono text-[10px] tracking-[0.25em] text-primary"
                  >
                    ★★★★★
                  </span>
                  <blockquote className="mt-5 flex-1 font-serif text-lg italic leading-relaxed text-foreground">
                    &ldquo;{__iv__.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-6 border-t border-border pt-4">
                    <p className="font-medium text-foreground">{__iv__.name}</p>
                    {(__iv__.role || __iv__.company || __iv__.meta) && (
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        {__iv__.role || __iv__.company || __iv__.meta}
                      </p>
                    )}
                  </figcaption>
                </figure>
              )
            })}
          </div>

          <div className="mt-14 flex justify-center lg:mt-20">
            <NavbarRouteLink
              className="inline-flex items-center gap-2 border-b border-foreground/30 pb-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              href={moreTarget}
            >
              {moreLink}
              <svg
                className="size-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </NavbarRouteLink>
          </div>
        </Container>
      </section>
    )
  },
})
