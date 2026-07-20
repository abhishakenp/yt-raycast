import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'

/**
 * ArchitectureFirmTestimonials — blueprint client-record grid for an
 * architecture-studio / design-practice page. Behind a giant ghost serif
 * quotation mark: an asymmetric header row — mono annotation rail ("04 /" +
 * eyebrow + hairline rule) and huge ultra-thin heading on the left, an
 * aria-hidden mono "TRANSCRIPTS" annotation on the right — above a staggered
 * 1/2/3-column grid of sharp hairline record cards (the middle card drops on
 * desktop). Each card is tagged with a mono "CLIENT 01" index, carries a
 * light-weight quote, and closes with a hairline-topped footer pairing a
 * square grayscale client portrait (color on card hover) with the name and a
 * mono uppercase role. Precise, monochrome, drafting-table calm. Tokens-only,
 * no links. Use as a testimonials / client-words / social-proof section for
 * architecture firms, design studios, interior designers, contractors or any
 * practice that wants to showcase client praise. Renders fully with no props
 * via three baked-in testimonials.
 */
export const ArchitectureFirmTestimonials = defineCapsule({
  name: 'ArchitectureFirmTestimonials',
  description:
    'Blueprint client-record grid for an architecture-studio / design-practice page: behind a giant ghost serif quotation mark, an asymmetric header row (mono annotation rail + huge ultra-thin heading left, aria-hidden mono "TRANSCRIPTS" annotation right) above a staggered 1/2/3-column grid of sharp hairline record cards (middle card dropped on desktop) — each tagged with a mono "CLIENT 01" index, carrying a light-weight quote and a hairline-topped footer pairing a square grayscale client portrait (color on hover) with name + mono uppercase role. Precise, monochrome, drafting-table calm. Tokens-only, no links. Use as a testimonials / client-words / social-proof section for architecture firms, design studios, interior designers, contractors or any practice showcasing client praise.',
  props: z.object({
    /** Wide letter-spaced eyebrow label. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Testimonials: quote, client name, role, portrait alt. */
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
    const eyebrow = props.eyebrow ?? 'Client Words'
    const heading = props.heading ?? 'Testimonials'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'Atelier Móði transformed our brief into something beyond what we imagined. They understood not just what we asked for, but how we actually live. The light in our home changes beautifully throughout the day.',
            name: 'Elena Rasmussen',
            role: 'Homeowner, Villa Kyst',
            avatarAlt:
              'Professional headshot of a smiling woman with shoulder-length brown hair',
          },
          {
            quote:
              'Working with Atelier Móði on our headquarters was exceptional. Their attention to acoustic detail and daylight created an office where people genuinely want to work. Productivity increased 23% after the move.',
            name: 'Magnus Lindström',
            role: 'CEO, Fjord Technologies',
            avatarAlt:
              'Professional headshot of a man with short dark hair and a navy blazer',
          },
          {
            quote:
              "The adaptive reuse of our warehouse exceeded every expectation. They preserved the building's soul while making it perfectly functional for modern living. Our tenants consistently mention the quality of space.",
            name: 'Johan Petersen',
            role: 'Developer, Pakhus 47',
            avatarAlt:
              'Professional headshot of a man with gray hair and glasses wearing a dark sweater',
          },
        ]

    return (
      <section
        aria-labelledby="architecture-firm-testimonials-heading"
        className={cn(
          'relative overflow-hidden bg-card py-16 sm:py-24 lg:py-28',
          props.className,
        )}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 right-0 select-none font-serif text-[14rem] leading-none text-foreground/[0.04] sm:text-[20rem] lg:-top-24 lg:text-[26rem]"
        >
          &rdquo;
        </span>
        <Container className="relative">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <div className="max-w-2xl">
              <div className="mb-6 flex items-center gap-4">
                <MonoTag className="shrink-0 text-foreground">04 /</MonoTag>
                <MonoTag className="shrink-0">{eyebrow}</MonoTag>
                <span aria-hidden="true" className="h-px w-16 bg-border" />
              </div>
              <SectionHeading
                align="left"
                title={heading}
                titleId="architecture-firm-testimonials-heading"
                className="gap-0"
                titleClassName="text-4xl font-extralight tracking-tight text-foreground sm:text-5xl lg:text-6xl"
              />
            </div>
            <MonoTag
              aria-hidden="true"
              className="shrink-0 text-muted-foreground/50"
            >
              Transcripts / {String(items.length).padStart(2, '0')}
            </MonoTag>
          </div>

          <TestimonialGrid
            columns={3}
            className="[&>div]:gap-6 [&>div]:lg:gap-8"
          >
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
                <TestimonialCard
                  key={__iv__.name}
                  className={cn(
                    'group gap-6 rounded-none border-border bg-background p-6 transition-colors duration-200 hover:border-foreground/40 sm:p-8',
                    i % 3 === 1 && 'lg:translate-y-10',
                  )}
                >
                  <MonoTag className="text-foreground">
                    Client {String(i + 1).padStart(2, '0')}
                  </MonoTag>
                  <TestimonialQuote className="text-base font-light leading-relaxed text-foreground">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="border-t border-border pt-5">
                    {__iv__.avatarAlt ? (
                      <Image
                        alt={__iv__.avatarAlt}
                        w={96}
                        h={96}
                        loading="lazy"
                        className="size-10 shrink-0 border border-border object-cover grayscale transition-[filter] duration-500 group-hover:grayscale-0"
                      />
                    ) : null}
                    <span className="flex flex-col gap-1">
                      <TestimonialName className="font-normal">
                        {__iv__.name}
                      </TestimonialName>
                      {(__iv__.role || __iv__.company || __iv__.meta) && (
                        <TestimonialMeta className="font-mono text-[10px] uppercase tracking-[0.15em]">
                          {__iv__.role || __iv__.company || __iv__.meta}
                        </TestimonialMeta>
                      )}
                    </span>
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
