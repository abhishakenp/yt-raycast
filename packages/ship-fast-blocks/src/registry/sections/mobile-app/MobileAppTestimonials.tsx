import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { Card, ResponsiveGrid } from '#/section-kit/index.ts'

/**
 * MobileAppTestimonials — a centered-intro, 6-up testimonials grid on a calm
 * muted band. A centered heading + description sits above a responsive
 * 2-/3-column grid of bordered card quotes; each card shows a 5-star rating row
 * (primary-colored stars), the quote in curly quotation marks, and an avatar +
 * name + role footer. Avatars are alt-driven via <Image>; no links. Use as the
 * social-proof / reviews wall on a habit tracker, fitness / wellness app,
 * productivity or to-do app, or any consumer app landing page. Renders fully
 * with no props via baked-in defaults.
 */
export const MobileAppTestimonials = defineCapsule({
  name: 'MobileAppTestimonials',
  description:
    'Centered-intro 6-up testimonials grid on a calm muted band: a centered heading + description over a responsive 2-/3-column grid of bordered card quotes, each with a 5-star rating row (primary-colored stars), the quote in curly quotation marks, and an avatar + name + role footer; avatars are alt-driven via <Image>. Use as the social-proof / reviews wall on a habit tracker, fitness / wellness app, productivity or to-do app, or any consumer app landing page.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
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
    const heading = props.heading ?? 'Loved by habit builders'
    const description =
      props.description ??
      'See what our community has to say about their DailyFlow journey.'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              "DailyFlow is the only habit tracker that didn't make me feel guilty for missing a day. I've meditated for 45 days straight now—the longest streak of my life.",
            name: 'Sarah Chen',
            role: 'Product Manager at Stripe',
            avatarAlt:
              'Professional headshot of Sarah Chen, a smiling woman with dark hair wearing a blue blouse',
          },
          {
            quote:
              'The accountability groups changed everything. Having 3 other people cheering me on made me actually stick to my morning workouts for the first time ever.',
            name: 'Marcus Johnson',
            role: 'Software Engineer at Google',
            avatarAlt:
              'Professional headshot of Marcus Johnson, a man with short curly hair and glasses wearing a gray sweater',
          },
          {
            quote:
              "I've tried 10+ habit apps. DailyFlow is the first one that actually feels peaceful to use. No clutter, no gamification addiction—just pure, simple tracking.",
            name: 'Emily Parker',
            role: 'UX Designer at Airbnb',
            avatarAlt:
              'Professional headshot of Emily Parker, a woman with blonde hair wearing a white turtleneck',
          },
          {
            quote:
              'The insights feature is incredible. I finally understand which habits trigger my best days. Data-driven self-improvement at its finest.',
            name: 'David Kim',
            role: 'Founder at TechStart',
            avatarAlt:
              'Professional headshot of David Kim, a man with a well-groomed beard and warm smile',
          },
          {
            quote:
              "As a therapist, I recommend DailyFlow to clients struggling with consistency. It's the only app that focuses on progress over perfection.",
            name: 'Dr. Lisa Thompson',
            role: 'Clinical Psychologist',
            avatarAlt:
              'Professional headshot of Dr. Lisa Thompson, a woman with shoulder-length brown hair wearing professional attire',
          },
          {
            quote:
              "The widget is a game-changer. I can check off habits without even opening the app. I've now journaled for 90 days straight!",
            name: 'Priya Sharma',
            role: 'Marketing Director',
            avatarAlt:
              'Professional headshot of Priya Sharma, a young woman with long dark hair and confident expression',
          },
        ]

    const Star = () => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className="size-5 text-primary"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    return (
      <section
        className={cn('bg-muted/50 py-20 lg:py-32', props.className)}
        aria-labelledby="mobileapp-testimonials-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center lg:mb-20">
            <h2
              id="mobileapp-testimonials-heading"
              className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
            >
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <ResponsiveGrid cols="1-md-2-3" gap="lg">
            {items.map((t) => (
              <Card key={t.name} rounded="2xl" padding="lg" shadow="sm">
                <div className="mb-4 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} />
                  ))}
                </div>
                <p className="mb-6 leading-relaxed text-card-foreground/80">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <Image
                    alt={t.avatarAlt}
                    w={100}
                    h={100}
                    className="size-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-card-foreground">
                      {t.name}
                    </p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </ResponsiveGrid>
        </div>
      </section>
    )
  },
})
