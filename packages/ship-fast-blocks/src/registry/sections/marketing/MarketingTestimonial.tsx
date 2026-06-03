import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"

/**
 * MarketingTestimonial — a single large, centered testimonial card for a SaaS /
 * product-marketing landing page. Sits on a soft muted-to-background gradient
 * band; a rounded bordered card centers a circular indigo quote glyph above a
 * big balanced blockquote, with an initials avatar (gradient tile) + name +
 * role beneath. Clean premium indigo-on-light aesthetic. Use as a focused
 * social-proof / customer-quote section between features and pricing on B2B
 * SaaS, productivity, or developer-platform pages.
 */
export const MarketingTestimonial = defineComponent({
  name: "MarketingTestimonial",
  description:
    "Single large, centered testimonial card for a SaaS / product-marketing landing page: on a soft muted-to-background gradient band, a rounded bordered card centers a circular indigo quote glyph above a big balanced blockquote, with an initials avatar (gradient tile) + name + role beneath. Clean premium indigo-on-light aesthetic. Use as a focused social-proof / customer-quote section between features and pricing on B2B SaaS, productivity, or developer-platform pages.",
  props: z.object({
    quote: z.string().optional(),
    name: z.string().optional(),
    role: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const quote =
      props.quote ??
      "Flowstate transformed how our product team operates. We've cut meeting time by 40% and shipped three major releases ahead of schedule. It's the operating system for our company."
    const name = props.name ?? "Sarah Chen"
    const role = props.role ?? "VP of Engineering, Acme Corp"

    return (
      <section
        className={cn(
          "bg-gradient-to-b from-muted/50 to-background py-20",
          props.className,
        )}
      >
        <div className="mx-auto max-w-6xl px-6">
          <figure className="relative mx-auto max-w-3xl rounded-[1.5rem] border border-border bg-card px-8 py-12 text-center shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] sm:px-10">
            <span className="mx-auto mb-5 grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="none"
                aria-hidden="true"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </span>
            <blockquote className="text-balance text-xl font-medium leading-snug text-foreground sm:text-2xl">
              &ldquo;{quote}&rdquo;
            </blockquote>
            <figcaption className="mt-7 flex items-center justify-center gap-3.5">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-base font-bold text-primary-foreground">
                {name
                  .split(" ")
                  .map((w) => w.charAt(0))
                  .join("")
                  .slice(0, 2)}
              </span>
              <div className="text-left">
                <div className="text-[0.95rem] font-bold text-foreground">
                  {name}
                </div>
                <div className="text-sm text-muted-foreground">{role}</div>
              </div>
            </figcaption>
          </figure>
        </div>
      </section>
    )
  },
})
