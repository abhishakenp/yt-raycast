import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * MentalHealthFaq — a centered FAQ accordion for a therapy practice. A narrow
 * eyebrow + heading + intro above a stack of native <details> rows on a muted
 * surface, each with a rotating chevron toggle, followed by a centered "still
 * have questions?" prompt and a rounded phone CTA. Calm, reassuring wellness
 * aesthetic. The CTA routes through useNavigate. Use to answer common questions
 * (insurance, session length, virtual vs in-person, cancellation) for therapists,
 * counselors, psychologists or wellness centers.
 */
export const MentalHealthFaq = defineComponent({
  name: 'MentalHealthFaq',
  description:
    "Centered FAQ accordion for a therapy practice: a narrow eyebrow + heading + intro above a stack of native details rows on a muted surface, each with a rotating chevron toggle, then a centered 'still have questions?' prompt and a rounded phone CTA. Calm, reassuring wellness aesthetic. The CTA routes through useNavigate. Use to answer common questions (insurance, session length, virtual vs in-person, cancellation) for therapists, counselors, psychologists or wellness centers.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    /** Brand name interpolated into the default description. */
    brand: z.string().optional(),
    items: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .optional(),
    footerNote: z.string().optional(),
    footerCta: z.string().optional(),
    /** Navigation target for the footer phone CTA (e.g. "Book Session"). */
    bookLabel: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Stillpoint'
    const eyebrow = props.eyebrow ?? 'FAQ'
    const heading = props.heading ?? 'Common questions'
    const description =
      props.description ??
      `Everything you need to know about starting therapy at ${brand}.`
    const items = props.items?.length
      ? props.items
      : [
          {
            question: 'Do you accept insurance?',
            answer:
              "Yes, we accept most major insurance plans including BlueCross BlueShield, Aetna, United Healthcare, Cigna, Kaiser, and Providence. We also offer out-of-network billing for PPO plans. Contact us with your specific plan details and we'll verify your coverage before your first session.",
          },
          {
            question: "What's the difference between therapy and psychiatry?",
            answer:
              'Therapists (psychologists, counselors, social workers) provide talk therapy to help you process emotions, develop coping skills, and change patterns. Psychiatrists are medical doctors who can prescribe and manage medications for conditions like depression, anxiety, and ADHD. Many clients benefit from working with both.',
          },
          {
            question: 'How long are therapy sessions?',
            answer:
              'Individual therapy sessions are 50 minutes. Couples and family sessions are typically 80 minutes to allow adequate time for all parties to participate. Psychiatry initial evaluations are 60 minutes, with follow-up medication management appointments at 30 minutes.',
          },
          {
            question: 'Is virtual therapy as effective as in-person?',
            answer:
              'Research consistently shows that teletherapy can be just as effective as in-person sessions for many conditions, including anxiety and depression. We use HIPAA-compliant video platforms and many clients appreciate the convenience. Some clients prefer to start in-person and transition to virtual, or mix both formats.',
          },
          {
            question: "What if I don't connect with my therapist?",
            answer:
              "The therapeutic relationship is crucial for success. If after 2-3 sessions you feel your therapist isn't the right fit, we'll happily transfer you to another clinician in our practice at no additional cost. Your comfort and progress are our priority.",
          },
          {
            question: 'What are your cancellation policies?',
            answer:
              'We require 24 hours notice for cancellations or rescheduling. Sessions cancelled with less than 24 hours notice are charged at the full session rate, as that time has been reserved specifically for you. We understand emergencies happen and handle those case-by-case.',
          },
        ]
    const footerNote = props.footerNote ?? 'Still have questions?'
    const footerCta = props.footerCta ?? 'Call us at (503) 555-0147'
    const bookLabel = props.bookLabel ?? 'Book Session'

    const Phone = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        />
      </svg>
    )

    return (
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <span className="text-sm font-medium uppercase tracking-wider text-primary">
              {eyebrow}
            </span>
            <h2 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <details
                key={item.question}
                className="group rounded-xl bg-muted/60"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                  <h3 className="pr-4 text-lg font-medium text-foreground">
                    {item.question}
                  </h3>
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-background transition-transform group-open:rotate-180">
                    <svg
                      className="size-5 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
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
                <div className="px-6 pb-6 leading-relaxed text-muted-foreground">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="mb-4 text-muted-foreground">{footerNote}</p>
            <button
              type="button"
              onClick={() => go(bookLabel)}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Phone className="size-5" />
              {footerCta}
            </button>
          </div>
        </div>
      </section>
    )
  },
})
