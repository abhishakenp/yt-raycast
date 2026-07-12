import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

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
    const Star = ({ className }) => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )
    return (
      <section className={cn('bg-card py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {eyebrow}
            </span>
            <h2 className="mb-4 mt-3 text-3xl font-bold text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((t) => (
              <blockquote key={t.name} className="rounded-xl bg-muted p-8">
                <div className="mb-4 flex gap-1 text-primary">
                  {Array.from({
                    length: 5,
                  }).map((_, i) => (
                    <Star key={i} />
                  ))}
                </div>
                <p className="mb-6 leading-relaxed text-foreground/80">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <footer className="flex items-center gap-4">
                  <Image
                    alt={t.avatarAlt}
                    w={120}
                    h={120}
                    className="size-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-foreground">
                      {t.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t.role}
                    </div>
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
