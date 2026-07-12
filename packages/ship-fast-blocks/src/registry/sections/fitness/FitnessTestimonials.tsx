import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * FitnessTestimonials — member testimonials grid for a gym or fitness studio, on a
 * muted card-surface band. A centered heading + lead paragraph above a 3-column grid
 * of muted-surface quote cards, each with a 5-star rating row, the member quote, and
 * a footer of a round avatar + name + membership meta. Avatars use the alt-driven
 * Image component. Use for member stories / reviews / social proof on gyms, fitness
 * studios, yoga / pilates / boxing / spin studios or personal-training businesses.
 */
import { Container } from '#/section-kit/Container.tsx'
export const FitnessTestimonials = defineCapsule({
  name: 'FitnessTestimonials',
  description:
    'Member testimonials grid for a gym or fitness studio on a muted card-surface band: a centered heading and lead paragraph above a 3-column grid of muted-surface quote cards, each with a 5-star rating row, the member quote and a footer of a round avatar + name + membership meta. Avatars use the alt-driven Image component. Use for member stories, reviews or social proof on gyms, fitness studios, CrossFit boxes, yoga, pilates, boxing or spin / cycle studios and personal-training businesses.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          meta: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const testimonialsHeading = props.heading ?? 'Member stories'
    const testimonialsDesc =
      props.description ??
      'Real results from real members who made Base their fitness home.'
    const testimonialItems = props.items?.length
      ? props.items
      : [
          {
            quote:
              'The trainers here actually care. Marcus helped me deadlift 300lbs after two years of back pain. The community keeps me accountable—I actually look forward to 6am classes now.',
            name: 'Jennifer Walsh',
            meta: 'Member since 2021',
            avatarAlt:
              'headshot of Jennifer Walsh a smiling woman with blonde hair member testimonial',
          },
          {
            quote:
              "I've tried every boutique studio in the city. Base is the only one that combines serious equipment, expert instruction, and zero attitude. Elena's yoga classes transformed my practice.",
            name: 'David Park',
            meta: 'Member since 2023',
            avatarAlt:
              'headshot of David Park a man with glasses and short dark hair member testimonial',
          },
          {
            quote:
              'Lost 40 pounds in 8 months working with James on boxing and strength. The 5:30am crew is my second family now. Worth every penny of the Elite membership.',
            name: 'Michelle Torres',
            meta: 'Member since 2022',
            avatarAlt:
              'headshot of Michelle Torres a smiling woman with curly brown hair member testimonial',
          },
        ]
    const StarIcon = () => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )
    return (
      <section className={cn('bg-card py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-semibold text-foreground md:text-4xl">
              {testimonialsHeading}
            </h2>
            <p className="text-muted-foreground">{testimonialsDesc}</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {testimonialItems.map((t) => (
              <article key={t.name} className="rounded-lg bg-muted p-8">
                <div className="mb-4 flex items-center gap-1 text-primary">
                  {Array.from({
                    length: 5,
                  }).map((_, i) => (
                    <StarIcon key={i} />
                  ))}
                </div>
                <p className="mb-6 leading-relaxed text-foreground">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <Image
                    alt={t.avatarAlt}
                    w={80}
                    h={80}
                    className="size-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-medium text-foreground">{t.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.meta}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
