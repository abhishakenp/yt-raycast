import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'

/**
 * DatingAppTestimonials — playful-geometric staggered "love stories" grid for
 * a dating / matchmaking app. An asymmetric header (left-aligned extrabold
 * heading + lede, mono "[ 03 ] couples" meta right) above a 1/2/3-column row
 * of sharp 2px-bordered profile cards that tilt alternately ±1deg and stagger
 * vertically on wide screens, each with a hard 3px offset token shadow, a
 * giant faint quotation mark behind the quote, the quote itself, then a
 * hairline-ruled author row with the rounded-full couple avatar (alt-driven
 * <Image>), the pair's bold names, and their "matched" date restyled as a
 * rotated rounded-full mono sticker chip. Use as social proof / success
 * stories for dating apps, singles platforms, or relationship products.
 * Renders fully with no props via baked-in couple-story defaults.
 */
export const DatingAppTestimonials = defineCapsule({
  name: 'DatingAppTestimonials',
  description:
    "Playful-geometric staggered 'love stories' grid for a dating / matchmaking app: an asymmetric header (left-aligned extrabold heading + lede, mono couple-count meta right) above a 1/2/3-column row of sharp 2px-bordered profile cards tilting alternately ±1deg with vertical stagger, each with a hard 3px offset shadow, a giant faint quotation mark behind the quote, and a hairline-ruled author row holding the rounded-full couple avatar (alt-driven <Image>), the pair's bold names, and a rotated rounded-full mono 'matched' sticker chip. Use as social proof / success stories for dating apps, singles platforms, or relationship products.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(
        z.object({
          names: z.string(),
          meta: z.string(),
          quote: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const testimonialsHeading =
      props.heading ?? 'Love stories that started here'
    const testimonialsDesc =
      props.description ?? 'Real couples who found each other on HeartLink.'
    const testimonialItems = props.items?.length
      ? props.items
      : [
          {
            names: 'Jessica & Marcus',
            meta: 'Matched March 2024',
            quote:
              "The compatibility quiz actually worked! We discovered we both love hiking and craft beer before we even met. First date was at a brewery—now we're planning our wedding there.",
            avatarAlt:
              'happy couple portrait of Jessica and Marcus smiling together',
          },
          {
            names: 'David & Priya',
            meta: 'Matched January 2024',
            quote:
              "I was skeptical about dating apps until HeartLink. The video date feature let us connect before meeting. Six months later, we're moving in together!",
            avatarAlt: 'happy couple portrait of David and Priya at a park',
          },
          {
            names: 'Michael & Elena',
            meta: 'Matched November 2023',
            quote:
              "We met at a HeartLink singles mixer in Austin. The app made me feel safe enough to try meeting in person, and I'm so glad I did. Best decision ever!",
            avatarAlt:
              'happy couple portrait of Michael and Elena embracing outdoors',
          },
        ]

    return (
      <section
        className={cn(
          'overflow-hidden bg-background py-16 lg:py-24',
          props.className,
        )}
      >
        <Container>
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-14">
            <SectionHeading
              align="left"
              title={testimonialsHeading}
              subtitle={testimonialsDesc}
              className="max-w-2xl gap-0"
              titleClassName="mb-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
              subtitleClassName="text-lg text-muted-foreground"
            />
            <MonoTag aria-hidden="true" tone="faint" className="shrink-0">
              [ {String(testimonialItems.length).padStart(2, '0')} ] couples
            </MonoTag>
          </div>
          <TestimonialGrid
            columns={3}
            className="[&>div]:gap-8 lg:[&>div]:pb-8"
          >
            {testimonialItems
              .map((t) => ({
                quote: t.quote,
                name: t.names,
                role: t.meta,
                avatarAlt: t.avatarAlt,
              }))
              .map((t, i) => {
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
                  <TestimonialCard
                    key={__iv__.name}
                    className={cn(
                      'relative gap-4 rounded-none border-2 border-foreground bg-card p-6 shadow-[3px_3px_0_0] shadow-foreground hover:border-foreground sm:p-7',
                      i % 2 === 1 ? 'rotate-1 lg:translate-y-8' : '-rotate-1',
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -top-2 right-4 select-none font-serif text-[6rem] leading-none text-primary/10"
                    >
                      &rdquo;
                    </span>
                    <TestimonialQuote className="relative text-base leading-relaxed">
                      {__iv__.quote}
                    </TestimonialQuote>
                    <TestimonialAuthor className="flex-wrap gap-y-3 border-t border-border pt-4">
                      {__iv__.avatarAlt ? (
                        <Image
                          alt={__iv__.avatarAlt}
                          w={100}
                          h={100}
                          className="size-11 shrink-0 rounded-full border-2 border-foreground object-cover"
                        />
                      ) : null}
                      <TestimonialName className="text-sm font-bold">
                        {__iv__.name}
                      </TestimonialName>
                      {(__iv__.role || __iv__.company || __iv__.meta) && (
                        <TestimonialMeta className="inline-flex shrink-0 rotate-2 items-center whitespace-nowrap rounded-full border border-border bg-muted/60 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground sm:ml-auto">
                          {__iv__.role || __iv__.company || __iv__.meta}
                        </TestimonialMeta>
                      )}
                    </TestimonialAuthor>
                  </TestimonialCard>
                )
              })}
          </TestimonialGrid>
        </Container>
      </section>
    )
  },
})
