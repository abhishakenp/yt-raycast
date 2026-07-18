import { defineCapsule } from '#/capsules/openui.ts'

import {
  FaqAccordion,
  FaqAnswer,
  FaqItem,
  FaqQuestion,
  FaqQuestionIcon,
} from '#/section-kit/FaqAccordion.tsx'

import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Eyebrow } from '#/section-kit/Eyebrow.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * KidsEducationFaq — native disclosure FAQ accordion for a kids / family
 * learning platform. A centered eyebrow + heading + description intro above a
 * narrow stack of rounded muted <details> rows; each summary shows a question and
 * a chevron that rotates when open, revealing the answer beneath. Uses native
 * details/summary (no JS state). Use to answer common parent questions for
 * kids-education startups, children's e-learning platforms, tutoring services,
 * and family learning apps. Renders fully with no props via baked-in defaults.
 */
export const KidsEducationFaq = defineCapsule({
  name: 'KidsEducationFaq',
  description:
    "Native disclosure FAQ accordion for a kids / family learning platform: a centered eyebrow + heading + description intro above a narrow stack of rounded muted details rows; each summary shows a question and a chevron that rotates when open, revealing the answer beneath. Uses native details/summary (no JS state). Use to answer common parent questions for kids-education startups, children's e-learning platforms, tutoring services, and family learning apps.",
  props: z.object({
    /** Uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description under the heading. */
    description: z.string().optional(),
    /** FAQ entries. */
    items: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'FAQ'
    const heading = props.heading ?? 'Common Questions'
    const description =
      props.description ?? 'Everything you need to know about WonderLearn.'
    const items = props.items?.length
      ? props.items
      : [
          {
            question: 'What age range is WonderLearn designed for?',
            answer:
              'WonderLearn is designed for children ages 4 to 12. Activities are organized by skill level and age group, with content ranging from simple pattern recognition for 4-year-olds to more complex coding and science projects for older kids. Each child gets personalized recommendations based on their age and abilities.',
          },
          {
            question: 'Can I use WonderLearn on multiple devices?',
            answer:
              "Yes! WonderLearn works on tablets, computers, and smartphones. Your child's progress syncs across all devices, so they can start an activity on a tablet and finish it on a computer. We support iOS, Android, Windows, macOS, and most modern web browsers.",
          },
          {
            question: 'How does the 14-day free trial work?',
            answer:
              "Simply sign up for any plan and you'll get full access for 14 days without entering a credit card. If you love it, add payment details to continue. If not, your account automatically converts to the free Starter plan with no charges. You can upgrade or cancel anytime.",
          },
          {
            question: 'Is WonderLearn safe for kids?',
            answer:
              'Absolutely. WonderLearn is COPPA-compliant and designed with child safety as our top priority. There are no ads, no external links, no social features, and no data sharing with third parties. All content is curated by education experts and appropriate for children.',
          },
          {
            question: 'Do I need to supervise my child?',
            answer:
              'While many activities are designed for independent exploration, we recommend parental involvement, especially for younger children. Some science experiments and craft projects require adult supervision. Parental controls let you set daily time limits and review activity history.',
          },
          {
            question: 'Can I cancel my subscription anytime?',
            answer:
              "Yes, you can cancel your subscription at any time from your account settings. When you cancel, you'll continue to have access until the end of your current billing period. Your child's progress is saved, so if you resubscribe later, you can pick up right where you left off.",
          },
        ]

    return (
      <section className={cn('bg-background py-24', props.className)}>
        <Container size="sm">
          <div className="mb-16 text-center">
            <Eyebrow
              variant="text"
              className="mb-3 text-sm tracking-wider text-secondary"
            >
              {eyebrow}
            </Eyebrow>
            <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>

          <FaqAccordion>
            {items.map((item) => (
              <FaqItem
                key={item.question}
                variant="muted"
                className="rounded-2xl bg-muted/40"
              >
                <FaqQuestion className="p-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    {item.question}
                  </h3>
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
