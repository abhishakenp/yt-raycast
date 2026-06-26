import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'

/**
 * NewsletterFaq — native accordion FAQ for an editorial newsletter. A centered
 * serif heading over a narrow column of bordered card <details> rows: each
 * summary shows the question in medium weight with a chevron that rotates open,
 * revealing a relaxed muted answer. Warm, calm, literary mood on a paper-toned
 * surface, no JavaScript required. Use to answer common subscription questions
 * (cadence, archives, refunds, authorship, team plans) for newsletters,
 * publications, blogs, or content creators. Renders fully with no props via
 * baked-in defaults.
 */
export const NewsletterFaq = defineComponent({
  name: 'NewsletterFaq',
  description:
    'Native accordion FAQ for an editorial newsletter: a centered serif heading over a narrow column of bordered card details rows where each summary shows the question in medium weight with a chevron that rotates open, revealing a relaxed muted answer. Warm, calm, literary mood on a paper-toned surface, no JavaScript required. Use to answer common subscription questions (cadence, archives, refunds, authorship, team plans) for newsletters, publications, blogs, or content creators.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Question + answer rows. */
    items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Questions & Answers'
    const items = props.items?.length
      ? props.items
      : [
          {
            q: 'How often do you publish?',
            a: "Every Sunday morning, usually around 8 AM EST. Occasionally I'll send a mid-week issue if there's breaking news worth addressing, but I stick to the weekly schedule to respect your inbox.",
          },
          {
            q: 'Can I access past issues?',
            a: 'Free subscribers get access to the last 3 months of issues. Paid subscribers can browse the complete archive—all 156 issues since we started in 2023. Every issue is tagged and searchable.',
          },
          {
            q: 'Do you offer refunds?',
            a: "Yes. If you're not satisfied with your paid subscription, contact me within 30 days for a full refund—no questions asked. After 30 days, you can cancel anytime and keep access until your billing period ends.",
          },
          {
            q: 'Who writes this newsletter?',
            a: "Hi, I'm Sarah Mitchell. I'm a former product manager at Stripe who left to write full-time. I've been publishing The Quiet Observer since 2023, and I'm based in Brooklyn, New York.",
          },
          {
            q: 'How do team subscriptions work?',
            a: 'Team subscriptions give everyone at your company access to paid features, including the full archive, audio versions, and our private Discord. Pricing starts at $50/month for up to 10 team members. Get in touch for larger teams.',
          },
        ]

    return (
      <section className={cn('py-16 md:py-24 lg:py-32', props.className)}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center md:mb-16">
            <h2 className="mb-4 font-serif text-3xl font-medium text-foreground sm:text-4xl">
              {heading}
            </h2>
          </div>

          <div className="space-y-6">
            {items.map((item) => (
              <details
                key={item.q}
                className="group overflow-hidden rounded-xl border border-border bg-card text-card-foreground"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                  <span className="font-medium text-foreground">{item.q}</span>
                  <svg
                    className="size-5 text-muted-foreground transition-transform group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <div className="px-6 pb-6 leading-relaxed text-muted-foreground">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
