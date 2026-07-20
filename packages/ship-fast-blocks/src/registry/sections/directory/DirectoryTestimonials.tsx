import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { MonoTag } from '#/section-kit/Decor.tsx'

/**
 * DirectoryTestimonials — "letters to the editor" quote ledger for a
 * local-business directory. A paper section with an asymmetric hairline
 * header (serif heading + description left, mono "Reader letters" meta right)
 * above a collapsed-border 3-column grid of quote cells: each sharp-cornered
 * cell opens with a giant ghost serif quotation mark, carries the quote in
 * serif italic, and closes with a hairline-topped mono byline (name + role,
 * letter index numeral right). No links, no avatars. Use as social proof on
 * local directories, find-a-service platforms, or review-and-discovery sites.
 */
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
export const DirectoryTestimonials = defineCapsule({
  name: 'DirectoryTestimonials',
  description:
    'Letters-to-the-editor quote ledger for a local-business DIRECTORY: a paper section with an asymmetric hairline header (serif heading and description left, mono meta right) above a collapsed-border 3-column grid of quote cells — each sharp-cornered cell opens with a giant ghost serif quotation mark, carries the quote in serif italic, and closes with a hairline-topped mono byline of name and role plus a letter index numeral. No links, no avatars. Use as social proof on local directories, business-listing marketplaces, find-a-service platforms, or review-and-discovery sites.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description under the heading. */
    description: z.string().optional(),
    /** Testimonial quote cards. */
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
    const heading = props.heading ?? 'What People Are Saying'
    const description =
      props.description ??
      'Real experiences from customers and business owners in our community'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'Found an amazing contractor for my kitchen renovation through LocalFindr. The reviews were spot-on and saved me from hiring someone unreliable. Absolutely love this platform!',
            name: 'Sarah Mitchell',
            role: 'Homeowner in Portland',
            avatarAlt:
              'Professional headshot of a smiling woman with shoulder-length brown hair',
          },
          {
            quote:
              "Since listing my bakery on LocalFindr, we've seen a 40% increase in foot traffic. The platform connects us with customers who genuinely appreciate local businesses.",
            name: 'Marcus Chen',
            role: 'Owner, Sunrise Bakery',
            avatarAlt:
              'Professional headshot of a smiling man with short dark hair and glasses',
          },
          {
            quote:
              'As someone new to the city, LocalFindr has been invaluable. Found my gym, dentist, and favorite pizza place all in one week. The detailed reviews helped me make informed decisions.',
            name: 'James Rodriguez',
            role: 'New Resident in Austin',
            avatarAlt:
              'Professional headshot of a young man with curly hair and friendly expression',
          },
        ]
    return (
      <section className={cn('bg-background py-16 lg:py-24', props.className)}>
        <Container>
          <div className="mb-10 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between lg:mb-12">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-2"
              titleClassName="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
              subtitleClassName="text-muted-foreground"
            />
            <MonoTag tone="faint" aria-hidden="true" className="shrink-0">
              Reader letters · Verified
            </MonoTag>
          </div>

          <TestimonialGrid
            columns={3}
            className="[&>div]:gap-0 [&>div]:border-l [&>div]:border-t [&>div]:border-border"
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
                  className="relative gap-0 overflow-hidden rounded-none border-0 border-b border-r border-border bg-transparent p-6 hover:border-border sm:p-8"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -left-1 -top-5 select-none font-serif text-[5rem] leading-none text-foreground/10"
                  >
                    &ldquo;
                  </span>
                  <TestimonialQuote className="relative pt-8 font-serif text-base italic leading-relaxed text-foreground">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="mt-6 items-baseline justify-between gap-3 border-t border-border pt-4">
                    <span className="flex min-w-0 flex-col">
                      <TestimonialName className="font-mono text-xs uppercase tracking-[0.12em] text-foreground">
                        {__iv__.name}
                      </TestimonialName>
                      {(__iv__.role || __iv__.company || __iv__.meta) && (
                        <TestimonialMeta className="mt-1 font-mono text-[11px] text-muted-foreground">
                          {__iv__.role || __iv__.company || __iv__.meta}
                        </TestimonialMeta>
                      )}
                    </span>
                    <span
                      aria-hidden="true"
                      className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground/60"
                    >
                      Letter {String(i + 1).padStart(2, '0')}
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
