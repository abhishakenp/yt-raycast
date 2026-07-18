import { defineCapsule } from '#/capsules/openui.ts'

import {
  FaqAccordion,
  FaqAnswer,
  FaqItem,
  FaqQuestion,
  FaqQuestionIcon,
} from '#/section-kit/FaqAccordion.tsx'
import { Container } from '#/section-kit/Container.tsx'

import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * DatingAppFaq — a centered FAQ accordion for a dating / matchmaking app. A narrow
 * single-column layout with a centered heading + supporting paragraph above a stack
 * of native <details> accordion items on soft muted backgrounds; each summary shows
 * the question with a chevron that rotates open, revealing the answer below. The
 * default supporting line interpolates the brand name. Use to answer common
 * questions — safety, matching, privacy, pricing — for dating apps, singles
 * platforms, or any consumer product. Renders fully with no props via baked-in
 * "HeartLink" FAQ defaults.
 */
export const DatingAppFaq = defineCapsule({
  name: 'DatingAppFaq',
  description:
    'Centered FAQ accordion for a dating / matchmaking app: a narrow single-column layout with a centered heading + supporting paragraph above a stack of native <details> accordion items on soft muted backgrounds; each summary shows the question with a chevron that rotates open to reveal the answer. The default supporting line interpolates the brand name. Use to answer common questions — safety, matching, privacy, pricing — for dating apps, singles platforms, or any consumer product.',
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
      <section className={cn('bg-background py-24', props.className)}>
        <Container size="sm">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              {faqHeading}
            </h2>
            <p className="text-lg text-muted-foreground">{faqDesc}</p>
          </div>
          <FaqAccordion>
            {faqItems.map((item) => (
              <FaqItem
                key={item.question}
                variant="muted"
                className="overflow-hidden bg-muted"
              >
                <FaqQuestion className="p-6 transition-colors hover:bg-accent">
                  <FaqQuestionIcon />
                </FaqQuestion>
                <FaqAnswer asChild className="px-6 pb-6">
                  <div>{item.answer}</div>
                </FaqAnswer>
              </FaqItem>
            ))}
          </FaqAccordion>
        </Container>
      </section>
    )
  },
})
