import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * CryptoTestimonials — 6-up customer testimonial grid for a crypto / DeFi
 * landing page. A centered heading + description in a bordered card band
 * followed by a responsive three-column card grid. Each card shows an alt-
 * driven avatar image, the person's name and role, and a quoted paragraph.
 * Use for social proof from protocol users, institutional clients, or
 * developer partners.
 */
export const CryptoTestimonials = defineCapsule({
  name: 'CryptoTestimonials',
  description:
    "6-up customer testimonial grid for a crypto / DeFi landing page: centered heading + description in a bordered card band, then a responsive three-column card grid. Each card shows an alt-driven avatar image, the person's name and role, and a quoted paragraph. Use for social proof from protocol users, institutional clients, or developer partners.",
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
          'border-y border-border bg-card py-20 lg:py-32',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((t) => (
              <div
                key={t.name}
                className="rounded-xl border border-border bg-muted p-6"
              >
                <div className="mb-4 flex items-center gap-4">
                  <Image
                    alt={t.avatarAlt}
                    w={96}
                    h={96}
                    loading="lazy"
                    className="size-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold">{t.name}</h4>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
