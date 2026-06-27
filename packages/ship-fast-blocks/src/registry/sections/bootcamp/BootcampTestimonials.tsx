import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * BootcampTestimonials — 6-up student-story testimonial grid for a coding
 * bootcamp / career-school landing page. A centered eyebrow, heading and
 * description above a responsive 2/3-column grid of rounded bordered cards;
 * each card has a round alt-driven avatar, the graduate's name and role, a
 * pull-quote, and an inline 5-star rating row. Use to build social proof for
 * bootcamps, dev academies, or career-switch programs by showcasing graduate
 * success stories.
 */
export const BootcampTestimonials = defineCapsule({
  name: 'BootcampTestimonials',
  description:
    "6-up student-story testimonial grid for a coding bootcamp / career-school landing page: centered eyebrow, heading and description above a responsive 2/3-column grid of rounded bordered cards. Each card has a round alt-driven avatar, the graduate's name and role, a pull-quote, and an inline 5-star rating row. Use to build social proof for bootcamps, dev academies, or career-switch programs by showcasing graduate success stories.",
  props: z.object({
    /** Section eyebrow label. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Testimonial cards: name, role, and full quote text. */
    items: z
      .array(
        z.object({
          name: z.string(),
          role: z.string(),
          quote: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const testimonialsEyebrow = props.eyebrow ?? 'Student Stories'
    const testimonialsHeading =
      props.heading ?? 'Career transformations that inspire'
    const testimonialsDesc =
      props.description ??
      'Meet our graduates who went from zero coding experience to thriving tech careers.'
    const testimonialItems = props.items?.length
      ? props.items
      : [
          {
            name: 'Jessica Martinez',
            role: 'Former Teacher → Frontend Developer',
            quote:
              "I was teaching elementary school and felt stuck. CodeCraft Academy gave me the skills and confidence to pivot into tech. Now I'm a Frontend Developer at Shopify earning $92,000.",
          },
          {
            name: 'Michael Park',
            role: 'Former Accountant → Full-Stack Engineer',
            quote:
              'The mentorship was the game-changer for me. Having a senior engineer review my code daily accelerated my learning tenfold. Landed my dream job at Airbnb within 3 weeks of graduating.',
          },
          {
            name: 'Amanda Foster',
            role: 'Former Retail Manager → Backend Developer',
            quote:
              'I was managing a retail store and feeling burned out. The Income Share Agreement meant I could quit my job and focus entirely on learning. Best decision I ever made — now making $88k at Spotify.',
          },
          {
            name: 'David Chen',
            role: 'Former Marketing → Software Engineer',
            quote:
              'Coming from a non-technical background, I was intimidated. But the curriculum is designed for beginners and the support system is incredible. Started at Stripe 2 months after graduation.',
          },
          {
            name: 'Sofia Ramirez',
            role: 'Former Nurse → Web Developer',
            quote:
              'I was a nurse for 8 years and wanted a change. The part-time option let me keep working while learning. The job guarantee gave me peace of mind. Now at Netflix earning more than double my nursing salary.',
          },
          {
            name: 'James Wilson',
            role: 'Former Construction → Senior Developer',
            quote:
              'At 35, I thought it was too late to switch careers. CodeCraft proved me wrong. The part-time program was perfect for my schedule. Promoted to Senior Dev at Uber within 18 months of starting.',
          },
        ]

    const Star = () => (
      <svg
        className="size-5 text-chart-4"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    return (
      <section className={cn('bg-muted/40 py-20 lg:py-32', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
            <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-wider text-primary">
              {testimonialsEyebrow}
            </span>
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              {testimonialsHeading}
            </h2>
            <p className="text-lg text-muted-foreground">{testimonialsDesc}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {testimonialItems.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border border-border bg-card p-8 shadow-sm"
              >
                <div className="mb-6 flex items-center gap-4">
                  <Image
                    alt={`professional headshot of ${t.name}, ${t.role}`}
                    w={100}
                    h={100}
                    loading="lazy"
                    className="size-14 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-card-foreground">
                      {t.name}
                    </p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </div>
                <p className="mb-4 text-muted-foreground">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-1">
                  {[0, 1, 2, 3, 4].map((n) => (
                    <Star key={n} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
