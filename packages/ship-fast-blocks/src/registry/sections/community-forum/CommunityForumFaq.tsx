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
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'

import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * CommunityForumFaq — playful-geometric asymmetric FAQ for a
 * community-platform / discussion-forum landing page. A 5:7 editorial split:
 * on the left a mono "08 / faq" rail, a big tight-tracked heading, the lead
 * paragraph, and a rotated rounded-full mono sticker chip ("[ ask anything ]"),
 * all sticky on desktop over a giant ghost "?" watermark; on the right a
 * stack of sharp-cornered bordered details/summary cards, each opening with a
 * mono "Q.01" index, a bold question, and a rounded-full plus chip that
 * rotates when open above the answer paragraph. No links. Use as the
 * frequently-asked-questions section for community platforms, SaaS products,
 * or membership services.
 */
export const CommunityForumFaq = defineCapsule({
  name: 'CommunityForumFaq',
  description:
    'Playful-geometric asymmetric FAQ for a community-platform / discussion-forum landing page: a 5:7 split with a sticky left rail (mono metadata label, big tight-tracked heading, lead paragraph, rotated rounded-full mono sticker chip) over a giant ghost "?" watermark, and on the right a stack of sharp-cornered bordered details/summary cards, each with a mono "Q.01" index, a bold question, and a rounded-full plus chip that rotates open above the answer paragraph. No links. Use as the frequently-asked-questions section for community platforms, SaaS products, or membership services.',
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
      <section
        className={cn(
          'relative overflow-hidden py-16 sm:py-20 lg:py-28',
          props.className,
        )}
      >
        <Watermark className="-left-6 bottom-0 text-[10rem] sm:text-[15rem] lg:text-[20rem]">
          ?
        </Watermark>
        <Container size="lg" className="relative">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-28">
                <div className="mb-5 flex items-center gap-4">
                  <MonoTag>08 / FAQ</MonoTag>
                  <span
                    aria-hidden="true"
                    className="h-px w-16 bg-border sm:w-24"
                  />
                </div>
                <SectionHeading
                  align="left"
                  title={heading}
                  subtitle={description}
                  className="gap-0"
                  titleClassName="mb-4 text-3xl font-extrabold tracking-tighter text-foreground sm:text-4xl lg:text-5xl"
                  subtitleClassName="text-lg text-muted-foreground"
                />
                <span
                  aria-hidden="true"
                  className="mt-7 inline-flex -rotate-2 items-center rounded-full border-2 border-foreground/20 bg-background px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground shadow-[3px_3px_0_0] shadow-primary/25"
                >
                  [ ask anything ]
                </span>
              </div>
            </div>
            <div className="lg:col-span-7">
              <FaqAccordion className="space-y-3 sm:space-y-4">
                {items.map((item, i) => (
                  <FaqItem
                    key={item.question}
                    className="rounded-none border-2 border-foreground/15 bg-card p-5 transition-all duration-150 open:border-foreground/40 open:shadow-[4px_4px_0_0] open:shadow-primary/20 sm:p-6"
                  >
                    <FaqQuestion className="items-start gap-4">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 shrink-0 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-primary"
                      >
                        Q.{String(i + 1).padStart(2, '0')}
                      </span>
                      <h3 className="flex-1 text-base font-bold tracking-tight text-card-foreground sm:text-lg">
                        {item.question}
                      </h3>
                      <FaqQuestionIcon
                        variant="plus"
                        className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-foreground/20 bg-background text-foreground [&_svg]:size-3.5"
                      />
                    </FaqQuestion>
                    <FaqAnswer className="mt-4 pl-0 sm:pl-12">
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
