import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

/**
 * ChurchTestimonials — serene editorial member-stories wall for a church or
 * faith-community site, set on a soft muted wash behind a giant ghost serif
 * quotation mark. An asymmetric header (mono metadata rail: eyebrow — hairline
 * rule — "words from the family"; serif heading; hairline-ruled description),
 * then a gently staggered 3-column grid (middle card drifts down on desktop)
 * of sharp hairline-framed quote cards: each opens with a small serif
 * quotation ornament, sets the quote in italic serif, and closes with a
 * hairline-ruled author row (name + mono membership meta). Warm, personal,
 * and trust-building. Use for member stories, life-change testimonies,
 * community impact quotes, or social proof for churches, ministries, and
 * nonprofits. Renders fully with no props via baked-in defaults.
 */
export const ChurchTestimonials = defineCapsule({
  name: 'ChurchTestimonials',
  description:
    'Serene editorial member-stories wall for a church or faith-community site on a soft muted wash behind a giant ghost serif quotation mark: asymmetric header (mono metadata rail with hairline rule, serif heading, hairline-ruled description), then a gently staggered 3-column grid of sharp hairline-framed quote cards whose middle card drifts down on desktop — each with a small serif quotation ornament, an italic serif quote, and a hairline-ruled author row with name + mono membership meta. Use for member stories, life-change testimonies, community impact quotes, or social proof for churches, ministries, and nonprofits.',
  props: z.object({
    /** Small uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Paragraph under the heading. */
    description: z.string().optional(),
    /** Testimonial cards; each has quote, name, meta, and avatar alt. */
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          meta: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Stories'
    const heading = props.heading ?? 'Life change happens here'
    const description =
      props.description ??
      'Hear from people who have found community, purpose, and faith at Grace.'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              "I walked in broken after losing my job and marriage. This community didn't just pray for me—they showed up with meals, helped me move, and walked with me through the darkest season. I'm not the same person I was two years ago.",
            name: 'David Chen',
            meta: 'Member since 2022',
            avatarAlt:
              'Professional headshot of a smiling man in his 40s with short brown hair and a warm expression',
          },
          {
            quote:
              "As a single mom, finding a church that truly welcomed my kids was everything. The youth program has become my daughter's second home, and I've found lifelong friends in my small group. We're family here.",
            name: 'Marcus Johnson',
            meta: 'Member since 2019',
            avatarAlt:
              'Professional headshot of a smiling woman in her 30s with curly dark hair and natural makeup',
          },
          {
            quote:
              'I grew up skeptical of church. A friend invited me to a service and I was struck by how real and unpretentious it felt. The teaching engages my mind and the people have won my heart. I never expected to be baptized at 34.',
            name: 'Ryan Mitchell',
            meta: 'Member since 2023',
            avatarAlt:
              'Professional headshot of a friendly man in his 30s with a beard and glasses wearing a casual shirt',
          },
        ]

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-muted/40 py-20 lg:py-28',
          props.className,
        )}
      >
        {/* Giant ghost quotation mark. */}
        <Watermark className="-top-16 left-0 font-serif text-[16rem] font-medium text-foreground/[0.04] sm:text-[22rem]">
          &ldquo;
        </Watermark>
        <Container size="xl" className="relative px-6">
          <div className="mb-14 max-w-2xl lg:mb-16">
            <div className="mb-5 flex items-center gap-4">
              <MonoTag tone="primary" className="shrink-0">
                {eyebrow}
              </MonoTag>
              <span aria-hidden="true" className="h-px flex-1 bg-border" />
              <MonoTag tone="faint" className="hidden shrink-0 sm:inline">
                Words from the family
              </MonoTag>
            </div>
            <SectionHeading
              align="left"
              title={heading}
              subtitle={description}
              className="gap-0"
              titleClassName="mb-5 font-serif text-4xl font-medium leading-[1.08] tracking-tight text-foreground sm:text-5xl"
              subtitleClassName="max-w-md border-l border-border pl-5 text-base leading-relaxed text-muted-foreground sm:text-lg"
            />
          </div>
          <TestimonialGrid columns={3}>
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
                    'rounded-none border border-border bg-background p-7 shadow-none transition-colors duration-200 hover:border-foreground/40 sm:p-8',
                    i % 3 === 1 && 'lg:translate-y-10',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="mb-4 block font-serif text-4xl leading-none text-primary/50"
                  >
                    &ldquo;
                  </span>
                  <TestimonialQuote className="font-serif text-base italic leading-relaxed tracking-tight sm:text-lg">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="mt-6 border-t border-border pt-5">
                    <TestimonialName className="font-serif text-base font-medium tracking-tight">
                      {__iv__.name}
                    </TestimonialName>
                    {(__iv__.role || __iv__.company || __iv__.meta) && (
                      <TestimonialMeta className="ml-auto font-mono text-[10px] uppercase tracking-[0.16em]">
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
