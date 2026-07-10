import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { Card, ResponsiveGrid } from '#/section-kit/index.ts'

/**
 * NoCodeTestimonials — centered-header 3-column star-rated testimonials grid on
 * a subtle muted band. A muted eyebrow, heading, and paragraph sit above a
 * 1-to-3 column grid of soft-bordered cards, each with a 5-star row, a quoted
 * testimonial, and an author block (rounded avatar image + name + role). Use as
 * the social-proof / customer-stories section on a no-code builder, SaaS, or
 * product landing page. Renders fully with no props.
 */
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

    const Star = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
        className="text-chart-4"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    return (
      <section
        className={cn('bg-muted/40 py-24', props.className)}
        aria-labelledby="nc-testimonials"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="mb-3 inline-block text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {eyebrow}
            </span>
            <h2
              id="nc-testimonials"
              className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <ResponsiveGrid cols="1-md-2-3" gap="lg">
            {items.map((t) => (
              <Card key={t.name} rounded="2xl" shadow="sm">
                <div className="mb-4 flex gap-1" aria-label="5 star rating">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star key={si} />
                  ))}
                </div>
                <p className="mb-6 leading-relaxed text-card-foreground">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <Image
                    alt={t.avatarAlt}
                    w={100}
                    h={100}
                    className="size-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-card-foreground">
                      {t.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t.role}
                    </div>
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
