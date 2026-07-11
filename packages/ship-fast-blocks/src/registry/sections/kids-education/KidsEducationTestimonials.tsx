import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * KidsEducationTestimonials — parent & teacher testimonial grid for a kids /
 * family learning platform. A centered eyebrow + heading + description intro on a
 * muted band above a responsive 3-up grid of rounded white quote cards; each card
 * has a 5-star rating row, a quote, and a headshot avatar with name + role. Use
 * as social proof for kids-education startups, children's e-learning platforms,
 * tutoring services, and family learning apps. Renders fully with no props via
 * baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
export const KidsEducationTestimonials = defineCapsule({
  name: 'KidsEducationTestimonials',
  description:
    "Parent & teacher testimonial grid for a kids / family learning platform: a centered eyebrow + heading + description intro on a muted band above a responsive 3-up grid of rounded white quote cards; each card has a 5-star rating row, a quote, and a headshot avatar with name + role. Use as social proof for kids-education startups, children's e-learning platforms, tutoring services, and family learning apps.",
  props: z.object({
    /** Uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description under the heading. */
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
    const heading = props.heading ?? 'Loved by Families'
    const description =
      props.description ??
      'See what parents and teachers are saying about their WonderLearn experience.'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              "WonderLearn has completely transformed our afternoon routine. My daughter used to beg for screen time, now she begs for 'learning time.' The science experiments are her absolute favorite!",
            name: 'Sarah Mitchell',
            role: 'Mother of two, Austin TX',
            avatarAlt:
              'Professional headshot of Sarah Mitchell, a smiling mother of two',
          },
          {
            quote:
              "As a 2nd grade teacher, I've tried many platforms. WonderLearn is the first one that truly engages every student. The progress reports help me identify who needs extra support in specific areas.",
            name: 'David Chen',
            role: '2nd Grade Teacher, Seattle WA',
            avatarAlt:
              'Professional headshot of David Chen, an elementary school teacher',
          },
          {
            quote:
              'My twins are 6 and have very different interests—one loves art, the other math. WonderLearn somehow engages both of them equally. The progress they made in 3 months is incredible!',
            name: 'Maria Gonzalez',
            role: 'Parent of twins, Chicago IL',
            avatarAlt:
              'Professional headshot of Maria Gonzalez, a mother of twins',
          },
        ]
    const Star = () => (
      <svg
        className="size-5 text-primary"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )
    return (
      <section className={cn('bg-muted/40 py-24', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-secondary">
              {eyebrow}
            </span>
            <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((t) => (
              <div key={t.name} className="rounded-3xl bg-card p-8 shadow-sm">
                <div className="mb-4 flex gap-1">
                  {[0, 1, 2, 3, 4].map((n) => (
                    <Star key={n} />
                  ))}
                </div>
                <p className="mb-6 leading-relaxed text-card-foreground">
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
                    <p className="font-semibold text-card-foreground">
                      {t.name}
                    </p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
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
