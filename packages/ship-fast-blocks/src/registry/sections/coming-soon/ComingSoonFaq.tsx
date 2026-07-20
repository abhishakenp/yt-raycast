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
 * ComingSoonFaq — kinetic Q&A index for a "launching soon" / waitlist
 * pre-launch landing page. An asymmetric 4:8 split: a left rail with a big
 * tight-tracked heading, lead paragraph, and mono "[ INDEX ]" meta (sticky on
 * desktop), beside a hairline-divided stack of native details/summary
 * accordion items — each row led by a mono index numeral ("Q.01"), the
 * question in bold uppercase-tracked type, a plus icon that rotates on open,
 * and the answer in relaxed body text. No links or external dependencies. Use
 * as the FAQ / questions section on SaaS waitlists, app pre-launch pages, or
 * beta sign-up landers. Renders fully with no props via five baked-in default
 * Q&As.
 */
export const ComingSoonFaq = defineCapsule({
  name: 'ComingSoonFaq',
  description:
    "Kinetic Q&A index for a 'launching soon' / waitlist pre-launch landing page: asymmetric 4:8 split with a left rail (big tight-tracked heading, lead paragraph, mono meta; sticky on desktop) beside a hairline-divided stack of native details/summary accordion items — each row led by a mono index numeral ('Q.01'), a bold question heading, a plus icon that rotates on open, and a relaxed body-text answer. No links. Use as the FAQ / questions section on SaaS waitlists, app pre-launch pages, or beta sign-up landers.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** FAQ items: question + answer pairs. */
    items: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Frequently asked questions'
    const description =
      props.description ?? 'Everything you need to know about Nexus'
    const items = props.items?.length
      ? props.items
      : [
          {
            question: 'When will Nexus officially launch?',
            answer:
              'Nexus officially launches on March 15, 2025. Waitlist members will receive early access starting March 1st, two weeks before the public launch. Early access includes exclusive onboarding sessions with our founding team.',
          },
          {
            question:
              'Can I import data from Notion, Confluence, or other tools?',
            answer:
              'Yes. We offer one-click import from Notion, Confluence, Google Docs, Dropbox Paper, and more. Our import engine preserves formatting, comments, and file attachments. Enterprise plans include assisted migration with a dedicated specialist.',
          },
          {
            question: 'Is there a free plan available?',
            answer:
              "Absolutely. Our Starter plan is free forever for up to 5 team members. It includes 10GB storage, core features, and community support. It's perfect for small teams, personal projects, or trying Nexus before committing.",
          },
          {
            question: 'How does the 50% early access discount work?',
            answer:
              'Waitlist members who sign up before launch receive 50% off any paid plan for their first 6 months. This discount applies to both monthly and annual billing. The discount is automatically applied when you upgrade from your free trial.',
          },
          {
            question: 'What security certifications does Nexus have?',
            answer:
              'Nexus is SOC 2 Type II certified, GDPR compliant, and HIPAA ready. We use end-to-end encryption for all data at rest and in transit. Enterprise customers can opt for dedicated infrastructure with custom data residency requirements.',
          },
        ]

    return (
      <section
        className={cn(
          'w-full px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28 xl:px-12',
          props.className,
        )}
      >
        <Container size="lg">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            {/* Left rail: heading + lead + mono meta, sticky on desktop. */}
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-28">
                <SectionHeading
                  align="left"
                  title={heading}
                  subtitle={description}
                  className="gap-4"
                  titleClassName="text-4xl font-extrabold uppercase leading-[0.92] tracking-tighter text-foreground sm:text-5xl"
                  subtitleClassName="max-w-sm text-base text-muted-foreground"
                />
                <p
                  aria-hidden="true"
                  className="mt-6 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground/60"
                >
                  [ index ] {String(items.length).padStart(2, '0')} entries
                </p>
              </div>
            </div>

            {/* Hairline-divided Q index. */}
            <FaqAccordion
              variant="divided"
              className="border-y-2 border-foreground lg:col-span-8"
            >
              {items.map((item, i) => (
                <FaqItem key={item.question} variant="divided" className="py-0">
                  <FaqQuestion className="items-baseline gap-4 py-5 sm:gap-6 sm:py-6">
                    <span
                      aria-hidden="true"
                      className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground tabular-nums"
                    >
                      Q.{String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="flex-1 pr-2 text-base font-bold tracking-tight text-foreground sm:text-lg">
                      {item.question}
                    </h3>
                    <FaqQuestionIcon
                      variant="plus"
                      className="self-center text-foreground"
                    />
                  </FaqQuestion>
                  <FaqAnswer
                    asChild
                    className="pb-6 pl-0 pr-8 text-sm leading-relaxed sm:pl-[4.5rem]"
                  >
                    <div>{item.answer}</div>
                  </FaqAnswer>
                </FaqItem>
              ))}
            </FaqAccordion>
          </div>
        </Container>
      </section>
    )
  },
})
