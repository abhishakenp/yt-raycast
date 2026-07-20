import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  PullQuote,
  PullQuoteAttribution,
  PullQuoteAvatar,
  PullQuoteName,
  PullQuoteRole,
  PullQuoteText,
} from '#/section-kit/PullQuote.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'

/**
 * MarketingTestimonial — bold-kinetic single-quote social-proof band for a SaaS
 * / product-marketing landing page. A muted-washed section with a giant ghost
 * quotation-mark watermark: an asymmetric 4:8 grid pairs a left rail (a mono
 * "[ CUSTOMER STORY ]" micro-label with a primary tick and a sharp initials
 * avatar plate) with a big balanced blockquote on the right, closed by a
 * hairline-topped mono name / role footer. Sharp corners, confident kinetic-SaaS
 * aesthetic. Use as a focused customer-quote section between features and pricing
 * on B2B SaaS, productivity, or developer-platform pages.
 */
export const MarketingTestimonial = defineCapsule({
  name: 'MarketingTestimonial',
  description:
    'Bold-kinetic single-quote social-proof band for a SaaS / product-marketing landing page: a muted-washed section with a giant ghost quotation-mark watermark and an asymmetric 4:8 grid pairing a left rail (mono customer-story micro-label with a primary tick and a sharp initials avatar plate) with a big balanced blockquote, closed by a hairline-topped mono name / role footer. Sharp corners, confident kinetic-SaaS aesthetic. Use as a focused social-proof / customer-quote section between features and pricing on B2B SaaS, productivity, or developer-platform pages.',
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
    const name = props.name ?? 'Sarah Chen'
    const role = props.role ?? 'VP of Engineering, Acme Corp'
    const initials = name
      .split(' ')
      .map((w) => w.charAt(0))
      .join('')
      .slice(0, 2)

    return (
      <PullQuote
        className={cn(
          'relative overflow-hidden bg-muted/40 py-16 lg:py-24',
          props.className,
        )}
      >
        <Watermark className="-top-16 left-0 font-serif text-[16rem] leading-none sm:text-[22rem]">
          &ldquo;
        </Watermark>
        <Container className="relative">
          <div className="grid gap-8 md:grid-cols-12 md:gap-10">
            <div className="md:col-span-4">
              <MonoTag className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="size-1.5 shrink-0 bg-primary"
                />
                Customer story
              </MonoTag>
              <PullQuoteAttribution className="mt-6 flex items-center gap-3">
                <PullQuoteAvatar className="grid size-12 shrink-0 place-items-center rounded-none border border-foreground bg-background font-mono text-sm font-bold text-foreground shadow-[4px_4px_0_0] shadow-foreground">
                  {initials}
                </PullQuoteAvatar>
                <div className="min-w-0 text-left">
                  <PullQuoteName className="text-sm font-bold tracking-tight text-foreground">
                    {name}
                  </PullQuoteName>
                  <PullQuoteRole className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {role}
                  </PullQuoteRole>
                </div>
              </PullQuoteAttribution>
            </div>
            <figure className="md:col-span-8">
              <PullQuoteText className="border-l-2 border-primary pl-6 text-2xl font-bold leading-snug tracking-tight text-balance text-foreground sm:text-3xl lg:text-[2.25rem]">
                &ldquo;{quote}&rdquo;
              </PullQuoteText>
            </figure>
          </div>
        </Container>
      </PullQuote>
    )
  },
})
