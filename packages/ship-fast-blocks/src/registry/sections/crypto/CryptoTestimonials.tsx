import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'

/**
 * CryptoTestimonials — Web3-terminal signal-log testimonial grid for a
 * crypto / DeFi landing page. An asymmetric header (left-aligned heading +
 * description, mono "[ SIGNALS ] VERIFIED SOURCES" meta right) above a
 * three-column grid of square-cornered hairline cards; even desktop cards
 * are staggered downward. Each card opens with a mono zero-padded log index
 * and a primary tick, then the quote, and closes with a hairline-topped
 * author row (mono uppercase name + role). A giant ghost quote watermark
 * backs the band. Use for social proof from protocol users, institutional
 * clients, or developer partners.
 */
export const CryptoTestimonials = defineCapsule({
  name: 'CryptoTestimonials',
  description:
    'Web3-terminal signal-log testimonial grid for a crypto / DeFi landing page: asymmetric left-aligned header with mono meta label, then a three-column grid of square-cornered hairline cards with staggered even columns — each opening with a mono zero-padded log index and primary tick, the quote, and a hairline-topped author row with mono uppercase name + role, backed by a giant ghost quote watermark. Use for social proof from protocol users, institutional clients, or developer partners.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Section description. */
    description: z.string().optional(),
    /** Testimonial cards (name, role, avatarAlt, quote). */
    items: z
      .array(
        z.object({
          name: z.string(),
          role: z.string(),
          avatarAlt: z.string(),
          quote: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Trusted by DeFi leaders'
    const description =
      props.description ??
      'Protocols and institutions building on NexusChain infrastructure.'
    const items = props.items?.length
      ? props.items
      : [
          {
            name: 'Marcus Chen',
            role: 'CTO, Vertex Finance',
            avatarAlt:
              'Professional headshot of Marcus Chen, a fintech CTO with glasses and short black hair',
            quote:
              "NexusChain cut our settlement costs by 80%. We process $200M daily volume and haven't had a single failed transaction in 6 months.",
          },
          {
            name: 'Sarah Williams',
            role: 'Product Director, BlockVault',
            avatarAlt:
              'Professional headshot of Sarah Williams, a product director with blonde hair wearing professional attire',
            quote:
              'The cross-chain bridge saved us months of engineering. Integration took 3 days, and our users love the instant finality.',
          },
          {
            name: 'David Park',
            role: 'Lead Architect, StakeStream',
            avatarAlt:
              'Professional headshot of David Park, a blockchain architect with beard and dark hair',
            quote:
              "We've deployed 14 protocols on NexusChain. The developer tooling is the best in the industry—comprehensive docs and responsive support.",
          },
          {
            name: 'James Rodriguez',
            role: 'Founder, YieldMatrix',
            avatarAlt:
              'Professional headshot of James Rodriguez, a DeFi founder with short brown hair and warm smile',
            quote:
              'The security audits and formal verification tools gave our institutional clients the confidence they needed. TVL grew 400% in Q2.',
          },
          {
            name: 'Elena Vasquez',
            role: 'Managing Partner, Digital Assets Fund',
            avatarAlt:
              'Professional headshot of Elena Vasquez, a crypto fund manager with dark curly hair and confident expression',
            quote:
              "We custody $180M through NexusChain's MPC infrastructure. The institutional-grade security and compliance tools are unmatched.",
          },
          {
            name: 'Michael Foster',
            role: 'Protocol Engineer, ChainWeave',
            avatarAlt:
              'Professional headshot of Michael Foster, a protocol engineer with light hair and friendly smile',
            quote:
              'The real-time analytics dashboard caught a potential MEV attack before it happened. That alone paid for our infrastructure costs.',
          },
        ]

    return (
      <section
        className={cn(
          'relative overflow-hidden border-y border-border bg-card py-16 lg:py-28',
          props.className,
        )}
      >
        <Watermark className="-left-6 top-4 font-serif text-[10rem] sm:text-[16rem]">
          &ldquo;
        </Watermark>
        <Container className="relative">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-3"
              titleClassName="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl"
              subtitleClassName="text-lg"
            />
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
            >
              [ signals ] verified sources
            </p>
          </div>
          <TestimonialGrid columns={3}>
            {items.map((t, i) => {
              const __iv__ = t as {
                quote: string
                name: string
                role?: string
                company?: string
                meta?: string
                rating?: number
                avatarAlt?: string
              }
              return (
                <TestimonialCard
                  key={__iv__.name}
                  className={cn(
                    'gap-5 rounded-none bg-background p-7 hover:border-foreground/30',
                    i % 2 === 1 && 'lg:mt-8',
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground tabular-nums">
                      log/0{i + 1}
                    </span>
                    <span aria-hidden="true" className="h-1 w-6 bg-primary" />
                  </div>
                  <TestimonialQuote className="text-base leading-relaxed">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="flex-col items-start gap-1 border-t border-border pt-4">
                    <TestimonialName className="font-mono text-xs font-semibold uppercase tracking-[0.15em]">
                      {__iv__.name}
                    </TestimonialName>
                    {(__iv__.role || __iv__.company || __iv__.meta) && (
                      <TestimonialMeta className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                        {__iv__.role || __iv__.company || __iv__.meta}
                      </TestimonialMeta>
                    )}
                  </TestimonialAuthor>
                </TestimonialCard>
              )
            })}
          </TestimonialGrid>
        </Container>
      </section>
    )
  },
})
