import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * NewsletterTestimonials — reader testimonials band for an editorial newsletter.
 * On a subtle muted band bordered top and bottom: a centered serif heading + lede,
 * a 3-up grid of rounded card quotes (round avatar + name + role, then an italic
 * pull-quote), and below it a 2-up / 4-up row of short serif mini-quotes with an
 * em-dash author line. Warm, calm, literary mood. Avatars use the alt-driven
 * Image component. Use to surface social proof for newsletters, publications,
 * blogs, essayists, or content creators. Renders fully with no props via
 * baked-in defaults.
 */
export const NewsletterTestimonials = defineCapsule({
  name: 'NewsletterTestimonials',
  description:
    'Reader testimonials band for an editorial newsletter on a subtle muted band bordered top and bottom: a centered serif heading + lede, a 3-up grid of rounded card quotes (round avatar + name + role, then an italic pull-quote), and below it a 2-up / 4-up row of short serif mini-quotes with an em-dash author line. Warm, calm, literary mood. Avatars use the alt-driven Image component. Use to surface social proof for newsletters, publications, blogs, essayists, or content creators.',
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
          'border-y border-border bg-muted/40 py-16 md:py-24',
          props.className,
        )}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
            <h2 className="mb-4 font-serif text-3xl font-medium text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
            {items.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl bg-card p-6 text-card-foreground md:p-8"
              >
                <div className="mb-4 flex items-center gap-4">
                  <Image
                    alt={t.avatarAlt}
                    w={100}
                    h={100}
                    loading="lazy"
                    className="size-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-foreground">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </div>
                <p className="italic leading-relaxed text-foreground/80">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-4 text-center sm:grid-cols-2 lg:grid-cols-4">
            {mini.map((m) => (
              <div key={m.author} className="p-4">
                <p className="mb-1 font-serif text-xl font-medium text-foreground">
                  &ldquo;{m.quote}&rdquo;
                </p>
                <p className="text-sm text-muted-foreground">— {m.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
