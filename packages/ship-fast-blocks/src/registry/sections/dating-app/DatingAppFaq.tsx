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
 * DatingAppFaq — playful-geometric asymmetric FAQ ledger for a dating /
 * matchmaking app. A 4:8 split: the left rail holds a mono "[ 06 ] questions"
 * micro-label with a rounded-full primary dot, the extrabold heading, and the
 * supporting line (which interpolates the brand name); the right column is a
 * hairline-divided stack of native <details> rows, each summary pairing a mono
 * tabular index numeral with the bold question and a rounded-full bordered
 * plus chip that rotates open to reveal the answer. Use to answer common
 * questions — safety, matching, privacy, pricing — for dating apps, singles
 * platforms, or any consumer product. Renders fully with no props via baked-in
 * "HeartLink" FAQ defaults.
 */
export const DatingAppFaq = defineCapsule({
  name: 'DatingAppFaq',
  description:
    'Playful-geometric asymmetric FAQ ledger for a dating / matchmaking app: a 4:8 split with a left rail (mono question-count micro-label with rounded-full primary dot, extrabold heading, supporting line interpolating the brand name) beside a hairline-divided stack of native <details> rows whose summaries pair a mono tabular index numeral with the bold question and a rounded-full bordered plus chip that rotates open to reveal the answer. Use to answer common questions — safety, matching, privacy, pricing — for dating apps, singles platforms, or any consumer product.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    /** Brand / app name used in the default supporting line. */
    brand: z.string().optional(),
    items: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'HeartLink'
    const faqHeading = props.heading ?? 'Frequently asked questions'
    const faqDesc =
      props.description ?? `Everything you need to know about ${brand}.`
    const faqItems = props.items?.length
      ? props.items
      : [
          {
            question: 'Is HeartLink really free?',
            answer:
              'Yes! You can match, chat, and meet people completely free. Our Premium and Elite plans unlock additional features like unlimited likes and seeing who liked you, but the core experience is 100% free.',
          },
          {
            question: 'How does the matching algorithm work?',
            answer:
              "Our AI analyzes 32 compatibility factors including your values, lifestyle, interests, communication style, and relationship goals. The more you use the app, the smarter it gets at finding people you'll truly connect with.",
          },
          {
            question: 'Is my data safe and private?',
            answer:
              'Absolutely. We use bank-level encryption, never sell your data, and give you full control over what information is visible. Your exact location is never shared—only approximate distance. You can delete your account and data anytime.',
          },
          {
            question: 'How do you prevent fake profiles?',
            answer:
              'Every user goes through photo verification using a live selfie that matches their profile pictures. We also use AI and human moderators to detect and remove suspicious accounts. Verified profiles get a blue checkmark badge.',
          },
          {
            question:
              "Can I use HeartLink if I'm looking for something casual?",
            answer:
              "Yes! You can specify exactly what you're looking for—whether that's a serious relationship, casual dating, or just making new friends. Our filters help you find people seeking the same type of connection.",
          },
          {
            question: 'What if I need help or feel unsafe?',
            answer:
              'Your safety is our priority. You can block or report anyone with one tap. We offer 24/7 support, date safety check-ins, and the ability to share your location with trusted friends during meetups. Our team responds to all safety concerns within minutes.',
          },
        ]
    return (
      <section className={cn('bg-background py-16 lg:py-24', props.className)}>
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            {/* Left rail: mono meta + heading, sticky on desktop. */}
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-28">
                <MonoTag className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full bg-primary"
                  />
                  [ {String(faqItems.length).padStart(2, '0')} ] questions
                </MonoTag>
                <SectionHeading
                  align="left"
                  title={faqHeading}
                  subtitle={faqDesc}
                  className="mt-4 gap-0"
                  titleClassName="mb-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
                  subtitleClassName="text-lg text-muted-foreground"
                />
              </div>
            </div>
            {/* Right: hairline-divided question ledger. */}
            <FaqAccordion variant="divided" className="space-y-0 lg:col-span-8">
              {faqItems.map((item, i) => (
                <FaqItem
                  key={item.question}
                  variant="divided"
                  className="rounded-none bg-transparent"
                >
                  <FaqQuestion className="gap-4 py-1 text-left">
                    <span className="flex min-w-0 items-baseline gap-4">
                      <span
                        aria-hidden="true"
                        className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60 tabular-nums"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-base font-bold tracking-tight text-foreground sm:text-lg">
                        {item.question}
                      </span>
                    </span>
                    <FaqQuestionIcon
                      variant="plus"
                      className="grid size-8 shrink-0 place-items-center rounded-full border-2 border-foreground text-foreground"
                    />
                  </FaqQuestion>
                  <FaqAnswer asChild className="pb-2 pl-9 pr-12 pt-4">
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
