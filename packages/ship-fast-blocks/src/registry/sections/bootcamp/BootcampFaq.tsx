import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  FaqAccordion,
  FaqAnswer,
  FaqItem,
  FaqQuestion,
  FaqQuestionIcon,
} from '#/section-kit/FaqAccordion.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'

/**
 * BootcampFaq — "Terminal Classroom" man-page FAQ for a coding bootcamp /
 * career-school landing page. An asymmetric 4:8 split: the left rail holds a
 * left-aligned mono-labeled header, a decorative `$ man bootcamp` prompt
 * line, and a giant ghost `?` watermark; the right column stacks native
 * <details> disclosure rows divided by hairlines — each summary leads with a
 * mono primary index numeral (`01`), the bold question, and a plus icon that
 * rotates to an × on open, with the muted answer indented beneath the
 * numeral gutter. No links. Use to answer common questions about programs,
 * pricing, time commitment, prerequisites, job guarantees and remote
 * options.
 */
export const BootcampFaq = defineCapsule({
  name: 'BootcampFaq',
  description:
    "Terminal-styled man-page FAQ for a coding bootcamp / career-school landing page: asymmetric 4:8 split with a left rail (mono-labeled header, decorative '$ man bootcamp' prompt, giant ghost '?' watermark) beside hairline-divided native details disclosure rows. Each summary leads with a mono primary index numeral, the bold question, and a plus icon rotating to an × on open; the muted answer indents beneath the numeral gutter. No links. Use to answer common questions about programs, pricing, time commitment, prerequisites, job guarantees and remote options.",
  props: z.object({
    /** Section eyebrow label. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** FAQ items: question + answer. */
    items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const faqEyebrow = props.eyebrow ?? 'FAQ'
    const faqHeading = props.heading ?? 'Common questions answered'
    const faqDesc =
      props.description ??
      'Everything you need to know about the bootcamp experience.'
    const faqItems = props.items?.length
      ? props.items
      : [
          {
            q: 'Do I need prior programming experience?',
            a: 'No prior experience is required. Our curriculum is designed for absolute beginners. We look for logical thinkers who are motivated to learn. Many of our most successful graduates came from completely non-technical backgrounds like teaching, nursing, marketing, and construction.',
          },
          {
            q: 'What is the time commitment?',
            a: 'The full-time program requires 40+ hours per week for 16 weeks — Monday through Friday, 9am to 5pm. We also offer a part-time option (20 hours/week for 32 weeks) for those who need to continue working. Both programs deliver identical curriculum and outcomes.',
          },
          {
            q: 'How does the job guarantee work?',
            a: 'If you complete the program, participate in career services, and don\'t receive a qualifying job offer within 6 months, we\'ll refund your tuition in full. A "qualifying offer" means a full-time software development position paying at least $50,000 annually. This guarantee reflects our confidence in our curriculum and career support.',
          },
          {
            q: 'Is the program remote or in-person?',
            a: "Our program is fully remote with live, interactive instruction. You'll attend daily standups, pair programming sessions, and mentor meetings via video call. This format allows us to bring together students and mentors from around the world while letting you learn from home.",
          },
          {
            q: 'What kind of computer do I need?',
            a: "You'll need a Mac, Windows, or Linux laptop with at least 8GB of RAM (16GB recommended) and a reliable internet connection. We provide all software licenses and tools you'll need during the program.",
          },
          {
            q: 'Are there scholarships available?',
            a: 'Yes, we offer $2,000 scholarships for underrepresented groups in tech, including women, people of color, LGBTQ+ individuals, veterans, and people with disabilities. These scholarships are stackable with our payment plans. Contact our admissions team for details.',
          },
        ]

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background py-16 lg:py-24',
          props.className,
        )}
      >
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="relative lg:col-span-4">
              <Watermark className="-left-6 -top-10 font-mono text-[10rem] sm:text-[14rem]">
                ?
              </Watermark>
              <SectionHeading
                align="left"
                eyebrow={faqEyebrow}
                title={faqHeading}
                subtitle={faqDesc}
                className="relative gap-0"
                eyebrowClassName="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
                titleClassName="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
                subtitleClassName="text-base text-muted-foreground sm:text-lg"
              />
              <p
                aria-hidden="true"
                className="relative mt-6 font-mono text-sm text-muted-foreground"
              >
                <span className="text-primary">$</span> man bootcamp
              </p>
            </div>
            <div className="lg:col-span-8">
              <FaqAccordion variant="divided">
                {faqItems.map((item, i) => (
                  <FaqItem key={item.q} variant="divided">
                    <FaqQuestion className="items-baseline gap-4">
                      <span
                        aria-hidden="true"
                        className="shrink-0 font-mono text-sm tabular-nums text-primary"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="flex-1 font-semibold tracking-tight">
                        {item.q}
                      </span>
                      <FaqQuestionIcon
                        variant="plus"
                        className="self-center text-foreground"
                      />
                    </FaqQuestion>
                    <FaqAnswer asChild className="pl-9 pt-3">
                      <div>
                        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                          {item.a}
                        </p>
                      </div>
                    </FaqAnswer>
                  </FaqItem>
                ))}
              </FaqAccordion>
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
