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
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * ContactFaq — editorial split FAQ ledger for a contact / support page.
 * Asymmetric 4:8 grid: a sticky left rail with a mono "Index / NN" micro-label,
 * left-aligned heading and description over a giant ghost "?" watermark; on the
 * right a single-column collapsed-border ledger of questions, each row led by
 * an aria-hidden mono index numeral with a chevron that rotates as the answer
 * animates open/closed. Hairline dividers, sharp edges, tokens only. Use to
 * surface common questions before a visitor reaches out on SaaS, agency, or
 * startup contact pages. Renders fully with no props via baked-in defaults.
 */
export const ContactFaq = defineCapsule({
  name: 'ContactFaq',
  description:
    'Editorial split FAQ ledger for a contact / support page: an asymmetric 4:8 grid with a sticky left rail (mono "Index / NN" micro-label, left-aligned heading + description, giant ghost "?" watermark) and a right-hand collapsed-border ledger of expandable questions, each led by a mono index numeral with a rotating chevron and animated answer. Hairline dividers, sharp edges, tokens only. Use to surface common questions before a visitor reaches out on SaaS, agency, or startup contact pages.',
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
      <section
        className={cn(
          'relative overflow-hidden bg-background py-14 sm:py-20 lg:py-24',
          props.className,
        )}
      >
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            {/* Sticky heading rail */}
            <div className="relative lg:sticky lg:top-24 lg:col-span-4 lg:self-start">
              <Watermark className="-top-10 -left-6 font-serif text-[10rem] sm:text-[12rem]">
                ?
              </Watermark>
              <div className="relative flex items-center gap-4">
                <MonoTag aria-hidden="true" className="text-foreground">
                  Index / {String(items.length).padStart(2, '0')}
                </MonoTag>
                <span aria-hidden="true" className="h-px flex-1 bg-border" />
              </div>
              <SectionHeading
                align="left"
                title={heading}
                subtitle={description}
                className="relative mt-5 gap-0"
                titleClassName="mb-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
                subtitleClassName="max-w-md text-base leading-relaxed text-muted-foreground"
              />
            </div>

            {/* Collapsed-border question ledger */}
            <FaqAccordion className="border-t border-border lg:col-span-8">
              {items.map((item, i) => {
                const open = openFaq === i
                return (
                  <FaqItem
                    key={item.question}
                    asChild
                    className="rounded-none border-0 border-b border-border bg-transparent px-0 py-6"
                  >
                    <div>
                      <div className="grid grid-cols-[auto_1fr] items-baseline gap-4 sm:gap-6">
                        <span
                          aria-hidden="true"
                          className={cn(
                            'font-mono text-[11px] tracking-[0.2em] transition-colors',
                            open ? 'text-primary' : 'text-muted-foreground/60',
                          )}
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <FaqQuestion
                            asChild
                            className="w-full text-left text-base font-semibold leading-snug tracking-tight sm:text-lg"
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
                                    ? 'rotate-180 text-foreground'
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
                              <p className="min-h-0 max-w-2xl text-[0.95rem] leading-[1.7] text-muted-foreground">
                                {item.answer}
                              </p>
                            </div>
                          </FaqAnswer>
                        </div>
                      </div>
                    </div>
                  </FaqItem>
                )
              })}
            </FaqAccordion>
          </div>
        </Container>
      </section>
    )
  },
})
