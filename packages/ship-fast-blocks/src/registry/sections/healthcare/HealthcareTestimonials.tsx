import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * HealthcareTestimonials — patient-review grid for a medical-clinic page. A
 * centered eyebrow chip, heading and intro above a responsive 1/2/3-column grid
 * of bordered quote cards; each card shows a row of five accent-colored stars,
 * the quote in curly quotes, and a footer pairing an alt-driven circular avatar
 * with the patient's name and a "patient since" meta line. Use for a
 * testimonials / patient-stories / social-proof section of a doctors' office,
 * primary-care, pediatric or telehealth clinic. Renders fully with no props via
 * baked-in patient-testimonial defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { Card } from '#/section-kit/Card.tsx'
export const HealthcareTestimonials = defineCapsule({
  name: 'HealthcareTestimonials',
  description:
    "Patient-review grid for a medical-clinic page: a centered eyebrow chip, heading and intro above a responsive 1/2/3-column grid of bordered quote cards, each showing a row of five accent-colored stars, the quote in curly quotes, and a footer pairing an alt-driven circular avatar with the patient's name and a 'patient since' meta line. Use for a testimonials / patient-stories / social-proof section of a doctors' office, primary-care, pediatric or telehealth clinic.",
  props: z.object({
    /** Eyebrow chip text above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Testimonials: quote, name, meta line, and avatar alt. */
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
    const eyebrow = props.eyebrow ?? 'Patient Reviews'
    const heading = props.heading ?? 'What our patients say'
    const description =
      props.description ??
      'Real stories from real patients who trust us with their care.'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              "Dr. Chen took the time to actually listen to my concerns. She explained my blood work in detail and created a plan that fit my lifestyle. First doctor I've had in years who truly cares.",
            name: 'David Richardson',
            meta: 'Patient since 2021',
            avatarAlt: 'Portrait of patient David Richardson',
          },
          {
            quote:
              'The virtual visit option is a game-changer. I was able to get my prescription refill during my lunch break without driving across the city. The video quality and connection were perfect.',
            name: 'Jennifer Walsh',
            meta: 'Patient since 2019',
            avatarAlt: 'Portrait of patient Jennifer Walsh',
          },
          {
            quote:
              'As a new mom, I was anxious about finding the right pediatrician. Dr. Torres made us feel so comfortable. He answers all our questions patiently and my daughter actually looks forward to checkups!',
            name: 'Amanda Foster',
            meta: 'Patient since 2022',
            avatarAlt: 'Portrait of patient Amanda Foster',
          },
          {
            quote:
              'Finally a clinic with transparent pricing! I knew exactly what my visit would cost before I even walked in. No surprise bills months later. The online booking is seamless too.',
            name: 'Robert Kim',
            meta: 'Patient since 2020',
            avatarAlt: 'Portrait of patient Robert Kim',
          },
          {
            quote:
              "Dr. Patel is incredible. She made me feel so comfortable during my well-woman exam and addressed concerns I didn't even know I had. The staff is warm and the office is beautiful.",
            name: 'Lisa Thompson',
            meta: 'Patient since 2023',
            avatarAlt: 'Portrait of patient Lisa Thompson',
          },
          {
            quote:
              'I brought my elderly father here after his previous doctor retired. Dr. Mitchell was patient and thorough, explaining everything in terms we both understood. The whole family now comes here.',
            name: 'Marcus Johnson',
            meta: 'Patient since 2022',
            avatarAlt: 'Portrait of patient Marcus Johnson',
          },
        ]
    const Star = ({ className }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )
    return (
      <section
        className={cn('bg-muted py-20 lg:py-28', props.className)}
        aria-labelledby="testimonials-heading"
      >
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="mb-4 inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">
              {eyebrow}
            </span>
            <h2
              id="testimonials-heading"
              className="mb-4 text-3xl font-bold text-foreground sm:text-4xl"
            >
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((t) => (
              <Card
                key={t.name}
                asChild
                variant="default"
                rounded="2xl"
                padding="lg"
              >
                <blockquote>
                  <div
                    className="mb-4 flex items-center gap-1 text-primary"
                    aria-label="5 out of 5 stars"
                  >
                    {[0, 1, 2, 3, 4].map((n) => (
                      <Star key={n} />
                    ))}
                  </div>
                  <p className="mb-6 leading-relaxed text-card-foreground">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <footer className="flex items-center gap-4">
                    <Image
                      alt={t.avatarAlt}
                      w={128}
                      h={128}
                      loading="lazy"
                      className="size-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-card-foreground">
                        {t.name}
                      </p>
                      <p className="text-sm text-muted-foreground">{t.meta}</p>
                    </div>
                  </footer>
                </blockquote>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
