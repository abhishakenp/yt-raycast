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

/**
 * DocsFaq — accessible, JS-free FAQ section for a developer DOCUMENTATION / API-reference
 * home. A centered column (max-w-3xl) leads with a kit SectionHeading: an uppercase "FAQ"
 * eyebrow in accent, a semibold "Frequently asked questions" title, and a muted subtitle.
 * Below it, a vertical stack of native <details>/<summary> accordions — each a rounded,
 * bordered card on bg-card whose <summary> holds the question plus a chevron SVG that
 * rotates 180° on open (group-open), and a muted answer paragraph that reveals when the
 * disclosure expands. Pure semantic HTML (no useState, no navigation) so it stays keyboard-
 * and screen-reader-accessible by default; the first item opens via defaultOpen. Use for
 * docs homes, API references, SDK guides, developer portals, or knowledge-base FAQ bands.
 * Renders fully with no props via baked-in developer-docs defaults. Clean docs aesthetic,
 * theme tokens only.
 */
export const DocsFaq = defineCapsule({
  name: 'DocsFaq',
  description:
    "Accessible, JS-free FAQ section for a developer DOCUMENTATION / API-reference home: a centered max-w-3xl column with a kit SectionHeading (uppercase 'FAQ' eyebrow, semibold 'Frequently asked questions' title, muted subtitle) above a vertical stack of native <details>/<summary> accordions. Each accordion is a rounded bordered card on bg-card whose summary shows the question and a chevron SVG that rotates 180° on open (group-open), with a muted answer paragraph revealed on expand. Pure semantic HTML — keyboard- and screen-reader-accessible by default, no client state and no navigation; the first item opens via defaultOpen. Use for docs homes, API references, SDK guides, developer portals, or knowledge-base FAQ bands. Clean developer-docs aesthetic, theme tokens only.",
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
          'mx-auto w-full max-w-3xl px-6 pt-28 pb-16',
          props.className,
        )}
      >
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          subtitle={subtitle}
          align="center"
        />

        <FaqAccordion variant="compact" className="mt-10">
          {items.map((item, index) => (
            <FaqItem key={item.question} open={index === defaultOpen}>
              <FaqQuestion className="px-5 py-4 font-medium">
                <span>{item.question}</span>
                <FaqQuestionIcon />
              </FaqQuestion>
              <FaqAnswer className="px-5 pb-5 text-sm">{item.answer}</FaqAnswer>
            </FaqItem>
          ))}
        </FaqAccordion>
      </section>
    )
  },
})
