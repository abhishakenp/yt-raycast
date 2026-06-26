import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * CommunityForumTestimonials — star-rated testimonial grid for a community-platform /
 * discussion-forum landing page. A centered heading + description above a responsive
 * 3-column grid of bordered card tiles; each tile has a 5-star rating strip, a quote,
 * and an attribution row with a round avatar (via <Image>) + name + role. No links.
 * Use as the social-proof / customer-voices section for community platforms, SaaS
 * products, or professional networks.
 */
export const CommunityForumTestimonials = defineComponent({
  name: 'CommunityForumTestimonials',
  description:
    'Star-rated testimonial grid for a community-platform / discussion-forum landing page: a centered heading and description above a responsive 3-column grid of bordered card tiles, each with a 5-star rating strip, a quote, and an attribution row with a round avatar (via Image) + name + role. No links. Use as the social-proof / customer-voices section for community platforms, SaaS products, or professional networks.',
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

    const Star = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    return (
      <section className={cn('py-24 lg:py-32', props.className)}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((t) => (
              <div
                key={t.name}
                className="rounded-xl border border-border bg-card p-8"
              >
                <div className="mb-4 flex items-center gap-1 text-chart-4">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="size-5" />
                  ))}
                </div>
                <p className="mb-6 leading-relaxed text-foreground/80">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <Image
                    alt={t.avatarAlt}
                    w={100}
                    h={100}
                    className="size-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-card-foreground">
                      {t.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
