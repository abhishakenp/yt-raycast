import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'

/**
 * InteriorDesignTestimonials — editorial-spatial client voices for an upscale
 * interior-design / architecture studio. An asymmetric header (mono "06 / VOICES"
 * rail + light-weight heading) above a staggered three-column grid of hairline-
 * framed quote plates — each with a giant serif quotation mark, an italic serif
 * relaxed-leading quote and a mono source row pairing a primary swatch with a
 * name + role/project line. Editorial, warm, trust-building, binary radius. Use
 * as social proof for interior designers, design studios or architecture firms.
 * Renders fully with no props via baked-in defaults.
 */
export const InteriorDesignTestimonials = defineCapsule({
  name: 'InteriorDesignTestimonials',
  description:
    'Editorial-spatial client voices for an upscale interior-design / architecture studio: an asymmetric header (mono "06 / VOICES" rail + light-weight heading) above a staggered three-column grid of hairline-framed quote plates — each with a giant serif quotation mark, an italic serif relaxed quote and a mono source row pairing a primary swatch with a name + role/project line. Editorial, warm, trust-building, binary radius. Use as social proof for interior designers, design studios or architecture firms.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
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
    const eyebrow = props.eyebrow ?? 'Testimonials'
    const heading = props.heading ?? 'What our clients say'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'Atelier transformed our Victorian into a space that honors its history while feeling completely contemporary. Their attention to detail and understanding of how we live made all the difference.',
            name: 'Sarah Chen',
            role: 'Pacific Heights Residence',
            avatarAlt:
              'Professional headshot of a smiling woman with shoulder-length dark hair wearing a navy blazer',
          },
          {
            quote:
              'The team at Atelier understood our brand immediately. Our new office space has transformed how we work and how clients perceive us. Truly exceptional work.',
            name: 'Michael Torres',
            role: 'CEO, Meridian Ventures',
            avatarAlt:
              'Professional headshot of a smiling man in his 40s with short gray hair wearing a crisp white dress shirt',
          },
          {
            quote:
              'Working with Atelier on our inn was a dream. They captured the essence of wine country elegance while creating spaces that feel intimate and welcoming.',
            name: 'Emma Richardson',
            role: 'Owner, Calistoga Inn',
            avatarAlt:
              'Professional headshot of a smiling woman with blonde hair wearing a sage green blouse and simple gold jewelry',
          },
        ]

    return (
      <section
        className={cn(
          'px-4 pt-24 pb-16 sm:px-6 md:pt-28 md:pb-24 lg:px-8',
          props.className,
        )}
      >
        <Container size="xl">
          <div className="mb-12 flex flex-col gap-4 border-b border-border pb-6 md:mb-16">
            <MonoTag className="flex items-center gap-3 tracking-[0.2em]">
              <span aria-hidden="true" className="size-2 bg-primary" />
              06 / {eyebrow}
            </MonoTag>
            <h2 className="max-w-2xl text-balance text-3xl font-light tracking-tight text-foreground md:text-5xl">
              {heading}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items
              .map((t) => ({
                quote: t.quote,
                name: t.name,
                role: t.role,
                rating: 5,
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
                      'relative gap-6 overflow-hidden rounded-none border border-border bg-card p-8',
                      i === 1 && 'lg:mt-12',
                      i === 2 && 'lg:mt-6',
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -top-6 right-4 select-none font-serif text-8xl leading-none text-foreground/[0.06]"
                    >
                      &rdquo;
                    </span>
                    <TestimonialQuote className="relative font-serif text-lg italic leading-relaxed text-foreground">
                      {__iv__.quote}
                    </TestimonialQuote>
                    <TestimonialAuthor className="mt-auto items-center gap-3 border-t border-border pt-5">
                      <span
                        aria-hidden="true"
                        className="size-2.5 shrink-0 bg-primary"
                      />
                      <div className="flex flex-col">
                        <TestimonialName className="text-sm font-medium tracking-tight text-foreground">
                          {__iv__.name}
                        </TestimonialName>
                        {(__iv__.role || __iv__.company || __iv__.meta) && (
                          <TestimonialMeta className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                            {__iv__.role || __iv__.company || __iv__.meta}
                          </TestimonialMeta>
                        )}
                      </div>
                    </TestimonialAuthor>
                  </TestimonialCard>
                )
              })}
          </div>
        </Container>
      </section>
    )
  },
})
