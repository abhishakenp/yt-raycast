import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'

/**
 * NewsletterTestimonials — newsprint-lite reader letters band for an editorial
 * newsletter. On a subtle muted band ruled top and bottom, behind a giant faint
 * serif quotation-mark watermark: a hairline meta rail (a primary square + mono
 * "Letters" label, a mono "From readers" tag) tops a left-aligned serif heading +
 * lede; then a staggered 3-up grid of square (rounded-none) hairline card quotes
 * (a serif pull-quote over a name + mono role source line), and below it a
 * collapsed-border 2-up / 4-up ledger of short serif mini-quotes with an em-dash
 * author line. Clean, literary newspaper structure. Use to surface social proof
 * for newsletters, publications, blogs, essayists, or content creators. Renders
 * fully with no props via baked-in defaults.
 */
export const NewsletterTestimonials = defineCapsule({
  name: 'NewsletterTestimonials',
  description:
    'Newsprint-lite reader letters band for an editorial newsletter on a subtle muted band ruled top and bottom behind a giant faint serif quotation-mark watermark: a hairline meta rail (a primary square + mono "Letters" label, a mono "From readers" tag) above a left-aligned serif heading + lede, then a staggered 3-up grid of square hairline card quotes (a serif pull-quote over a name + mono role source line), and below it a collapsed-border 2-up / 4-up ledger of short serif mini-quotes with an em-dash author line. Clean, literary newspaper structure. Use to surface social proof for newsletters, publications, blogs, essayists, or content creators.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting lede under the heading. */
    description: z.string().optional(),
    /** Full testimonial cards. */
    items: z
      .array(
        z.object({
          name: z.string(),
          role: z.string(),
          quote: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    /** Short mini-quotes row. */
    mini: z
      .array(z.object({ quote: z.string(), author: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'What Readers Say'
    const description =
      props.description ??
      'Join thousands of readers who make The Quiet Observer part of their Sunday ritual.'
    const items = props.items?.length
      ? props.items
      : [
          {
            name: 'Sarah Chen',
            role: 'Product Lead, Notion',
            quote:
              'The only newsletter I read start to finish every week. Sarah has this rare ability to find the signal in the noise of tech discourse.',
            avatarAlt:
              'professional headshot of a smiling woman with shoulder-length dark hair',
          },
          {
            name: 'Marcus Rivera',
            role: 'Engineering Manager, Stripe',
            quote:
              "I've been reading since issue #12. It's become essential context for my work—thoughtful, well-researched, and genuinely original.",
            avatarAlt:
              'professional headshot of a smiling man with short dark hair and glasses',
          },
          {
            name: 'Emily Watson',
            role: 'Design Director, Figma',
            quote:
              "Every Sunday, this is my first read with coffee. It's thoughtful, human, and consistently surfaces ideas that stay with me all week.",
            avatarAlt:
              'professional headshot of a woman with blonde hair pulled back wearing minimal jewelry',
          },
        ]
    const mini = props.mini?.length
      ? props.mini
      : [
          { quote: 'My favorite read', author: 'David Park, Vercel' },
          { quote: 'Essential context', author: 'Lisa Thompson, Linear' },
          { quote: 'Worth every minute', author: 'James Chen, GitHub' },
          { quote: 'Brilliant analysis', author: 'Maria Garcia, Apple' },
        ]

    return (
      <section
        className={cn(
          'relative overflow-hidden border-y border-border bg-muted/40 py-16 md:py-24',
          props.className,
        )}
      >
        <Watermark className="-top-16 right-2 select-none font-serif text-[16rem] leading-none not-italic sm:text-[22rem]">
          &rdquo;
        </Watermark>

        <Container size="lg" className="relative">
          <div className="mb-8 flex items-center justify-between gap-4 border-b border-border pb-4">
            <MonoTag className="flex items-center gap-3 tracking-[0.25em]">
              <span aria-hidden="true" className="size-1.5 bg-primary" />
              Letters
            </MonoTag>
            <MonoTag className="tracking-[0.25em]">From readers</MonoTag>
          </div>

          <SectionHeading
            title={heading}
            subtitle={description}
            align="left"
            titleClassName="font-serif text-3xl font-medium sm:text-4xl"
            subtitleClassName="max-w-2xl text-lg"
            className="mb-12 max-w-3xl gap-4 md:mb-16"
          />

          <TestimonialGrid
            columns={3}
            className="lg:[&>*:nth-child(3n-1)]:mt-8"
          >
            {items.map((t) => {
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
                  className="rounded-none border-border bg-background p-7"
                >
                  <TestimonialQuote className="font-serif text-lg italic leading-relaxed text-foreground">
                    &ldquo;{__iv__.quote}&rdquo;
                  </TestimonialQuote>
                  <TestimonialAuthor className="mt-auto flex-col items-start gap-1 border-t border-border pt-4">
                    <TestimonialName>{__iv__.name}</TestimonialName>
                    {(__iv__.role || __iv__.company || __iv__.meta) && (
                      <TestimonialMeta className="font-mono text-[11px] uppercase tracking-[0.15em]">
                        {__iv__.role || __iv__.company || __iv__.meta}
                      </TestimonialMeta>
                    )}
                  </TestimonialAuthor>
                </TestimonialCard>
              )
            })}
          </TestimonialGrid>

          <ResponsiveGrid
            cols="1-2-4"
            className="mt-12 gap-0 border-l border-t border-border"
          >
            {mini.map((m) => (
              <div
                key={m.author}
                className="border-b border-r border-border p-6"
              >
                <p className="font-serif text-xl font-medium italic text-foreground">
                  &ldquo;{m.quote}&rdquo;
                </p>
                <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                  — {m.author}
                </p>
              </div>
            ))}
          </ResponsiveGrid>
        </Container>
      </section>
    )
  },
})
