import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Watermark } from '#/section-kit/Decor.tsx'
import {
  FaqAccordion,
  FaqAnswer,
  FaqItem,
  FaqQuestion,
  FaqQuestionIcon,
} from '#/section-kit/FaqAccordion.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * DocsFaq — "Terminal-docs" accessible, JS-free FAQ ledger for a developer
 * DOCUMENTATION / API-reference home. An asymmetric 4:8 split under a giant
 * ghost `?` watermark: the left rail (sticky on lg) holds a left-aligned
 * SectionHeading — mono "FAQ" eyebrow, extrabold title, muted subtitle — plus
 * a tabular mono entry count over a hairline rule. The right column is a
 * collapsed hairline question ledger of native <details>/<summary> rows: each
 * summary pairs a tabular mono `Q index` numeral with the question and a plus
 * glyph that rotates 45° on open (group-open); the answer reveals under a
 * hairline left rail, indented to the question column. Pure semantic HTML (no
 * useState, no navigation) so it stays keyboard- and screen-reader-accessible
 * by default; the first item opens via defaultOpen. Use for docs homes, API
 * references, SDK guides, developer portals, or knowledge-base FAQ bands.
 * Renders fully with no props via baked-in developer-docs defaults. Theme
 * tokens only.
 */
export const DocsFaq = defineCapsule({
  name: 'DocsFaq',
  description:
    "Terminal-docs accessible, JS-free FAQ ledger for a developer DOCUMENTATION / API-reference home: an asymmetric 4:8 split under a giant ghost '?' watermark — a sticky left rail with a left-aligned SectionHeading (mono 'FAQ' eyebrow, extrabold title, muted subtitle) and a tabular mono entry count over a hairline rule, beside a collapsed hairline ledger of native <details>/<summary> rows. Each summary pairs a tabular mono index numeral with the question and a plus glyph rotating 45° on open (group-open); the answer reveals under a hairline left rail indented to the question column. Pure semantic HTML — keyboard- and screen-reader-accessible by default, no client state and no navigation; the first item opens via defaultOpen. Use for docs homes, API references, SDK guides, developer portals, or knowledge-base FAQ bands. Theme tokens only.",
  props: z.object({
    /** Uppercase eyebrow label above the title. */
    eyebrow: z.string().optional(),
    /** Section title rendered by the kit SectionHeading. */
    title: z.string().optional(),
    /** Muted supporting subtitle under the title. */
    subtitle: z.string().optional(),
    /** Q&A entries rendered as native <details> accordions. */
    items: z
      .array(
        z.object({
          question: z.string(),
          answer: z.string(),
        }),
      )
      .optional(),
    /** Index of the item that starts expanded (set to -1 for none). */
    defaultOpen: z.number().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'FAQ'
    const title = props.title ?? 'Frequently asked questions'
    const subtitle =
      props.subtitle ?? 'Answers to the questions developers ask most.'
    const defaultOpen = props.defaultOpen ?? 0
    const items = props.items ?? [
      {
        question: 'How do I get an API key?',
        answer:
          'Create an account, open the dashboard, and generate a key from the API Keys page. Keep it secret and pass it as a Bearer token in the Authorization header.',
      },
      {
        question: 'What are the rate limits?',
        answer:
          'Free plans allow 60 requests per minute; paid plans scale up to 6,000. Every response includes X-RateLimit headers so you can back off gracefully before hitting a 429.',
      },
      {
        question: 'Do you support webhooks?',
        answer:
          'Yes. Register an HTTPS endpoint in the dashboard to receive signed event payloads. We retry failed deliveries with exponential backoff for up to 24 hours.',
      },
      {
        question: 'Which SDKs are available?',
        answer:
          'We ship official SDKs for TypeScript, Python, Go, and Ruby, all generated from the same OpenAPI spec. Community libraries cover PHP, Rust, and Java.',
      },
      {
        question: 'How do I report a bug?',
        answer:
          'Open an issue on GitHub or email support with a minimal reproduction and the request ID from the response headers. We triage new reports within one business day.',
      },
      {
        question: 'Is there a sandbox environment?',
        answer:
          'Every account includes a test mode with isolated data and seeded fixtures. Prefix your key with test_ to route requests to the sandbox without touching production.',
      },
    ]

    return (
      <section
        className={cn(
          'relative overflow-hidden border-b border-border pt-24 pb-16 lg:pt-28 lg:pb-24',
          props.className,
        )}
      >
        {/* Giant ghost question mark — the section's reading anchor. */}
        <Watermark className="-bottom-16 -left-6 font-mono text-[14rem] sm:text-[18rem] lg:text-[24rem]">
          ?
        </Watermark>

        <Container className="relative">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Left rail: heading + mono meta, sticky on lg. */}
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-24">
                <SectionHeading
                  eyebrow={eyebrow}
                  title={title}
                  subtitle={subtitle}
                  align="left"
                  className="gap-3"
                  eyebrowClassName="font-mono text-[11px] font-normal uppercase tracking-[0.22em] text-muted-foreground"
                  titleClassName="text-3xl font-extrabold tracking-tight sm:text-4xl"
                />
                <p
                  aria-hidden="true"
                  className="mt-6 border-t border-border pt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60 tabular-nums"
                >
                  [ {String(items.length).padStart(2, '0')} entries ]
                </p>
              </div>
            </div>

            {/* Right column: collapsed hairline question ledger. */}
            <div className="lg:col-span-8">
              <FaqAccordion variant="divided" className="space-y-0">
                {items.map((item, index) => (
                  <FaqItem
                    key={item.question}
                    open={index === defaultOpen}
                    variant="divided"
                    className="rounded-none border-0 bg-transparent"
                  >
                    <FaqQuestion className="items-baseline gap-4 rounded-none px-0 text-base font-semibold tracking-tight">
                      <span
                        aria-hidden="true"
                        className="shrink-0 font-mono text-[11px] font-normal tabular-nums tracking-[0.2em] text-muted-foreground/60"
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="flex-1">{item.question}</span>
                      <FaqQuestionIcon variant="plus" className="self-center" />
                    </FaqQuestion>
                    <FaqAnswer className="ml-8 mt-3 border-l-2 border-border pl-4 text-sm leading-relaxed">
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
