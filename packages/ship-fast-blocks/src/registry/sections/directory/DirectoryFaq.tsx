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
import { MonoTag } from '#/section-kit/Decor.tsx'

import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * DirectoryFaq — index-style Q&A ledger for a local-business directory. A
 * paper section split asymmetrically 4/8: left, a sticky serif heading with
 * description and a mono "Reader questions" tag; right, a hairline-divided
 * stack of native disclosure rows (details/summary), each led by a mono Q
 * index numeral with the question in bold and a plus icon that rotates open,
 * expanding to a muted answer paragraph indented under the numeral. Static,
 * no links. Use to answer listing, review-verification, pricing, and coverage
 * questions on local directories, find-a-service platforms, or
 * review-and-discovery sites.
 */
export const DirectoryFaq = defineCapsule({
  name: 'DirectoryFaq',
  description:
    'Index-style Q&A ledger for a local-business DIRECTORY: a paper section split asymmetrically 4/8 — left, a sticky serif heading with description and a mono Reader-questions tag; right, a hairline-divided stack of native disclosure rows (details/summary), each led by a mono Q index numeral with the question in bold and a plus icon that rotates open, expanding to a muted answer paragraph indented under the numeral. Static, no links. Use to answer listing, review-verification, pricing, and coverage questions on local directories, business-listing marketplaces, find-a-service platforms, or review-and-discovery sites.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description under the heading. */
    description: z.string().optional(),
    /** FAQ entries (question + answer). */
    items: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Frequently Asked Questions'
    const description =
      props.description ?? 'Everything you need to know about LocalFindr'
    const items = props.items?.length
      ? props.items
      : [
          {
            question: 'How do I list my business on LocalFindr?',
            answer:
              'Simply click "List Your Business" and create a free account. You\'ll be guided through adding your business name, address, contact information, category, and photos. Your listing goes live immediately after verification.',
          },
          {
            question: 'Is it really free to list my business?',
            answer:
              'Yes! Our Basic plan is completely free and includes all essential features: business listing, contact information, and customer reviews. Premium plans offer enhanced visibility and additional features for businesses looking to grow.',
          },
          {
            question: 'How are reviews verified?',
            answer:
              'We use multiple verification methods including email confirmation, phone verification, and activity tracking to ensure reviews come from real customers. Our team also monitors for suspicious activity and removes fake reviews promptly.',
          },
          {
            question: 'Can I respond to customer reviews?',
            answer:
              'Absolutely! Business owners can respond to all reviews publicly to thank customers or address concerns. You can also contact reviewers privately through our messaging system to resolve issues.',
          },
          {
            question: 'What cities do you cover?',
            answer:
              "LocalFindr is currently available in 156 cities across the United States, Canada, and the UK. We're expanding rapidly—if your city isn't listed yet, you can request it and we'll prioritize adding it.",
          },
        ]

    return (
      <section className={cn('bg-background py-16 lg:py-24', props.className)}>
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-24">
                <SectionHeading
                  align="left"
                  title={heading}
                  subtitle={description}
                  className="gap-3"
                  titleClassName="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
                  subtitleClassName="text-muted-foreground"
                />
                <MonoTag
                  tone="faint"
                  aria-hidden="true"
                  className="mt-6 block border-t border-border pt-4"
                >
                  Reader questions · {String(items.length).padStart(2, '0')}{' '}
                  filed
                </MonoTag>
              </div>
            </div>

            <div className="lg:col-span-8">
              <FaqAccordion variant="divided">
                {items.map((item, i) => (
                  <FaqItem key={item.question} variant="divided">
                    <FaqQuestion className="items-baseline gap-4 py-1">
                      <span
                        aria-hidden="true"
                        className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground"
                      >
                        Q.{String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="flex-1 text-base font-semibold tracking-tight text-foreground sm:text-lg">
                        {item.question}
                      </span>
                      <FaqQuestionIcon variant="plus" className="self-center" />
                    </FaqQuestion>
                    <FaqAnswer asChild className="pl-11 pt-3 sm:pl-12">
                      <div>{item.answer}</div>
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
