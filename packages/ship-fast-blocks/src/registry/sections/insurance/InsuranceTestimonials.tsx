import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { Image } from "#/lib/img.tsx"

/**
 * InsuranceTestimonials — customer testimonial wall for an insurance page. A
 * centered eyebrow chip + heading + lede above a responsive grid of muted
 * quote cards (up to 3 columns), each with a 5-star row, a quote, and an
 * alt-driven circular headshot beside the customer name and role. Imagery uses
 * the <Image> component. Use as the social-proof section for insurance
 * carriers, insurtech, brokers, or financial-protection products. Renders fully
 * with no props via baked-in defaults.
 */
export const InsuranceTestimonials = defineComponent({
  name: "InsuranceTestimonials",
  description:
    "Customer testimonial wall for an insurance page: a centered eyebrow chip + heading + lede above a responsive grid of muted quote cards (up to 3 columns), each with a 5-star row, a quote, and an alt-driven circular headshot beside the customer name and role. Imagery uses the Image component. Use as the social-proof section for insurance carriers, insurtech startups, brokers, or financial-protection products.",
  props: z.object({
    /** Eyebrow chip above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Lede paragraph under the heading. */
    description: z.string().optional(),
    /** Testimonial cards. */
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          role: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? "Customer Stories"
    const heading = props.heading ?? "Trusted by thousands"
    const description =
      props.description ??
      "See what our customers have to say about their experience with SecureLife."
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              "When a tree fell on our garage during a storm, SecureLife had an adjuster out within 4 hours. The claim was processed in 3 days. Absolutely incredible service when we needed it most.",
            name: "Michael Chen",
            role: "Homeowner, Seattle WA",
            avatarAlt:
              "Professional headshot of Michael Chen, a software engineer from Seattle",
          },
          {
            quote:
              "After my accident on I-95, I was stressed and overwhelmed. The SecureLife team walked me through everything, arranged a rental car same-day, and had my vehicle repaired within 2 weeks.",
            name: "Sarah Mitchell",
            role: "Marketing Director, Boston MA",
            avatarAlt:
              "Professional headshot of Sarah Mitchell, a marketing director from Boston",
          },
          {
            quote:
              "I switched all my policies to SecureLife and saved $340/year while getting better coverage. The online dashboard makes managing everything so simple.",
            name: "Jennifer Williams",
            role: "Small Business Owner, Denver CO",
            avatarAlt:
              "Professional headshot of Jennifer Williams, a small business owner from Denver",
          },
          {
            quote:
              "Setting up life insurance for my growing family was seamless. The agent helped me find the perfect term policy and the rate was 20% lower than my previous provider.",
            name: "David Park",
            role: "Teacher, Austin TX",
            avatarAlt:
              "Professional headshot of David Park, a teacher from Austin",
          },
          {
            quote:
              "The mobile app is a game-changer. Filed a windshield claim while waiting for my coffee. Approval came through before my latte was ready. Unbelievably convenient.",
            name: "Amanda Foster",
            role: "Nurse, Chicago IL",
            avatarAlt:
              "Professional headshot of Amanda Foster, a nurse from Chicago",
          },
          {
            quote:
              "As a new homeowner, I had a million questions. My SecureLife agent spent an hour on the phone explaining every detail. I finally understand what I'm paying for.",
            name: "Robert Thompson",
            role: "Financial Analyst, Miami FL",
            avatarAlt:
              "Professional headshot of Robert Thompson, a financial analyst from Miami",
          },
        ]

    const Star = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    return (
      <section className={cn("bg-background py-20 lg:py-28", props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="mb-4 inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground">
              {eyebrow}
            </span>
            <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {items.map((t) => (
              <div key={t.name} className="rounded-2xl bg-muted p-8">
                <div className="mb-4 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-5 text-primary" />
                  ))}
                </div>
                <p className="mb-6 leading-relaxed text-foreground/80">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <Image
                    alt={t.avatarAlt}
                    w={100}
                    h={100}
                    className="size-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-foreground">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
