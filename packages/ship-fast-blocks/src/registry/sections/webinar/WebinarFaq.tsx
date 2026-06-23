import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { SectionHeading } from "#/section-kit/SectionHeading.tsx"

export const WebinarFaq = defineComponent({
  name: "WebinarFaq",
  description:
    "Frequently asked questions band for a webinar or virtual event: a SectionHeading over a stacked list of native <details>/<summary> disclosures. Each item shows a token-styled question with a chevron that expands to reveal the answer, handling cost, recording, timing, and access objections. Use to remove last-mile hesitation before registration on a webinar landing page.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
    items: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? "FAQ"
    const heading = props.heading ?? "Frequently asked questions"
    const subheading =
      props.subheading ??
      "Everything you might want to know before you register."
    const items = props.items?.length
      ? props.items
      : [
          {
            question: "How much does it cost to attend?",
            answer:
              "Nothing — the live session is completely free. We just ask that you register so we can send you the join link and reminders.",
          },
          {
            question: "Will the session be recorded?",
            answer:
              "Yes. Everyone who registers receives the full recording by email afterward, so you won't miss anything if you can't make it live.",
          },
          {
            question: "How long is the webinar?",
            answer:
              "Plan for about 60 minutes — roughly 45 minutes of content plus 15 minutes of live Q&A at the end.",
          },
          {
            question: "Can I ask questions during the event?",
            answer:
              "Absolutely. You can drop questions in the chat at any time, and we'll answer as many as possible during the dedicated Q&A.",
          },
          {
            question: "What if I register but can't attend live?",
            answer:
              "No problem. Register anyway and we'll send you the recording and the slides so you can watch on your own schedule.",
          },
        ]

    return (
      <section className={cn("bg-background py-20 text-foreground lg:py-28", props.className)}>
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <SectionHeading eyebrow={eyebrow} title={heading} subtitle={subheading} />

          <div className="mt-12 flex flex-col gap-4">
            {items.map((item, i) => (
              <details
                key={`${item.question}-${i}`}
                className="group rounded-xl border border-border bg-card px-6 py-5 text-card-foreground"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-foreground">
                  {item.question}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </summary>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
