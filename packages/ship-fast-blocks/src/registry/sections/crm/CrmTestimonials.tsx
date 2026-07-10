import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { Card } from '#/section-kit/Card.tsx'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * CrmTestimonials — centered testimonial wall for a CRM / SaaS landing page. A
 * heading + supporting paragraph above a responsive 1/2/3-up grid of bordered
 * muted cards, each with a 5-star rating row, a quote, and an alt-driven round
 * avatar beside the customer name and role. Warm, credible social proof. Use to
 * showcase customer love for CRM, sales-pipeline or B2B SaaS products. Renders
 * fully with no props.
 */
export const CrmTestimonials = defineCapsule({
  name: 'CrmTestimonials',
  description:
    'Centered testimonial wall for a CRM / SaaS landing page: a heading + supporting paragraph above a responsive 1/2/3-up grid of bordered muted cards, each with a 5-star rating row, a quote, and an alt-driven round avatar beside the customer name and role. Warm, credible social proof. Use to showcase customer love for CRM, sales-pipeline or B2B SaaS products.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Testimonial cards. */
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
    const heading = props.heading ?? 'Loved by sales teams worldwide'
    const description =
      props.description ??
      'See how companies are transforming their sales process with Pipeline Pro.'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'Pipeline Pro transformed how our team operates. We went from chaotic spreadsheets to a streamlined process. Our close rate increased 28% in the first quarter alone.',
            name: 'Marcus Chen',
            role: 'VP of Sales, TechFlow Inc.',
            avatarAlt:
              'professional headshot of a smiling male executive in navy suit',
          },
          {
            quote:
              'The AI forecasting feature is a game-changer. I can now predict quarterly revenue with confidence and make data-driven decisions about hiring and resource allocation.',
            name: 'Sarah Mitchell',
            role: 'Sales Director, BrightPath Solutions',
            avatarAlt:
              'professional headshot of a confident female sales director with blonde hair',
          },
          {
            quote:
              "Setup took literally 10 minutes. The team was skeptical about switching CRMs, but after one week, everyone was asking why we didn't do this sooner.",
            name: 'David Park',
            role: 'CEO, StartupXYZ',
            avatarAlt:
              'professional headshot of a friendly male startup founder with glasses',
          },
          {
            quote:
              "We evaluated 8 different CRMs. Pipeline Pro had the cleanest interface, best mobile app, and most reasonable pricing. Six months in, we're still discovering new features we love.",
            name: 'Jennifer Walsh',
            role: 'Head of Revenue, GlobalTech',
            avatarAlt:
              'professional headshot of a businesswoman with curly brown hair and warm smile',
          },
          {
            quote:
              'The Slack integration alone saved us 5 hours a week. Notifications about deal updates happen instantly, and the team stays aligned without endless status meetings.',
            name: 'Alex Rivera',
            role: 'Sales Manager, Nexus Digital',
            avatarAlt:
              'professional headshot of a young male sales manager with short dark hair',
          },
          {
            quote:
              "Customer support is incredible. We had questions about custom workflows and got a detailed response within 2 hours with a video walkthrough. That's rare these days.",
            name: 'Rachel Kim',
            role: 'Operations Lead, CloudFirst',
            avatarAlt:
              'professional headshot of a female operations manager with red hair and friendly expression',
          },
        ]

    const Star = () => (
      <svg
        className="size-5 text-chart-4"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    )

    return (
      <section className={cn('bg-background py-20 lg:py-32', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((t) => (
              <Card
                key={t.name}
                variant="muted"
                padding="lg"
                className="bg-muted/50"
              >
                <div className="mb-4 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star key={si} />
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
                    loading="lazy"
                    className="size-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-foreground">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
