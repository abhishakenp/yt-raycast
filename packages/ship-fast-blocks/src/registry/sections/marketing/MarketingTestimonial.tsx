import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  PullQuote,
  PullQuoteAttribution,
  PullQuoteAvatar,
  PullQuoteIcon,
  PullQuoteName,
  PullQuoteRole,
  PullQuoteText,
} from '#/section-kit/PullQuote.tsx'
import { Card } from '#/section-kit/Card.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * MarketingTestimonial — a single large, centered testimonial card for a SaaS /
 * product-marketing landing page. Sits on a soft muted-to-background gradient
 * band; a rounded bordered card centers a circular indigo quote glyph above a
 * big balanced blockquote, with an initials avatar (gradient tile) + name +
 * role beneath. Clean premium indigo-on-light aesthetic. Use as a focused
 * social-proof / customer-quote section between features and pricing on B2B
 * SaaS, productivity, or developer-platform pages.
 */
export const MarketingTestimonial = defineCapsule({
  name: 'MarketingTestimonial',
  description:
    'Single large, centered testimonial card for a SaaS / product-marketing landing page: on a soft muted-to-background gradient band, a rounded bordered card centers a circular indigo quote glyph above a big balanced blockquote, with an initials avatar (gradient tile) + name + role beneath. Clean premium indigo-on-light aesthetic. Use as a focused social-proof / customer-quote section between features and pricing on B2B SaaS, productivity, or developer-platform pages.',
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

    return (
      <PullQuote variant="gradient" className={cn('py-20', props.className)}>
        <Container size="lg" className="px-6 lg:px-6">
          <Card
            asChild
            variant="default"
            className="relative mx-auto max-w-3xl px-8 py-12 text-center shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] sm:px-10 rounded-2xl p-0"
          >
            <figure>
              <PullQuoteIcon>
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
              </PullQuoteIcon>
              <PullQuoteText>&ldquo;{quote}&rdquo;</PullQuoteText>
              <figcaption>
                <PullQuoteAttribution>
                  <PullQuoteAvatar>
                    {name
                      .split(' ')
                      .map((w) => w.charAt(0))
                      .join('')
                      .slice(0, 2)}
                  </PullQuoteAvatar>
                  <div className="text-left">
                    <PullQuoteName>{name}</PullQuoteName>
                    <PullQuoteRole>{role}</PullQuoteRole>
                  </div>
                </PullQuoteAttribution>
              </figcaption>
            </figure>
          </Card>
        </Container>
      </PullQuote>
    )
  },
})
