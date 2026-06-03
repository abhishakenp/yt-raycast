import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { Image } from "#/lib/img.tsx"

/**
 * AgencyTestimonial — oversized pull-quote testimonial band for a creative
 * digital-agency page, on a bordered muted band. Centered: a round tinted
 * quote-mark icon tile, a huge centered blockquote where one phrase is rendered
 * in the accent color, and an attribution row with a round alt-driven avatar
 * beside the name and role. Tokens-only, no links. Use for a single hero client
 * testimonial, social-proof pull-quote, or featured customer endorsement.
 * Renders fully with no props via a baked-in default quote + attribution.
 */
export const AgencyTestimonial = defineComponent({
  name: "AgencyTestimonial",
  description:
    "Oversized pull-quote testimonial band for a creative digital-agency page on a bordered muted band: centered round tinted quote-mark icon tile, a huge centered blockquote where one phrase is rendered in the accent color, and an attribution row with a round alt-driven avatar beside the name and role. Tokens-only, no links. Use for a single hero client testimonial, social-proof pull-quote, or featured customer endorsement.",
  props: z.object({
    /** Full quote text. */
    quote: z.string().optional(),
    /** Phrase inside the quote rendered in the accent color. */
    highlight: z.string().optional(),
    /** Attribution name. */
    name: z.string().optional(),
    /** Attribution role / company. */
    role: z.string().optional(),
    /** Alt text driving the avatar image. */
    avatarAlt: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const quote =
      props.quote ??
      "Studio Rise didn't just redesign our product — they redefined how our customers think about our brand. The results exceeded every KPI we set."
    const highlight = props.highlight ?? "redefined how our customers think"
    const name = props.name ?? "Sarah Chen"
    const role = props.role ?? "CEO, Aurora Fintech"
    const avatarAlt = props.avatarAlt ?? "Portrait of Sarah Chen, fintech CEO"

    const renderQuote = () => {
      const idx = highlight ? quote.indexOf(highlight) : -1
      if (idx === -1) return <>&ldquo;{quote}&rdquo;</>
      return (
        <>
          &ldquo;{quote.slice(0, idx)}
          <span className="text-primary">{highlight}</span>
          {quote.slice(idx + highlight.length)}&rdquo;
        </>
      )
    }

    return (
      <section
        className={cn(
          "border-y border-border bg-muted/30 py-24 sm:py-32",
          props.className,
        )}
      >
        <div className="mx-auto max-w-5xl px-6 text-center">
          <div className="mx-auto mb-8 grid size-16 place-items-center rounded-full bg-primary/10">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-primary"
              aria-hidden="true"
            >
              <path d="M9.5 6C6.5 6 4 8.5 4 11.5V18h6.5v-6.5H7.5C7.5 9.6 8.4 8.5 9.5 8.5V6zm9 0c-3 0-5.5 2.5-5.5 5.5V18H19.5v-6.5h-3C16.5 9.6 17.4 8.5 18.5 8.5V6z" />
            </svg>
          </div>
          <blockquote className="mb-10 text-3xl font-medium leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            {renderQuote()}
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            <Image
              alt={avatarAlt}
              w={120}
              h={120}
              className="size-14 rounded-full border-2 border-border object-cover"
            />
            <div className="text-left">
              <div className="font-semibold text-foreground">{name}</div>
              <div className="text-sm text-muted-foreground">{role}</div>
            </div>
          </div>
        </div>
      </section>
    )
  },
})
