import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import { TestimonialGrid } from '#/section-kit/TestimonialGrid.tsx'

/**
 * CrowdfundingTestimonials — a 3-up backer TESTIMONIALS grid for a crowdfunding
 * / campaign landing page. On a muted band: a centered uppercase eyebrow +
 * heading above a responsive three-column grid of raised card quotes, each with
 * a 5-star rating row (chart-toned star glyphs), the quote, and an alt-driven
 * avatar with name + role. Imagery (including avatars) uses the Image
 * component. Use as social proof on a product launch, pre-order, fundraiser, or
 * maker campaign where reviewer credibility and ratings build trust.
 */
export const CrowdfundingTestimonials = defineCapsule({
  name: 'CrowdfundingTestimonials',
  description:
    'A 3-up backer TESTIMONIALS grid for a crowdfunding / campaign landing page on a muted band: a centered uppercase eyebrow + heading above a responsive three-column grid of raised card quotes, each with a 5-star rating row (chart-toned star glyphs), the quote, and an alt-driven avatar with name + role. Imagery (including avatars) uses the Image component. Use as social proof on a product launch, pre-order, fundraiser, or maker campaign where reviewer credibility and ratings build trust.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
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
    const testimonialsEyebrow = props.eyebrow ?? 'Testimonials'
    const testimonialsHeading = props.heading ?? 'What Beta Testers Are Saying'
    const testimonialItems = props.items?.length
      ? props.items
      : [
          {
            quote:
              "I've tried every eco-friendly toothbrush out there. EcoBrush is the first one that actually feels like a premium product. The bamboo is smooth and warm in your hand—completely different from cold plastic.",
            name: 'Jennifer Walsh',
            role: 'Environmental Consultant, Portland',
            avatarAlt:
              'Professional headshot of a smiling woman with shoulder-length brown hair',
          },
          {
            quote:
              "As a dentist, I'm particular about oral care. The 40,000 VPM motor delivers serious cleaning power. My patients who tested it saw measurable improvements in plaque reduction. And they love that it won't sit in a landfill forever.",
            name: 'Dr. Michael Chen',
            role: 'Dentist, San Francisco',
            avatarAlt:
              'Professional headshot of a male dentist in white coat with friendly smile',
          },
          {
            quote:
              "The battery life is incredible—I charged it when I received it three weeks ago and it's still going strong. The travel case is elegant and the whole product just feels thoughtful. This is how all products should be designed.",
            name: 'Marcus Okafor',
            role: 'Product Designer, Berlin',
            avatarAlt:
              'Professional headshot of a young man with beard and warm expression',
          },
        ]

    return (
      <section className={cn('bg-muted py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mb-16 text-center">
            <span className="text-sm font-medium uppercase tracking-wider text-primary">
              {testimonialsEyebrow}
            </span>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              {testimonialsHeading}
            </h2>
          </div>

          <TestimonialGrid items={testimonialItems} columns={3} />
        </Container>
      </section>
    )
  },
})
