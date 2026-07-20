import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * BootcampTestimonials — "Terminal Classroom" student-story transcript grid
 * for a coding bootcamp / career-school landing page. An asymmetric header
 * (left-aligned heading, mono transcript-count tag on the right) above a
 * staggered 2/3-column grid of sharp hairline cards styled as session logs:
 * each card opens with a hairline-divided mono header row (`log 01` index +
 * an `[ok]` status glyph), then the pull-quote, and a mono uppercase
 * career-transition line under the graduate's name behind a hairline rule.
 * Alternate cards offset downward on desktop; a giant ghost `>>` watermark
 * bleeds behind the grid. Use to build social proof for bootcamps, dev
 * academies, or career-switch programs by showcasing graduate success
 * stories.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'
export const BootcampTestimonials = defineCapsule({
  name: 'BootcampTestimonials',
  description:
    "Terminal-styled student-story transcript grid for a coding bootcamp / career-school landing page: asymmetric left-aligned header with a mono transcript-count tag, above a staggered 2/3-column grid of sharp hairline session-log cards. Each card has a hairline-divided mono header row ('log 01' index + '[ok]' status glyph), the pull-quote, and the graduate's name with a mono uppercase career-transition line behind a hairline rule; alternate cards offset downward on desktop over a giant ghost '>>' watermark. Use to build social proof for bootcamps, dev academies, or career-switch programs by showcasing graduate success stories.",
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
      <section
        className={cn(
          'relative overflow-hidden bg-muted/40 py-16 lg:py-24',
          props.className,
        )}
      >
        <Watermark className="right-0 top-6 font-mono text-[8rem] sm:text-[14rem]">
          {'>>'}
        </Watermark>
        <Container className="relative">
          <div className="mb-10 grid items-end gap-4 lg:mb-14 lg:grid-cols-12">
            <SectionHeading
              align="left"
              eyebrow={testimonialsEyebrow}
              title={testimonialsHeading}
              subtitle={testimonialsDesc}
              className="max-w-2xl gap-0 lg:col-span-8"
              eyebrowClassName="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
              titleClassName="mb-4 text-3xl font-bold tracking-tight sm:text-5xl"
              subtitleClassName="text-base text-muted-foreground sm:text-lg"
            />
            <MonoTag tone="faint" className="lg:col-span-4 lg:justify-self-end">
              [ {String(testimonialItems.length).padStart(2, '0')} transcripts ]
            </MonoTag>
          </div>
          <TestimonialGrid columns={3}>
            {testimonialItems.map((t, i) => {
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
                <TestimonialCard
                  key={__iv__.name}
                  className={cn(
                    'gap-3 rounded-none border-border bg-card p-6 transition-[border-color,transform] duration-150 hover:-translate-y-0.5 hover:border-primary/50 motion-reduce:transform-none',
                    i % 2 === 1 && 'md:max-lg:translate-y-6',
                    i % 3 === 1 && 'lg:translate-y-8',
                  )}
                >
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <MonoTag tone="muted">
                      log {String(i + 1).padStart(2, '0')}
                    </MonoTag>
                    <span
                      aria-hidden="true"
                      className="font-mono text-[11px] text-primary"
                    >
                      [ok]
                    </span>
                  </div>
                  <TestimonialQuote className="text-sm leading-relaxed">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="mt-auto flex-col items-start gap-1 border-t border-border pt-3">
                    <TestimonialName className="text-sm font-semibold tracking-tight">
                      {__iv__.name}
                    </TestimonialName>
                    {(__iv__.role || __iv__.company || __iv__.meta) && (
                      <TestimonialMeta className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
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
