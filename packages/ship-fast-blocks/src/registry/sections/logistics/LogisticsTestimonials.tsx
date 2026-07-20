import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * LogisticsTestimonials — an industrial-manifest customer log for a global-
 * logistics / freight-forwarding company. An asymmetric header (left-aligned
 * heading + lede, mono `$ tail -f shippers.log` meta right) above a staggered
 * 3-column grid of square-cornered log-entry cards (middle card shifted down on
 * desktop). Each card opens with an inverted mono title bar (`log / entry NN` +
 * square status dot), then the blockquote, then an attribution row with a square
 * grayscale alt-driven avatar image, name, and mono role label. Precise and
 * operational, tokens-only. Use as social proof for logistics, freight-
 * forwarding, shipping, courier, warehousing or cargo/transport companies.
 * Renders fully with no props via alt-driven avatars.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'
export const LogisticsTestimonials = defineCapsule({
  name: 'LogisticsTestimonials',
  description:
    'Industrial-manifest customer log for a global-logistics / freight-forwarding company: an asymmetric header (left heading + lede, mono meta right) above a staggered 3-column grid of square-cornered log-entry cards (middle card shifted down on desktop). Each card opens with an inverted mono title bar, then a blockquote, then an attribution row with a square grayscale alt-driven avatar image, name, and mono role label. Precise and operational, tokens-only. Use as social proof for logistics, freight-forwarding, shipping, courier, warehousing, supply-chain or cargo/transport companies.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
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
    const heading = props.heading ?? 'Trusted by shippers worldwide'
    const description =
      props.description ??
      'What our customers say about working with SwiftFreight.'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              "SwiftFreight has been our logistics partner for 6 years. Their real-time tracking and proactive communication have eliminated the 'where's my shipment?' anxiety completely.",
            name: 'Sarah Chen',
            role: 'VP Operations, TechFlow Inc.',
            avatarAlt:
              'Professional headshot of a smiling businesswoman in a navy blazer',
          },
          {
            quote:
              "When we needed to move 40 containers from Ningbo to Rotterdam in 48 hours, SwiftFreight chartered a vessel. That level of responsiveness is why we've tripled our volume with them.",
            name: 'Marcus Weber',
            role: 'Director of Logistics, Globex Trading',
            avatarAlt:
              'Professional headshot of a middle-aged businessman with glasses and a confident smile',
          },
          {
            quote:
              "Their customs brokerage team saved us from a $15,000 duty miscalculation. They caught the HS code error before the shipment left Shanghai. That's partnership.",
            name: 'Elena Rodriguez',
            role: 'Import Manager, Acme Corporation',
            avatarAlt:
              'Professional headshot of a young woman with dark hair wearing a white blouse',
          },
        ]
    return (
      <section
        className={cn(
          'overflow-hidden py-14 sm:py-20 lg:py-24',
          props.className,
        )}
      >
        <Container>
          <div className="mb-10 flex flex-col gap-4 sm:mb-14 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-3"
              titleClassName="text-3xl font-extrabold tracking-tight lg:text-4xl"
              subtitleClassName="text-lg text-muted-foreground"
            />
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
            >
              <span className="text-primary">$</span> tail -f shippers.log
            </p>
          </div>

          <TestimonialGrid columns={3} className="lg:pb-10">
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
                    'gap-0 rounded-none border border-border bg-card p-0 shadow-none',
                    i % 3 === 1 && 'lg:translate-y-10',
                  )}
                >
                  <div
                    aria-hidden="true"
                    className="flex items-center justify-between bg-foreground px-4 py-2 text-background"
                  >
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em]">
                      log / entry {`0${i + 1}`.slice(-2)}
                    </span>
                    <span className="size-1.5 bg-background/80" />
                  </div>
                  <div className="flex flex-1 flex-col gap-5 p-5 sm:p-6">
                    <TestimonialQuote className="text-sm leading-relaxed text-foreground">
                      {__iv__.quote}
                    </TestimonialQuote>
                    <TestimonialAuthor className="mt-auto gap-3 border-t border-border pt-4">
                      {__iv__.avatarAlt && (
                        <Image
                          alt={__iv__.avatarAlt}
                          w={80}
                          h={80}
                          className="size-9 shrink-0 rounded-none object-cover grayscale"
                        />
                      )}
                      <span className="flex min-w-0 flex-col">
                        <TestimonialName className="text-sm font-semibold tracking-tight">
                          {__iv__.name}
                        </TestimonialName>
                        {(__iv__.role || __iv__.company || __iv__.meta) && (
                          <TestimonialMeta className="font-mono text-[10px] uppercase tracking-[0.12em]">
                            {__iv__.role || __iv__.company || __iv__.meta}
                          </TestimonialMeta>
                        )}
                      </span>
                    </TestimonialAuthor>
                  </div>
                </TestimonialCard>
              )
            })}
          </TestimonialGrid>
        </Container>
      </section>
    )
  },
})
