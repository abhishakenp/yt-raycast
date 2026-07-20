import { defineCapsule } from '#/capsules/openui.ts'

import {
  FaqAccordion,
  FaqAnswer,
  FaqItem,
  FaqQuestion,
  FaqQuestionIcon,
} from '#/section-kit/FaqAccordion.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'

import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * NewsletterFaq — newsprint-lite Q&A ledger for an editorial newsletter. An
 * asymmetric 4/8 split: a sticky left rail holds a hairline meta rule (a primary
 * square + mono "F.A.Q." label) above a serif heading; the right column is a
 * collapsed-border divided accordion of native <details> rows, each summary
 * pairing a mono "Q.0X" index numeral with the serif question and a chevron that
 * rotates open to reveal a relaxed muted answer. Clean paper-toned surface with
 * restrained newspaper structure, no JavaScript required. Use to answer common
 * subscription questions (cadence, archives, refunds, authorship, team plans) for
 * newsletters, publications, blogs, or content creators. Renders fully with no
 * props via baked-in defaults.
 */
export const NewsletterFaq = defineCapsule({
  name: 'NewsletterFaq',
  description:
    'Newsprint-lite Q&A ledger for an editorial newsletter: an asymmetric 4/8 split with a sticky left rail holding a hairline meta rule (a primary square + mono "F.A.Q." label) above a serif heading, and a right column of collapsed-border divided native details rows where each summary pairs a mono "Q.0X" index numeral with the serif question and a chevron that rotates open to reveal a relaxed muted answer. Clean paper-toned surface with restrained newspaper structure, no JavaScript required. Use to answer common subscription questions (cadence, archives, refunds, authorship, team plans) for newsletters, publications, blogs, or content creators.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Question + answer rows. */
    items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Questions & Answers'
    const items = props.items?.length
      ? props.items
      : [
          {
            q: 'How often do you publish?',
            a: "Every Sunday morning, usually around 8 AM EST. Occasionally I'll send a mid-week issue if there's breaking news worth addressing, but I stick to the weekly schedule to respect your inbox.",
          },
          {
            q: 'Can I access past issues?',
            a: 'Free subscribers get access to the last 3 months of issues. Paid subscribers can browse the complete archive—all 156 issues since we started in 2023. Every issue is tagged and searchable.',
          },
          {
            q: 'Do you offer refunds?',
            a: "Yes. If you're not satisfied with your paid subscription, contact me within 30 days for a full refund—no questions asked. After 30 days, you can cancel anytime and keep access until your billing period ends.",
          },
          {
            q: 'Who writes this newsletter?',
            a: "Hi, I'm Sarah Mitchell. I'm a former product manager at Stripe who left to write full-time. I've been publishing The Quiet Observer since 2023, and I'm based in Brooklyn, New York.",
          },
          {
            q: 'How do team subscriptions work?',
            a: 'Team subscriptions give everyone at your company access to paid features, including the full archive, audio versions, and our private Discord. Pricing starts at $50/month for up to 10 team members. Get in touch for larger teams.',
          },
        ]

    return (
      <section className={cn('py-16 md:py-24 lg:py-28', props.className)}>
        <Container size="lg">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-28">
                <div className="mb-5 flex items-center gap-3 border-b border-border pb-4">
                  <MonoTag className="flex items-center gap-3 tracking-[0.25em]">
                    <span aria-hidden="true" className="size-1.5 bg-primary" />
                    F.A.Q.
                  </MonoTag>
                </div>
                <h2 className="font-serif text-3xl font-medium tracking-tight text-foreground text-balance sm:text-4xl">
                  {heading}
                </h2>
              </div>
            </div>

            <div className="lg:col-span-8">
              <FaqAccordion variant="divided" className="border-t-0">
                {items.map((item, i) => (
                  <FaqItem
                    key={item.q}
                    variant="divided"
                    className="text-card-foreground"
                  >
                    <FaqQuestion className="items-start py-1">
                      <span className="flex items-start gap-4">
                        <span
                          aria-hidden="true"
                          className="mt-0.5 shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-primary tabular-nums"
                        >
                          Q.{String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="font-serif text-lg font-medium text-foreground">
                          {item.q}
                        </span>
                      </span>
                      <FaqQuestionIcon />
                    </FaqQuestion>
                    <FaqAnswer asChild className="pl-11 pt-3">
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
