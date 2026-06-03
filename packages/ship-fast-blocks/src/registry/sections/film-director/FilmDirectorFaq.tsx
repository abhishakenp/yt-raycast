import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"

/**
 * FilmDirectorFaq — a narrow, centered FAQ accordion for a film director or
 * cinematographer. A centered header (thin heading + muted lede) above a
 * constrained-width stack of native <details> disclosure cards, each a bordered
 * rounded summary row with a question and a chevron that rotates open, revealing
 * a muted answer paragraph. Use to answer common questions (timelines,
 * international work, equipment, music licensing, agency collaboration,
 * deliverables) for filmmakers, directors, DPs, or production houses.
 */
export const FilmDirectorFaq = defineComponent({
  name: "FilmDirectorFaq",
  description:
    "Narrow, centered FAQ accordion for a film director or cinematographer: a centered header (thin heading + muted lede) above a constrained-width stack of native details disclosure cards, each a bordered rounded summary row with a question and a chevron that rotates open, revealing a muted answer paragraph. Use to answer common questions (timelines, international work, equipment, music licensing, agency collaboration, deliverables) for filmmakers, directors, DPs, or production houses.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const faqHeading = props.heading ?? "Common Questions"
    const faqDesc =
      props.description ??
      "Everything you need to know about working together."
    const faqItems = props.items?.length
      ? props.items
      : [
          {
            question: "What is your typical project timeline?",
            answer:
              "Most projects take 4-8 weeks from kickoff to final delivery. This includes 1-2 weeks for pre-production (casting, locations, shot lists), 1-3 days of filming, and 2-4 weeks for post-production. Rush timelines are possible with advance notice and may incur additional fees.",
          },
          {
            question: "Do you work with international clients?",
            answer:
              "Absolutely. I've filmed projects across North America, Europe, and Asia. I'm based in Los Angeles but travel frequently for productions. Remote pre-production via video calls works seamlessly, and I've built relationships with local crews in major cities worldwide.",
          },
          {
            question: "What equipment do you shoot on?",
            answer:
              "I typically shoot on ARRI Alexa Mini LF or Sony Venice 2 for high-end projects, and RED Komodo for more nimble productions. I work with talented DP colleagues for projects requiring specific expertise. All equipment packages are customized to the project's creative and budgetary needs.",
          },
          {
            question: "How do you handle music licensing?",
            answer:
              "Music is integral to my process. For Essential packages, I use high-quality licensed tracks from premium libraries. For Professional and Premium projects, I work with composers for custom scores or license commercial tracks through my network of music supervisors. All licensing is handled professionally and included in your quote.",
          },
          {
            question: "Can you work with our existing agency team?",
            answer:
              "Of course. I regularly collaborate with creative directors, art directors, and account teams from agencies large and small. I'm experienced in taking creative direction while also bringing my own visual perspective to elevate the work. Clear communication and shared references ensure we're aligned throughout.",
          },
          {
            question: "What deliverables do you provide?",
            answer:
              "Every project includes the master cut in 4K or HD, along with format-specific versions for social platforms (9:16 vertical, 1:1 square, 16:9). I also provide still frames for press use, and can deliver raw footage on request. Color-graded versions for broadcast specs are available upon request.",
          },
        ]

    return (
      <section className={cn("py-20 md:py-32", props.className)}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-light md:text-4xl">
              {faqHeading}
            </h2>
            <p className="text-muted-foreground">{faqDesc}</p>
          </div>
          <div className="space-y-4">
            {faqItems.map((item) => (
              <details
                key={item.question}
                className="group rounded-md border border-border open:border-muted-foreground"
              >
                <summary className="flex cursor-pointer items-center justify-between p-6">
                  <span className="font-medium">{item.question}</span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5 transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  >
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
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
