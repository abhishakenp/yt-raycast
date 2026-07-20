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
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'

export const WebinarFaq = defineCapsule({
  name: 'WebinarFaq',
  description:
    'Kinetic-event FAQ for a webinar or virtual event on an asymmetric 5/7 split: a left header (mono index eyebrow + oversized heading + lede) beside a hairline collapsed-border list of native <details>/<summary> disclosures. Each row leads with a mono tabular numeral, shows a token-styled question with a chevron that expands to reveal the answer, and handles cost, recording, timing, and access objections. A giant ghost watermark bleeds behind. Use to remove last-mile hesitation before registration on a webinar landing page.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
    items: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'FAQ'
    const heading = props.heading ?? 'Frequently asked questions'
    const subheading =
      props.subheading ??
      'Everything you might want to know before you register.'
    const items = props.items?.length
      ? props.items
      : [
          {
            question: 'How much does it cost to attend?',
            answer:
              'Nothing — the live session is completely free. We just ask that you register so we can send you the join link and reminders.',
          },
          {
            question: 'Will the session be recorded?',
            answer:
              "Yes. Everyone who registers receives the full recording by email afterward, so you won't miss anything if you can't make it live.",
          },
          {
            question: 'How long is the webinar?',
            answer:
              'Plan for about 60 minutes — roughly 45 minutes of content plus 15 minutes of live Q&A at the end.',
          },
          {
            question: 'Can I ask questions during the event?',
            answer:
              "Absolutely. You can drop questions in the chat at any time, and we'll answer as many as possible during the dedicated Q&A.",
          },
          {
            question: "What if I register but can't attend live?",
            answer:
              "No problem. Register anyway and we'll send you the recording and the slides so you can watch on your own schedule.",
          },
        ]

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background py-20 text-foreground lg:py-28',
          props.className,
        )}
      >
        <Watermark className="-left-6 top-10 text-[7rem] leading-none sm:text-[12rem] lg:text-[16rem]">
          FAQ
        </Watermark>
        <Container size="lg" className="relative">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              <SectionHeading
                align="left"
                eyebrow={`04 / ${eyebrow}`}
                title={heading}
                subtitle={subheading}
                className="gap-4 lg:sticky lg:top-28"
                eyebrowClassName="text-muted-foreground"
                titleClassName="text-4xl font-extrabold tracking-tight sm:text-5xl"
                subtitleClassName="text-lg text-muted-foreground"
              />
            </div>
            <div className="lg:col-span-7">
              <FaqAccordion variant="divided" className="border-t-foreground">
                {items.map((item, i) => (
                  <FaqItem
                    key={`${item.question}-${i}`}
                    variant="divided"
                    className="text-card-foreground"
                  >
                    <FaqQuestion className="gap-4">
                      <span className="flex items-baseline gap-3">
                        <span
                          aria-hidden="true"
                          className="font-mono text-sm tabular-nums text-muted-foreground/50"
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="font-bold tracking-tight">
                          {item.question}
                        </span>
                      </span>
                      <FaqQuestionIcon />
                    </FaqQuestion>
                    <FaqAnswer className="mt-3 pl-8 text-sm leading-7">
                      {item.answer}
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
