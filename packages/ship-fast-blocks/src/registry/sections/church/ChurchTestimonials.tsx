import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { Card } from '#/section-kit/Card.tsx'

/**
 * ChurchTestimonials — a 3-up member testimonials wall for a church or faith-community
 * site. Centered header (eyebrow + heading + description), then a responsive grid of
 * quote cards with a blockquote, circular avatar headshot, name, and membership meta.
 * Warm, personal, and trust-building. Images use the Image component for avatar headshots.
 * Use for member stories, life-change testimonies, community impact quotes, or social
 * proof for churches, ministries, and nonprofits. Renders fully with no props via
 * baked-in defaults.
 */
export const ChurchTestimonials = defineCapsule({
  name: 'ChurchTestimonials',
  description:
    '3-up member testimonials wall for a church or faith-community site: centered header (eyebrow + heading + description), then a responsive grid of quote cards with a blockquote, circular avatar headshot, name, and membership meta. Warm, personal, and trust-building. Images use the Image component for avatar headshots. Use for member stories, life-change testimonies, community impact quotes, or social proof for churches, ministries, and nonprofits.',
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
      <section className={cn('bg-muted py-24 lg:py-32', props.className)}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
              {eyebrow}
            </p>
            <h2 className="mb-6 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {items.map((t) => (
              <Card key={t.name} padding="lg">
                <blockquote className="mb-6 leading-relaxed text-card-foreground">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="flex items-center gap-4">
                  <Image
                    alt={t.avatarAlt}
                    w={200}
                    h={200}
                    className="size-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-card-foreground">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.meta}</p>
                  </div>
                </figcaption>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
