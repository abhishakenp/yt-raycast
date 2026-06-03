import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"

/**
 * BootcampFaq — accordion FAQ section for a coding bootcamp / career-school
 * landing page. A centered eyebrow, heading and description above a stacked
 * set of native <details> disclosure widgets; each item has a bold question
 * summary with a chevron that rotates on open, and a muted paragraph answer.
 * No links. Use to answer common questions about programs, pricing, time
 * commitment, prerequisites, job guarantees and remote options.
 */
export const BootcampFaq = defineComponent({
  name: "BootcampFaq",
  description:
    "Accordion FAQ section for a coding bootcamp / career-school landing page: centered eyebrow, heading and description above a stacked set of native details disclosure widgets. Each item has a bold question summary with a chevron that rotates on open, and a muted paragraph answer. No links. Use to answer common questions about programs, pricing, time commitment, prerequisites, job guarantees and remote options.",
  props: z.object({
    /** Section eyebrow label. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** FAQ items: question + answer. */
    items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const faqEyebrow = props.eyebrow ?? "FAQ"
    const faqHeading = props.heading ?? "Common questions answered"
    const faqDesc =
      props.description ??
      "Everything you need to know about the bootcamp experience."
    const faqItems = props.items?.length
      ? props.items
      : [
          {
            q: "Do I need prior programming experience?",
            a: "No prior experience is required. Our curriculum is designed for absolute beginners. We look for logical thinkers who are motivated to learn. Many of our most successful graduates came from completely non-technical backgrounds like teaching, nursing, marketing, and construction.",
          },
          {
            q: "What is the time commitment?",
            a: "The full-time program requires 40+ hours per week for 16 weeks — Monday through Friday, 9am to 5pm. We also offer a part-time option (20 hours/week for 32 weeks) for those who need to continue working. Both programs deliver identical curriculum and outcomes.",
          },
          {
            q: "How does the job guarantee work?",
            a: 'If you complete the program, participate in career services, and don\'t receive a qualifying job offer within 6 months, we\'ll refund your tuition in full. A "qualifying offer" means a full-time software development position paying at least $50,000 annually. This guarantee reflects our confidence in our curriculum and career support.',
          },
          {
            q: "Is the program remote or in-person?",
            a: "Our program is fully remote with live, interactive instruction. You'll attend daily standups, pair programming sessions, and mentor meetings via video call. This format allows us to bring together students and mentors from around the world while letting you learn from home.",
          },
          {
            q: "What kind of computer do I need?",
            a: "You'll need a Mac, Windows, or Linux laptop with at least 8GB of RAM (16GB recommended) and a reliable internet connection. We provide all software licenses and tools you'll need during the program.",
          },
          {
            q: "Are there scholarships available?",
            a: "Yes, we offer $2,000 scholarships for underrepresented groups in tech, including women, people of color, LGBTQ+ individuals, veterans, and people with disabilities. These scholarships are stackable with our payment plans. Contact our admissions team for details.",
          },
        ]

    const Chevron = () => (
      <svg
        className="size-5 transition-transform group-open:rotate-180"
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
    )

    return (
      <section
        className={cn("bg-background py-20 lg:py-32", props.className)}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center lg:mb-20">
            <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-wider text-primary">
              {faqEyebrow}
            </span>
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              {faqHeading}
            </h2>
            <p className="text-lg text-muted-foreground">{faqDesc}</p>
          </div>
          <div className="space-y-4">
            {faqItems.map((item) => (
              <details
                key={item.q}
                className="group rounded-xl bg-muted/50"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                  <span className="font-semibold">{item.q}</span>
                  <Chevron />
                </summary>
                <div className="px-6 pb-6 text-muted-foreground">
                  <p>{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
