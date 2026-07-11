import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

import { Container } from '#/section-kit/Container.tsx'

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

    const Star = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="text-chart-4"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

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

          <div className="grid gap-8 md:grid-cols-3">
            {testimonialItems.map((t) => (
              <div key={t.name} className="rounded-xl bg-card p-8 shadow-sm">
                <div className="mb-4 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} />
                  ))}
                </div>
                <p className="mb-6 leading-relaxed text-muted-foreground">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <Image
                    alt={t.avatarAlt}
                    w={100}
                    h={100}
                    loading="lazy"
                    className="size-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-medium">{t.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {t.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
