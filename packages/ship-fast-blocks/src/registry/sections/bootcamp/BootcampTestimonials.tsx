import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * BootcampTestimonials — 6-up student-story testimonial grid for a coding
 * bootcamp / career-school landing page. A centered eyebrow, heading and
 * description above a responsive 2/3-column grid of rounded bordered cards;
 * each card has a round alt-driven avatar, the graduate's name and role, a
 * pull-quote, and an inline 5-star rating row. Use to build social proof for
 * bootcamps, dev academies, or career-switch programs by showcasing graduate
 * success stories.
 */
import { Container } from '#/section-kit/Container.tsx'
import { Eyebrow } from '#/section-kit/Eyebrow.tsx'
import { TestimonialGrid } from '#/section-kit/TestimonialGrid.tsx'
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
    return (
      <section className={cn('bg-muted/40 py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
            <Eyebrow
              variant="text"
              className="mb-4 inline-block tracking-wider text-primary"
            >
              {testimonialsEyebrow}
            </Eyebrow>
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              {testimonialsHeading}
            </h2>
            <p className="text-lg text-muted-foreground">{testimonialsDesc}</p>
          </div>
          <TestimonialGrid items={testimonialItems} columns={3} />
        </Container>
      </section>
    )
  },
})
