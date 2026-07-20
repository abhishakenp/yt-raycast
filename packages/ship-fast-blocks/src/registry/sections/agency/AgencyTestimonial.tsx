import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  PullQuote,
  PullQuoteAttribution,
  PullQuoteIcon,
  PullQuoteName,
  PullQuoteRole,
  PullQuoteText,
} from '#/section-kit/PullQuote.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'

/**
 * AgencyTestimonial — neo-brutalist pull-quote band for a creative
 * digital-agency page. A muted band with a giant ghost quotation-mark
 * watermark bleeding off the left edge: a tilted sharp primary quote-mark
 * sticker tile (2px border, hard offset shadow) and a mono "05 / Client
 * words" index open an asymmetric left-aligned blockquote in big slab type
 * where the highlight phrase sits inside a solid primary sticker block; the
 * attribution row pairs a tilted sharp-cornered alt-driven avatar (2px
 * border, hard offset shadow) with a slab uppercase name and a mono role.
 * Tokens-only, no links. Use for a single hero client testimonial,
 * social-proof pull-quote, or featured customer endorsement. Renders fully
 * with no props via a baked-in default quote + attribution.
 */
export const AgencyTestimonial = defineCapsule({
  name: 'AgencyTestimonial',
  description:
    'Neo-brutalist pull-quote band for a creative digital-agency page: a muted band with a giant ghost quotation-mark watermark, a tilted sharp primary quote-mark sticker tile with 2px border and hard offset shadow, a mono index label, an asymmetric left-aligned blockquote in big slab type with the highlight phrase inside a solid primary sticker block, and an attribution row pairing a tilted sharp-cornered alt-driven avatar (2px border, hard offset shadow) with a slab uppercase name and mono role. Tokens-only, no links. Use for a single hero client testimonial, social-proof pull-quote, or featured customer endorsement.',
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
    const highlight = props.highlight ?? 'redefined how our customers think'
    const name = props.name ?? 'Sarah Chen'
    const role = props.role ?? 'CEO, Aurora Fintech'
    const avatarAlt = props.avatarAlt ?? 'Portrait of Sarah Chen, fintech CEO'

    const renderQuote = () => {
      const idx = highlight ? quote.indexOf(highlight) : -1
      if (idx === -1) return <>&ldquo;{quote}&rdquo;</>
      return (
        <>
          &ldquo;{quote.slice(0, idx)}
          <span className="bg-primary box-decoration-clone px-1.5 text-primary-foreground">
            {highlight}
          </span>
          {quote.slice(idx + highlight.length)}&rdquo;
        </>
      )
    }

    return (
      <PullQuote
        variant="muted"
        className={cn(
          'relative overflow-hidden border-t-0 border-b-2 border-foreground bg-muted/30 py-14 sm:py-20 lg:py-24',
          props.className,
        )}
      >
        <Watermark className="-left-10 -top-24 font-serif text-[18rem] text-foreground/[0.06] sm:text-[28rem]">
          &ldquo;
        </Watermark>
        <Container size="lg" className="relative px-6">
          <div className="flex items-start justify-between gap-4">
            <PullQuoteIcon
              size="lg"
              className="grid size-14 -rotate-6 place-items-center rounded-none border-2 border-foreground bg-primary shadow-[4px_4px_0_0] shadow-foreground"
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-primary-foreground"
                aria-hidden="true"
              >
                <path d="M9.5 6C6.5 6 4 8.5 4 11.5V18h6.5v-6.5H7.5C7.5 9.6 8.4 8.5 9.5 8.5V6zm9 0c-3 0-5.5 2.5-5.5 5.5V18H19.5v-6.5h-3C16.5 9.6 17.4 8.5 18.5 8.5V6z" />
              </svg>
            </PullQuoteIcon>
            <MonoTag aria-hidden="true" className="mt-2 shrink-0">
              05 / Client words
            </MonoTag>
          </div>
          <PullQuoteText className="mb-10 mt-8 max-w-4xl text-left text-2xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            {renderQuote()}
          </PullQuoteText>
          <PullQuoteAttribution className="justify-start gap-5 border-t-2 border-foreground pt-8">
            <Image
              alt={avatarAlt}
              w={120}
              h={120}
              className="size-14 rotate-2 rounded-none border-2 border-foreground object-cover shadow-[4px_4px_0_0] shadow-foreground"
            />
            <div className="text-left">
              <PullQuoteName className="font-black uppercase tracking-tight">
                {name}
              </PullQuoteName>
              <PullQuoteRole className="font-mono text-[11px] uppercase tracking-[0.15em]">
                {role}
              </PullQuoteRole>
            </div>
          </PullQuoteAttribution>
        </Container>
      </PullQuote>
    )
  },
})
