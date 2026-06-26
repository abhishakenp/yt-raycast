import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'

/**
 * ComingSoonFaq — accordion FAQ section for a "launching soon" / waitlist pre-launch
 * landing page. A centered heading and lead paragraph above a stacked list of
 * native <details> / <summary> accordion items on a card-colored band; each item
 * has a rounded bordered panel, the question in a bold heading, a chevron icon
 * that rotates on open, and the answer in relaxed body text. No links or external
 * dependencies. Use as the FAQ / questions section on SaaS waitlists, app pre-launch
 * pages, or beta sign-up landers. Renders fully with no props via five baked-in
 * default Q&As.
 */
export const ComingSoonFaq = defineComponent({
  name: 'ComingSoonFaq',
  description:
    "Accordion FAQ section for a 'launching soon' / waitlist pre-launch landing page: centered heading and lead above a stacked list of native details/summary accordion items on a card-colored band. Each item has a rounded bordered panel, bold question heading, chevron icon that rotates on open, and relaxed body-text answer. No links. Use as the FAQ / questions section on SaaS waitlists, app pre-launch pages, or beta sign-up landers.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** FAQ items: question + answer pairs. */
    items: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Frequently asked questions'
    const description =
      props.description ?? 'Everything you need to know about Nexus'
    const items = props.items?.length
      ? props.items
      : [
          {
            question: 'When will Nexus officially launch?',
            answer:
              'Nexus officially launches on March 15, 2025. Waitlist members will receive early access starting March 1st, two weeks before the public launch. Early access includes exclusive onboarding sessions with our founding team.',
          },
          {
            question:
              'Can I import data from Notion, Confluence, or other tools?',
            answer:
              'Yes. We offer one-click import from Notion, Confluence, Google Docs, Dropbox Paper, and more. Our import engine preserves formatting, comments, and file attachments. Enterprise plans include assisted migration with a dedicated specialist.',
          },
          {
            question: 'Is there a free plan available?',
            answer:
              "Absolutely. Our Starter plan is free forever for up to 5 team members. It includes 10GB storage, core features, and community support. It's perfect for small teams, personal projects, or trying Nexus before committing.",
          },
          {
            question: 'How does the 50% early access discount work?',
            answer:
              'Waitlist members who sign up before launch receive 50% off any paid plan for their first 6 months. This discount applies to both monthly and annual billing. The discount is automatically applied when you upgrade from your free trial.',
          },
          {
            question: 'What security certifications does Nexus have?',
            answer:
              'Nexus is SOC 2 Type II certified, GDPR compliant, and HIPAA ready. We use end-to-end encryption for all data at rest and in transit. Enterprise customers can opt for dedicated infrastructure with custom data residency requirements.',
          },
        ]

    return (
      <section
        className={cn(
          'w-full bg-card px-4 py-24 sm:px-6 sm:py-32 lg:px-8 xl:px-12',
          props.className,
        )}
      >
        <div className="mx-auto max-w-3xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-2xl font-light text-foreground sm:text-3xl lg:text-4xl">
              {heading}
            </h2>
            <p className="font-light text-muted-foreground">{description}</p>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <details
                key={item.question}
                className="group rounded-lg border border-border bg-muted open:bg-card"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                  <h3 className="pr-4 text-base font-medium text-foreground">
                    {item.question}
                  </h3>
                  <span className="transition-transform group-open:rotate-180">
                    <svg
                      className="size-5 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
