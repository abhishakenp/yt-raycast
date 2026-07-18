import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

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
import { Container } from '#/section-kit/Container.tsx'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'
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
    return (
      <section
        className={cn(
          'bg-muted/50 pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
        aria-labelledby="mobileapp-testimonials-heading"
      >
        <Container>
          <div className="mx-auto mb-16 max-w-2xl text-center lg:mb-20">
            <h2
              id="mobileapp-testimonials-heading"
              className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
            >
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <TestimonialGrid columns={3}>
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
                <TestimonialCard key={__iv__.name}>
                  <TestimonialQuote>{__iv__.quote}</TestimonialQuote>
                  <TestimonialAuthor>
                    <TestimonialName>{__iv__.name}</TestimonialName>
                    {(__iv__.role || __iv__.company || __iv__.meta) && (
                      <TestimonialMeta>
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
