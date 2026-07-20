import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
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
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'

/**
 * CommunityForumTestimonials — playful-geometric staggered quote wall for a
 * community-platform / discussion-forum landing page. An asymmetric header
 * (mono "06 / voices" rail + left-aligned tight-tracked heading and lead,
 * mono "[ verified ]" meta right) above a 3-column grid of sharp-cornered
 * bordered forum-post cards tilted ±1deg with a staggered middle column. Each
 * card opens with a rounded-full mono sticker reaction chip ("▲ upvoted"),
 * carries the quote over a giant ghost quotation mark, and closes with an
 * attribution row: a rounded-full alt-driven avatar (via <Image>) ringed in
 * border-background, the name in bold, and the role as a mono micro-label.
 * Cards lift onto a hard offset shadow on hover. No links. Use as the
 * social-proof / customer-voices section for community platforms, SaaS
 * products, or professional networks.
 */
export const CommunityForumTestimonials = defineCapsule({
  name: 'CommunityForumTestimonials',
  description:
    'Playful-geometric staggered quote wall for a community-platform / discussion-forum landing page: an asymmetric header (mono metadata rail + left-aligned tight-tracked heading, mono meta tag right) above a 3-column grid of sharp-cornered bordered forum-post cards tilted ±1deg with a staggered middle column, each opening with a rounded-full mono sticker reaction chip, carrying its quote over a giant ghost quotation mark, and closing with an attribution row of a rounded-full alt-driven avatar (via Image), bold name, and mono role micro-label; cards lift onto a hard offset shadow on hover. No links. Use as the social-proof / customer-voices section for community platforms, SaaS products, or professional networks.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Testimonial cards: quote + name + role + avatarAlt. */
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
    const heading = props.heading ?? 'Loved by community builders'
    const description =
      props.description ??
      'See what leaders and creators say about growing their communities with Threadloom.'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'Threadloom transformed how our remote team stays connected. The threaded discussions make it easy to follow conversations, and the search is incredibly powerful.',
            name: 'Sarah Chen',
            role: 'VP of People, Linear',
            avatarAlt:
              'professional headshot of a smiling woman with shoulder-length brown hair',
          },
          {
            quote:
              'We migrated 50,000 members from a Facebook group to Threadloom. Member engagement increased 340% because people can actually find and follow discussions that matter to them.',
            name: 'Marcus Johnson',
            role: 'Founder, IndieHackers Pro',
            avatarAlt:
              'professional headshot of a man with short dark hair and glasses',
          },
          {
            quote:
              'The moderation tools are exceptional. We can set automated rules, review flagged content, and maintain quality without spending hours on manual work.',
            name: 'Elena Rodriguez',
            role: 'Community Lead, Notion',
            avatarAlt:
              'professional headshot of a woman with blonde hair wearing a business blazer',
          },
        ]
    const tilts = ['-rotate-1', 'rotate-1', '-rotate-1']
    const reactions = ['▲ upvoted', '✦ pinned', '❋ starred']

    return (
      <section
        className={cn(
          'relative overflow-hidden py-16 sm:py-20 lg:py-28',
          props.className,
        )}
      >
        <Watermark className="-left-8 top-0 font-serif text-[12rem] sm:text-[18rem] lg:text-[24rem]">
          &ldquo;
        </Watermark>
        <Container size="lg" className="relative">
          <div className="mb-12 flex flex-col gap-6 sm:mb-16 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-5 flex items-center gap-4">
                <MonoTag>06 / Voices</MonoTag>
                <span
                  aria-hidden="true"
                  className="h-px w-16 bg-border sm:w-24"
                />
              </div>
              <SectionHeading
                align="left"
                title={heading}
                subtitle={description}
                className="gap-0"
                titleClassName="mb-4 text-3xl font-extrabold tracking-tighter text-foreground sm:text-4xl lg:text-5xl"
                subtitleClassName="text-lg text-muted-foreground"
              />
            </div>
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 md:mb-2"
            >
              [ verified ]
            </MonoTag>
          </div>
          <TestimonialGrid columns={3} className="[&>div]:gap-5">
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
                    'relative rounded-none border-2 border-foreground/15 bg-card p-6 transition-all duration-150 hover:-translate-y-1 hover:border-foreground/40 hover:shadow-[5px_5px_0_0] hover:shadow-primary/25 sm:p-7',
                    tilts[i % tilts.length],
                    i % 3 === 1 && 'lg:translate-y-8',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-1 right-3 select-none font-serif text-[5rem] leading-none text-primary/10"
                  >
                    &ldquo;
                  </span>
                  <span
                    aria-hidden="true"
                    className="inline-flex w-fit -rotate-1 items-center rounded-full border border-foreground/15 bg-background px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
                  >
                    {reactions[i % reactions.length]}
                  </span>
                  <TestimonialQuote className="relative leading-relaxed">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="border-t border-border pt-4">
                    {__iv__.avatarAlt ? (
                      <Image
                        alt={__iv__.avatarAlt}
                        w={96}
                        h={96}
                        loading="lazy"
                        className="size-10 shrink-0 rounded-full border-2 border-background object-cover ring-2 ring-foreground/15"
                      />
                    ) : null}
                    <span className="flex flex-col">
                      <TestimonialName className="font-bold tracking-tight">
                        {__iv__.name}
                      </TestimonialName>
                      {(__iv__.role || __iv__.company || __iv__.meta) && (
                        <TestimonialMeta className="font-mono text-[10px] uppercase tracking-[0.1em]">
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
