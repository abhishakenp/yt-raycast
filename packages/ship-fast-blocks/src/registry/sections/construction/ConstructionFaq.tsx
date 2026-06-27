import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * ConstructionFaq — six-item FAQ accordion for a construction / general
 * contractor page. A centered section heading above a responsive stack of
 * expandable details cards with animated chevron icons. Use as a common
 * questions section for construction firms, contractors, builders, or any
 * service business that needs to address client concerns transparently.
 * Renders fully with no props via baked-in defaults.
 */
export const ConstructionFaq = defineCapsule({
  name: 'ConstructionFaq',
  description:
    'Six-item FAQ accordion for a construction / general contractor page: a centered section heading above a responsive stack of expandable details cards with animated chevron icons. Use as a common questions section for construction firms, contractors, builders, or any service business that needs to address client concerns transparently.',
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
      <section className={cn('bg-muted py-20 lg:py-28', props.className)}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {eyebrow}
            </span>
            <h2 className="mb-4 mt-3 text-3xl font-bold text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <details
                key={item.q}
                className="group rounded-xl bg-card shadow-sm"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                  <h3 className="pr-4 text-lg font-semibold text-foreground">
                    {item.q}
                  </h3>
                  <span className="transition-transform group-open:rotate-180">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-muted-foreground"
                      aria-hidden="true"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 leading-relaxed text-muted-foreground">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
