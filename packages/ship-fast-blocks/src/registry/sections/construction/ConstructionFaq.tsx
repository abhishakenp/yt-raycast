import { defineCapsule } from '#/capsules/openui.ts'

import {
  FaqAccordion,
  FaqAnswer,
  FaqItem,
  FaqQuestion,
  FaqQuestionIcon,
} from '#/section-kit/FaqAccordion.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * ConstructionFaq — industrial-brutalist site-manual Q&A for a construction /
 * general contractor page. An asymmetric 4/8 split: the left rail carries a
 * mono meta rule (primary marker + tabular entry count), a left-aligned
 * extrabold uppercase heading, and a token-built hazard bar; the right column
 * stacks hairline-ruled expandable entries, each led by a mono primary index
 * numeral beside the question with an animated chevron. Use as a common
 * questions section for construction firms, contractors, builders, or any
 * service business that needs to address client concerns transparently.
 * Renders fully with no props via baked-in defaults.
 */
export const ConstructionFaq = defineCapsule({
  name: 'ConstructionFaq',
  description:
    'Industrial-brutalist site-manual FAQ for a construction / general contractor page: an asymmetric 4/8 split with a left rail (mono meta rule with primary marker + tabular entry count, extrabold uppercase heading, token-built hazard bar) beside a right column of hairline-ruled expandable entries, each led by a mono primary index numeral with an animated chevron. Use as a common questions section for construction firms, contractors, builders, or any service business that needs to address client concerns transparently.',
  props: z.object({
    /** Section eyebrow label. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** FAQ items: question + answer pairs. */
    items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'FAQ'
    const heading = props.heading ?? 'Common questions'
    const description =
      props.description ??
      'Everything you need to know about working with BuiltRight.'
    const items = props.items?.length
      ? props.items
      : [
          {
            q: 'How long does a typical project take?',
            a: "Project timelines vary significantly based on scope. Kitchen renovations typically take 6-8 weeks, custom homes 12-18 months, and commercial projects 18-36 months. During your consultation, we'll provide a detailed timeline specific to your project.",
          },
          {
            q: 'Do you offer financing options?',
            a: 'Yes, we partner with several lending institutions to offer construction financing options for qualified clients. We also work with your own lender if preferred. Our team can help you explore financing options during the planning phase.',
          },
          {
            q: 'Are you licensed and insured?',
            a: "Absolutely. We are fully licensed in Washington (License #BUILDRR12345) and Oregon (CCB License No. 123456), carry comprehensive general liability insurance ($5M), and maintain workers' compensation coverage for all employees. Certificates available upon request.",
          },
          {
            q: 'What areas do you serve?',
            a: 'We primarily serve the greater Seattle and Portland metropolitan areas, including King, Pierce, Snohomish, Multnomah, Washington, and Clackamas counties. For larger commercial projects, we operate throughout Washington and Oregon.',
          },
          {
            q: 'How do you handle project changes?',
            a: 'We understand changes happen. All change orders are documented in writing with detailed pricing and timeline impact before work proceeds. We use a digital project management system that keeps you informed of any changes in real-time.',
          },
          {
            q: 'Do you offer warranties?',
            a: 'Yes, we stand behind our work with a comprehensive warranty program: 1-year workmanship warranty on all projects, 10-year structural warranty on new construction, and we pass through all manufacturer warranties on materials and fixtures.',
          },
        ]

    return (
      <section className={cn('bg-muted/40 py-16 lg:py-24', props.className)}>
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <div className="mb-6 flex items-center gap-3 border-b border-foreground/15 pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                <span aria-hidden="true" className="size-2 bg-primary" />
                {eyebrow}
                <span className="ml-auto tabular-nums">
                  {String(items.length).padStart(2, '0')} entries
                </span>
              </div>
              <SectionHeading
                align="left"
                title={heading}
                subtitle={description}
                className="gap-0"
                titleClassName="mb-4 text-3xl font-extrabold uppercase tracking-tight text-foreground sm:text-4xl"
                subtitleClassName="text-lg text-muted-foreground"
              />
              <span
                aria-hidden="true"
                className="mt-8 hidden h-2 w-24 bg-[repeating-linear-gradient(-45deg,currentColor_0,currentColor_8px,transparent_8px,transparent_16px)] text-primary lg:block"
              />
            </div>

            <div className="lg:col-span-8">
              <FaqAccordion className="space-y-0 border-t-2 border-foreground">
                {items.map((item, i) => (
                  <FaqItem
                    key={item.q}
                    className="rounded-none border-x-0 border-b border-t-0 border-border bg-transparent shadow-none"
                  >
                    <FaqQuestion className="items-baseline gap-4 px-0 py-5 sm:py-6">
                      <span
                        aria-hidden="true"
                        className="shrink-0 font-mono text-[11px] font-bold uppercase tracking-[0.2em] tabular-nums text-primary"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <h3 className="flex-1 pr-4 text-base font-extrabold uppercase tracking-tight text-foreground sm:text-lg">
                        {item.q}
                      </h3>
                      <FaqQuestionIcon />
                    </FaqQuestion>
                    <FaqAnswer
                      asChild
                      className="px-0 pb-6 pl-8 text-muted-foreground sm:pl-9"
                    >
                      <div>{item.a}</div>
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
