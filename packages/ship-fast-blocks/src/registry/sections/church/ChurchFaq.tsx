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

/**
 * ChurchFaq — accordion FAQ section for a church or faith-community site. A centered
 * header (eyebrow + heading) above a stacked list of native <details> cards with a
 * chevron that rotates on open. Clean, accessible, and content-friendly. Use for
 * newcomer questions, service logistics, beliefs, kids programs, giving, counseling,
 * or any FAQ on churches, worship centers, parishes, ministries, or religious nonprofits.
 * Renders fully with no props via baked-in defaults.
 */
export const ChurchFaq = defineCapsule({
  name: 'ChurchFaq',
  description:
    'Accordion FAQ section for a church or faith-community site: centered header (eyebrow + heading) above a stacked list of native details cards with a chevron that rotates on open. Clean, accessible, and content-friendly. Use for newcomer questions, service logistics, beliefs, kids programs, giving, counseling, or any FAQ on churches, worship centers, parishes, ministries, or religious nonprofits.',
  props: z.object({
    /** Small uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** FAQ items; each has a question and an answer. */
    items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Questions'
    const heading = props.heading ?? 'Common questions'
    const items = props.items?.length
      ? props.items
      : [
          {
            q: 'What should I wear?',
            a: "Come as you are. You'll find everything from jeans and t-shirts to business casual. We care more about you being here than what you wear.",
          },
          {
            q: 'Is there something for my kids?',
            a: 'Absolutely. We offer nursery (0-2), preschool (3-5), elementary (K-5th), and middle school programs during every service. High school meets Sunday evenings at 5:00 PM. All volunteers are background-checked and trained.',
          },
          {
            q: 'How do I join a small group?',
            a: 'Small groups launch each September and January. You can browse open groups online or stop by the Connection Center on Sunday to talk with a host who will help you find the right fit based on your location, life stage, and interests.',
          },
          {
            q: 'Do you offer counseling or support groups?',
            a: 'Yes. We offer pastoral counseling by appointment, as well as specialized support groups including GriefShare, DivorceCare, and addiction recovery. These are confidential and led by trained facilitators. Contact our Care Ministry for details.',
          },
          {
            q: 'What do you believe?',
            a: "We're a nondenominational Christian church holding to historic Christian orthodoxy. We affirm the Bible as God's inspired Word, salvation through faith in Jesus Christ, and the importance of local church community. Our full statement of faith is available on our About page.",
          },
        ]

    return (
      <section
        className={cn(
          'bg-muted pt-28 pb-24 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <div className="mb-16 text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
              {eyebrow}
            </p>
            <h2 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
              {heading}
            </h2>
          </div>
          <FaqAccordion>
            {items.map((item) => (
              <FaqItem key={item.q}>
                <FaqQuestion className="p-6">
                  <span className="font-medium text-card-foreground">
                    {item.q}
                  </span>
                  <FaqQuestionIcon className="ml-4" />
                </FaqQuestion>
                <FaqAnswer asChild className="px-6 pb-6 leading-relaxed">
                  <div>{item.a}</div>
                </FaqAnswer>
              </FaqItem>
            ))}
          </FaqAccordion>
        </div>
      </section>
    )
  },
})
