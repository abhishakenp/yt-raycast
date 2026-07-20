import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'
import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'

import { Container } from '#/section-kit/Container.tsx'

/**
 * NonprofitTestimonials — warm mission-editorial impact-stories wall for a
 * nonprofit / charity / NGO page. An asymmetric header (serif heading left, mono
 * story-count meta right) sits above a responsive 1/2/3-column grid of square
 * hairline cards whose middle column steps down on desktop for a calm stagger,
 * built on the shared `TestimonialGrid` composite. Each card opens with a
 * zero-padded mono index numeral, then an oversized serif-italic quote, and a
 * hairline-topped footer pairing the person's name with a mono relationship
 * meta line (beneficiary, donor, volunteer). The public `stories` prop
 * ({quote, name, role}) maps to the composite items. Warm, human, resonant. Use
 * for social proof and emotional resonance on nonprofit, foundation, or
 * humanitarian pages. Renders fully with no props via baked-in "Roots of Hope"
 * defaults.
 */
export const NonprofitTestimonials = defineCapsule({
  name: 'NonprofitTestimonials',
  description:
    "Warm mission-editorial impact-stories wall for a nonprofit / charity / NGO page built on the shared TestimonialGrid composite: an asymmetric header (serif heading left, mono story-count meta right) above a responsive 1/2/3-column grid of square hairline cards whose middle column steps down on desktop for a calm stagger. Each card opens with a zero-padded mono index numeral, then an oversized serif-italic quote, and a hairline-topped footer pairing the person's name with a mono relationship meta line (beneficiary, donor, volunteer). The public `stories` prop maps to the composite items. Warm, human, resonant. Use for social proof and emotional resonance on nonprofit, foundation, or humanitarian pages.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Impact stories: quote, name, and the person's role / relationship. */
    stories: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          role: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Stories of hope'
    const stories = props.stories?.length
      ? props.stories
      : [
          {
            quote:
              "Before the well, I walked three hours each day for water. Now my daughters spend that time in school. This program didn't just give us water — it gave them a future.",
            name: 'Amara Okoye',
            role: 'Program participant',
          },
          {
            quote:
              "I've given to a lot of causes, but here I actually see where my money goes. The updates, the photos, the lives changed — it's the most meaningful thing I do all year.",
            name: 'David Chen',
            role: 'Monthly donor',
          },
          {
            quote:
              "Volunteering on the ground changed me. Watching a community rebuild with dignity, not handouts, showed me what real hope looks like. I'll keep coming back as long as they'll have me.",
            name: 'Sofia Martínez',
            role: 'Field volunteer',
          },
        ]

    const items = stories.map((s) => ({
      quote: s.quote,
      name: s.name,
      role: s.role,
    }))

    return (
      <section className="bg-background pt-24 pb-20 lg:pt-28 lg:pb-28">
        <Container>
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <SectionHeading
              align="left"
              eyebrow="Voices"
              title={heading}
              className="max-w-2xl gap-0"
              eyebrowClassName="mb-4 inline-block font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground"
              titleClassName="font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]"
            />
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 md:pb-1"
            >
              {String(items.length).padStart(2, '0')} / stories
            </MonoTag>
          </div>

          <TestimonialGrid columns={3} className={props.className}>
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
                    'gap-5 rounded-none border-border bg-muted/30 p-6 shadow-none sm:p-7',
                    i % 3 === 1 && 'lg:translate-y-8',
                  )}
                >
                  <MonoTag aria-hidden="true" tone="faint">
                    {String(i + 1).padStart(2, '0')}
                  </MonoTag>
                  <TestimonialQuote className="font-serif text-lg font-normal italic leading-relaxed text-foreground">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="border-t border-border pt-4">
                    <span className="flex min-w-0 flex-col">
                      <TestimonialName>{__iv__.name}</TestimonialName>
                      {(__iv__.role || __iv__.company || __iv__.meta) && (
                        <TestimonialMeta className="font-mono text-[10px] uppercase tracking-[0.12em]">
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
