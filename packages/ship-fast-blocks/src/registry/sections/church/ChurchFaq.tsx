import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import {
  FaqAccordion,
  FaqAnswer,
  FaqItem,
  FaqQuestion,
  FaqQuestionIcon,
} from '#/section-kit/FaqAccordion.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

/**
 * ChurchFaq — serene editorial FAQ section for a church or faith-community
 * site, split on an asymmetric 5:7 grid with a giant ghost serif "Q" watermark.
 * The left rail (sticky on desktop) holds a mono metadata rail (eyebrow —
 * hairline rule), a large serif heading, and a quiet mono index of the
 * question count. The right column stacks native <details> rows as a hairline
 * ledger: each question pairs a faint serif index numeral with a serif
 * question line and a chevron that rotates on open; answers sit indented
 * under the numeral column. Clean, accessible, and content-friendly. Use for
 * newcomer questions, service logistics, beliefs, kids programs, giving,
 * counseling, or any FAQ on churches, worship centers, parishes, ministries,
 * or religious nonprofits. Renders fully with no props via baked-in defaults.
 */
export const ChurchFaq = defineCapsule({
  name: 'ChurchFaq',
  description:
    "Serene editorial FAQ section for a church or faith-community site: an asymmetric 5:7 split with a giant ghost serif 'Q' watermark — sticky left rail with mono metadata rail, large serif heading, and a quiet mono question-count index; right column stacking native details rows as a hairline ledger where each question pairs a faint serif index numeral with a serif question line and a rotating chevron, answers indented beneath. Clean, accessible, and content-friendly. Use for newcomer questions, service logistics, beliefs, kids programs, giving, counseling, or any FAQ on churches, worship centers, parishes, ministries, or religious nonprofits.",
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
          'relative overflow-hidden py-20 lg:py-28',
          props.className,
        )}
      >
        <Watermark className="-bottom-20 right-0 font-serif text-[14rem] font-medium italic text-foreground/[0.04] sm:text-[20rem]">
          Q
        </Watermark>
        <Container size="xl" className="relative px-6">
          <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Sticky heading rail. */}
            <div className="lg:sticky lg:top-24 lg:col-span-5">
              <div className="mb-5 flex items-center gap-4">
                <MonoTag tone="primary" className="shrink-0">
                  {eyebrow}
                </MonoTag>
                <span aria-hidden="true" className="h-px flex-1 bg-border" />
              </div>
              <SectionHeading
                align="left"
                title={heading}
                className="gap-0"
                titleClassName="font-serif text-4xl font-medium leading-[1.08] tracking-tight text-foreground sm:text-5xl"
              />
              <MonoTag tone="faint" className="mt-6 block">
                01 — {String(items.length).padStart(2, '0')} · Ask us anything
              </MonoTag>
            </div>

            <div className="lg:col-span-7">
              <FaqAccordion className="gap-0 space-y-0">
                {items.map((item, i) => (
                  <FaqItem
                    key={item.q}
                    className="rounded-none border-0 border-t border-border bg-transparent shadow-none last:border-b"
                  >
                    <FaqQuestion className="gap-5 rounded-none px-0 py-6 sm:gap-8">
                      <span className="flex min-w-0 items-baseline gap-5 sm:gap-8">
                        <span
                          aria-hidden="true"
                          className="shrink-0 font-serif text-xl font-medium italic leading-none text-muted-foreground/40 sm:text-2xl"
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="min-w-0 font-serif text-lg font-medium tracking-tight text-foreground sm:text-xl">
                          {item.q}
                        </span>
                      </span>
                      <FaqQuestionIcon className="ml-4 text-muted-foreground" />
                    </FaqQuestion>
                    <FaqAnswer
                      asChild
                      className="px-0 pb-7 leading-relaxed text-muted-foreground sm:pl-[3.75rem]"
                    >
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
