import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * ConstructionTestimonials — star-rated client testimonials grid for a
 * construction / general contractor page. A centered section heading above a
 * responsive grid of quote cards, each with five star icons, a quote, an
 * avatar, and an attribution name+role. All images use the alt-driven Image
 * component. Use as a social-proof reviews section for construction firms,
 * contractors, builders, or any service business. Renders fully with no
 * props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { Eyebrow } from '#/section-kit/Eyebrow.tsx'
import { TestimonialGrid } from '#/section-kit/TestimonialGrid.tsx'
export const ConstructionTestimonials = defineCapsule({
  name: 'ConstructionTestimonials',
  description:
    'Star-rated client testimonials grid for a construction / general contractor page: a centered section heading above a responsive grid of quote cards, each with five star icons, a quote, an alt-driven avatar, and an attribution name+role. Use as a social-proof reviews section for construction firms, contractors, builders, or any service business.',
  props: z.object({
    /** Section eyebrow label. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Testimonial items. */
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
    const eyebrow = props.eyebrow ?? 'Testimonials'
    const heading = props.heading ?? 'What our clients say'
    const description =
      props.description ??
      "Don't just take our word for it. Here's feedback from clients we've had the privilege to work with."
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'BuiltRight transformed our outdated office into a modern workspace that our team loves. They completed the project two weeks ahead of schedule and $15K under budget. Exceptional work.',
            name: 'David Chen',
            role: 'CEO, Pacific Tech Solutions',
            avatarAlt:
              'Professional headshot of a smiling businessman in a navy suit',
          },
          {
            quote:
              'From the first meeting to the final walkthrough, BuiltRight exceeded our expectations. Our custom home is everything we dreamed of and more. The craftsmanship is outstanding.',
            name: 'Sarah Mitchell',
            role: 'Homeowner, Bainbridge Island',
            avatarAlt:
              'Professional headshot of a smiling woman architect with dark hair',
          },
          {
            quote:
              'We hired BuiltRight for our restaurant renovation and they delivered a space that has completely transformed our business. Sales are up 40% since reopening. Worth every penny.',
            name: 'Marcus Rodriguez',
            role: 'Owner, Harvest Kitchen',
            avatarAlt:
              'Professional headshot of a smiling man chef with a beard wearing a white coat',
          },
          {
            quote:
              'BuiltRight constructed our 48-unit apartment complex with zero safety incidents and impeccable quality. Their project management kept everything on track for our tight deadline.',
            name: 'Jennifer Walsh',
            role: 'Development Director, Walsh Properties',
            avatarAlt:
              'Professional headshot of a smiling businesswoman with blonde hair wearing a blazer',
          },
          {
            quote:
              'After a bad experience with another contractor, BuiltRight restored our faith in the construction industry. Honest, transparent, and delivered exactly what they promised.',
            name: 'Robert Thompson',
            role: 'Homeowner, Seattle',
            avatarAlt:
              'Professional headshot of a smiling middle-aged man with glasses and gray hair',
          },
        ]
    return (
      <section className={cn('bg-card py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <Eyebrow
              variant="text"
              className="text-sm tracking-wider text-muted-foreground"
            >
              {eyebrow}
            </Eyebrow>
            <h2 className="mb-4 mt-3 text-3xl font-bold text-foreground sm:text-4xl">
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
