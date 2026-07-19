import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * NoCodeTestimonials — centered-header 3-column star-rated testimonials grid on
 * a subtle muted band. A muted eyebrow, heading, and paragraph sit above a
 * 1-to-3 column grid of soft-bordered cards, each with a 5-star row, a quoted
 * testimonial, and an author block (rounded avatar image + name + role). Use as
 * the social-proof / customer-stories section on a no-code builder, SaaS, or
 * product landing page. Renders fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'
export const NoCodeTestimonials = defineCapsule({
  name: 'NoCodeTestimonials',
  description:
    'Centered-header 3-column star-rated testimonials grid on a subtle muted band: a muted eyebrow, heading, and paragraph above a 1-to-3 column grid of soft-bordered cards, each with a 5-star row, a quoted testimonial, and an author block (rounded avatar image + name + role). Use as the social-proof / customer-stories section on a no-code / app-builder SaaS or product landing page.',
  props: z.object({
    /** Muted uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
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
    const eyebrow = props.eyebrow ?? 'Testimonials'
    const heading = props.heading ?? 'Loved by creators worldwide'
    const description =
      props.description ?? 'See what our community is building with Buildr.'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'I built my entire e-commerce store in a weekend without writing a single line of code. The templates are gorgeous and the editor is incredibly intuitive. Sales are up 40% since the redesign.',
            name: 'Sarah Chen',
            role: 'Founder, GreenLeaf Organics',
            avatarAlt:
              'Professional headshot of Sarah Chen, founder of GreenLeaf Organics',
          },
          {
            quote:
              'As a designer without coding skills, I was always dependent on developers. Buildr changed everything. Now I prototype and launch full products myself. The integrations with Figma are seamless.',
            name: 'Marcus Johnson',
            role: 'Product Designer, TechFlow',
            avatarAlt:
              'Professional headshot of Marcus Johnson, product designer at TechFlow',
          },
          {
            quote:
              'We migrated our entire agency workflow to Buildr and cut project delivery time by 60%. The collaboration features let our whole team work together seamlessly. Clients are amazed at the speed.',
            name: 'Elena Rodriguez',
            role: 'CEO, Brightside Agency',
            avatarAlt:
              'Professional headshot of Elena Rodriguez, CEO of Brightside Agency',
          },
        ]
    return (
      <section
        className={cn('bg-muted/40 py-24', props.className)}
        aria-labelledby="nc-testimonials"
      >
        <Container>
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            subtitle={description}
            titleId="nc-testimonials"
            className="mb-16 max-w-3xl gap-0"
            eyebrowClassName="mb-3 inline-block text-sm font-medium uppercase tracking-wider text-muted-foreground"
            titleClassName="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl"
            subtitleClassName="text-lg text-muted-foreground"
          />
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
