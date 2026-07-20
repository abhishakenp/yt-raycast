import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { z } from 'zod/v4'

import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'

/**
 * NewsTestimonials — newsprint "letters to the editor" reader-review wall for
 * a news / editorial site. Under an asymmetric masthead header (mono "Readers"
 * tag + serif heading on a heavy double rule, supporting line against a
 * hairline column rule) sits a 3-up grid of pulled-quote cards built on the
 * shared `TestimonialGrid` composite. Each sharp rounded-none hairline card
 * leads with a giant serif quotation mark, the reader's serif quote, and a
 * mono small-caps name + role footer; the middle column drops a step on
 * desktop for a broken-grid rhythm. The public `items` prop
 * ({quote, name, role, avatarAlt}) maps to the composite's items. Use to build
 * trust on a newspaper, magazine or subscription publication homepage,
 * typically before the subscribe CTA. Renders fully with no props via baked-in
 * defaults.
 */
export const NewsTestimonials = defineCapsule({
  name: 'NewsTestimonials',
  description:
    "Newsprint 'letters to the editor' reader-review wall for a news / editorial site: an asymmetric masthead header (mono Readers tag + serif heading on a heavy double rule, supporting line on a hairline column rule) over a 3-up grid of pulled-quote cards built on the shared TestimonialGrid composite. Each sharp rounded-none hairline card leads with a giant serif quotation mark, the reader's serif quote, and a mono small-caps name + role footer; the middle column drops a step on desktop for a broken-grid rhythm. Use to build trust on a newspaper, magazine or subscription publication homepage, typically before the subscribe CTA.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Section subheading. */
    subheading: z.string().optional(),
    /** Reader testimonials: quote, name, role, avatarAlt. */
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
    const heading = props.heading ?? 'What Readers Say'
    const subheading =
      props.subheading ?? 'Trusted by over 2 million subscribers worldwide'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              "The Chronicle's investigative reporting on climate policy helped me understand complex legislation better than any other source. Their journalists actually read the bills.",
            name: 'Prof. Robert Chen',
            role: 'Environmental Policy, Stanford',
            avatarAlt:
              'Professional headshot of Professor Robert Chen with glasses',
          },
          {
            quote:
              "I started my day with The Chronicle's briefing three years ago and haven't stopped. It's the perfect balance of depth and brevity for a busy executive.",
            name: 'Jennifer Walsh',
            role: 'CEO, Horizon Ventures',
            avatarAlt:
              'Professional headshot of Jennifer Walsh CEO in business attire',
          },
          {
            quote:
              "Finally, a news source that doesn't treat readers like attention-deficient children. Long-form journalism done right. Worth every penny of the subscription.",
            name: 'David Park',
            role: 'Software Architect, Seattle',
            avatarAlt: 'Professional headshot of David Park software engineer',
          },
        ]

    return (
      <section
        className={cn(
          'bg-background pt-20 pb-20 lg:pt-24 lg:pb-28',
          props.className,
        )}
      >
        <Container>
          {/* Asymmetric masthead header on a heavy double rule. */}
          <div className="mb-10 flex flex-col gap-3 border-b-2 border-foreground pb-4 shadow-[0_3px_0_-2px] shadow-border sm:flex-row sm:items-end sm:justify-between sm:gap-8">
            <div className="flex items-baseline gap-4">
              <MonoTag tone="faint" className="shrink-0">
                Readers
              </MonoTag>
              <h2 className="font-serif text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                {heading}
              </h2>
            </div>
            <p className="max-w-xs border-l border-border pl-4 text-sm leading-snug text-muted-foreground sm:border-l-0 sm:border-r sm:pb-1 sm:pl-0 sm:pr-4 sm:text-right">
              {subheading}
            </p>
          </div>

          <TestimonialGrid columns={3}>
            {items
              .map((t) => ({
                quote: t.quote,
                name: t.name,
                role: t.role,
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
                      'relative gap-5 rounded-none border-border pt-8 transition-colors duration-200 hover:border-foreground',
                      i % 3 === 1 && 'lg:translate-y-8',
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute left-5 top-1 select-none font-serif text-6xl font-black leading-none text-foreground/10"
                    >
                      &ldquo;
                    </span>
                    <TestimonialQuote className="relative font-serif text-lg italic leading-relaxed text-foreground">
                      {__iv__.quote}
                    </TestimonialQuote>
                    <TestimonialAuthor className="border-t border-border pt-4">
                      <div className="min-w-0">
                        <TestimonialName className="font-serif text-base font-black tracking-tight">
                          {__iv__.name}
                        </TestimonialName>
                        {(__iv__.role || __iv__.company || __iv__.meta) && (
                          <TestimonialMeta className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.16em]">
                            {__iv__.role || __iv__.company || __iv__.meta}
                          </TestimonialMeta>
                        )}
                      </div>
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
