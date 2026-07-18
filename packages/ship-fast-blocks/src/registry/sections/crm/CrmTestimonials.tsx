import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * CrmTestimonials — centered testimonial wall for a CRM / SaaS landing page. A
 * heading + supporting paragraph above a responsive 1/2/3-up grid of bordered
 * muted cards, each with a 5-star rating row, a quote, and an alt-driven round
 * avatar beside the customer name and role. Warm, credible social proof. Use to
 * showcase customer love for CRM, sales-pipeline or B2B SaaS products. Renders
 * fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
import { TestimonialGrid } from '#/section-kit/TestimonialGrid.tsx'
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
    return (
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <TestimonialGrid items={items} columns={3} />
        </Container>
      </section>
    )
  },
})
