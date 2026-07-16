import { defineCapsule } from '#/capsules/openui.ts'
import { useState } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  FaqAccordion,
  FaqAnswer,
  FaqItem,
  FaqQuestion,
  FaqQuestionIcon,
} from '#/section-kit/FaqAccordion.tsx'

/**
 * ContactFaq — two-column FAQ accordion for a contact / support page.
 * A centered heading + description followed by a responsive two-column grid of
 * expandable question cards. Each card animates its answer open/closed with a
 * chevron rotation. Use to surface common questions before a visitor reaches
 * out on SaaS, agency, or startup contact pages. Renders fully with no props via
 * baked-in defaults.
 */
export const ContactFaq = defineCapsule({
  name: 'ContactFaq',
  description:
    'Two-column FAQ accordion for a contact / support page: a centered heading + description followed by a responsive two-column grid of expandable question cards, each animating its answer open/closed with a chevron rotation. Use to surface common questions before a visitor reaches out on SaaS, agency, or startup contact pages.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Subtitle paragraph under the heading. */
    description: z.string().optional(),
    /** FAQ items: question + answer pairs. */
    items: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const [openFaq, setOpenFaq] = useState<number | null>(null)

    const heading = props.heading ?? 'Frequently Asked Questions'
    const description =
      props.description ??
      "Everything you need to know before reaching out. Can't find the answer you're looking for? Send us a message."
    const items = props.items?.length
      ? props.items
      : [
          {
            question: 'What is the typical response time?',
            answer:
              'We aim to respond to all inquiries within 24 hours during business days. For enterprise support, response times are under 2 hours.',
          },
          {
            question: 'Do you offer custom pricing?',
            answer:
              'Yes. We tailor packages based on team size, usage volume, and feature requirements. Contact sales for a personalized quote.',
          },
          {
            question: 'Can I schedule a product demo?',
            answer:
              'Absolutely. Use the form on this page or email us directly. We offer live demos with screen sharing and Q&A every Tuesday and Thursday.',
          },
          {
            question: 'Where are your servers located?',
            answer:
              'Our infrastructure runs on a global edge network with core compute in US-East, EU-West, and APAC regions. Data residency options are available.',
          },
          {
            question: 'Do you provide SLA guarantees?',
            answer:
              'Yes. Business plans include a 99.99% uptime SLA with credit-backed guarantees. Enterprise plans can negotiate custom SLAs.',
          },
          {
            question: 'How do I report a security issue?',
            answer:
              'Please send sensitive reports to security@orbitdigital.co using our PGP key. We participate in responsible disclosure and offer bug bounties.',
          },
        ]

    return (
      <section className={cn('mt-20 mb-24', props.className)}>
        <div className="mb-11 text-center">
          <h2 className="mb-2.5 text-[1.9rem] font-bold text-foreground">
            {heading}
          </h2>
          <p className="mx-auto max-w-[480px] text-muted-foreground">
            {description}
          </p>
        </div>
        <FaqAccordion className="grid gap-4 md:grid-cols-2">
          {items.map((item, i) => {
            const open = openFaq === i
            return (
              <FaqItem
                key={item.question}
                asChild
                className={cn(
                  'px-6 py-5 transition-colors hover:border-border/60',
                  open ? 'bg-muted/40' : 'bg-card',
                )}
              >
                <div>
                  <FaqQuestion
                    asChild
                    className="w-full text-left text-[0.98rem] font-semibold leading-[1.4]"
                  >
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setOpenFaq(open ? null : i)}
                    >
                      {item.question}
                      <FaqQuestionIcon
                        className={cn(
                          'shrink-0 transition-transform',
                          open
                            ? 'rotate-180 text-primary'
                            : 'text-muted-foreground',
                        )}
                      />
                    </button>
                  </FaqQuestion>
                  <FaqAnswer
                    asChild
                    className={cn(
                      'grid overflow-hidden transition-all duration-300',
                      open
                        ? 'grid-rows-[1fr] pt-3 opacity-100'
                        : 'grid-rows-[0fr] opacity-0',
                    )}
                  >
                    <div>
                      <p className="min-h-0 text-[0.92rem] leading-[1.7] text-muted-foreground">
                        {item.answer}
                      </p>
                    </div>
                  </FaqAnswer>
                </div>
              </FaqItem>
            )
          })}
        </FaqAccordion>
      </section>
    )
  },
})
