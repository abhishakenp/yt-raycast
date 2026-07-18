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
 * CommunityForumFaq — accordion FAQ for a community-platform / discussion-forum
 * landing page. A centered heading + description above a max-width stack of
 * details/summary cards; each card has a question, a chevron that rotates on open,
 * and an answer paragraph. No links. Use as the frequently-asked-questions section
 * for community platforms, SaaS products, or membership services.
 */
export const CommunityForumFaq = defineCapsule({
  name: 'CommunityForumFaq',
  description:
    'Accordion FAQ for a community-platform / discussion-forum landing page: a centered heading and description above a max-width stack of details/summary cards, each with a question, a chevron that rotates on open, and an answer paragraph. No links. Use as the frequently-asked-questions section for community platforms, SaaS products, or membership services.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** FAQ items: question + answer. */
    items: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Frequently asked questions'
    const description =
      props.description ?? 'Everything you need to know about Threadloom.'
    const items = props.items?.length
      ? props.items
      : [
          {
            question: 'Can I migrate from another platform?',
            answer:
              'Absolutely. We offer free migration services from Facebook Groups, Discord, Circle, and other platforms. Our team will help you export your data, preserve all posts and member relationships, and set up your new community space with minimal disruption.',
          },
          {
            question: 'Is there a limit on file uploads?',
            answer:
              'Starter plans include 1GB of storage. Growth plans offer 50GB, and Enterprise plans have unlimited storage. Individual file uploads are limited to 100MB on all plans. We support images, documents, PDFs, and most common file formats.',
          },
          {
            question: 'Can I make my community private?',
            answer:
              'Yes, you have full control over visibility. Set your entire community to public, private, or invitation-only. You can also create private subgroups within a public community, perfect for premium members, moderators, or specific project teams.',
          },
          {
            question: 'What kind of analytics do you provide?',
            answer:
              'All plans include member growth tracking, active user counts, and popular topics. Growth and Enterprise plans add engagement metrics, retention analysis, content performance reports, and the ability to export data for further analysis in your preferred tools.',
          },
          {
            question: 'Do you offer mobile apps?',
            answer:
              'Threadloom is fully responsive and works beautifully on mobile browsers. Native iOS and Android apps are in development and will be available to Growth and Enterprise customers later this year with full white-label options for Enterprise plans.',
          },
        ]

    return (
      <section className={cn('py-24 lg:py-28', props.className)}>
        <Container size="sm">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <FaqAccordion>
            {items.map((item) => (
              <FaqItem
                key={item.question}
                className="p-6 transition-colors open:border-foreground/20"
              >
                <FaqQuestion>
                  <h3 className="text-lg font-semibold text-card-foreground">
                    {item.question}
                  </h3>
                  <FaqQuestionIcon />
                </FaqQuestion>
                <FaqAnswer className="mt-4">{item.answer}</FaqAnswer>
              </FaqItem>
            ))}
          </FaqAccordion>
        </Container>
      </section>
    )
  },
})
