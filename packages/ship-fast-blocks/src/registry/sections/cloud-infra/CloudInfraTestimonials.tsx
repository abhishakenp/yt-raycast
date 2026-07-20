import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * CloudInfraTestimonials — terminal-industrial customer log for a cloud-
 * infrastructure / developer-platform SaaS landing page. An asymmetric header
 * (left-aligned heading + description, mono `tail -f` meta right) above a
 * staggered 3-column grid of square-cornered log-entry cards (middle card
 * shifted down on desktop). Each card opens with an inverted mono title bar
 * (`log / entry NN` + square status dot), then the blockquote, then an
 * attribution row with a square grayscale alt-driven avatar image, name, and
 * mono role label. Tokens-only. Renders fully on zero arguments.
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
export const CloudInfraTestimonials = defineCapsule({
  name: 'CloudInfraTestimonials',
  description:
    'Terminal-industrial customer log for a cloud-infrastructure / developer-platform SaaS landing page: an asymmetric header above a staggered 3-column grid of square-cornered log-entry cards (middle card shifted down on desktop). Each card opens with an inverted mono title bar, then a blockquote, then an attribution row with a square grayscale alt-driven avatar image, name, and mono role label. Tokens-only. Use for social-proof, customer-endorsement bands on cloud hosting, IaaS, PaaS, serverless, or developer-tooling sites.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Testimonial cards: quote, name, role, avatarAlt. */
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
    const heading = props.heading ?? 'Loved by engineering leaders'
    const description =
      props.description ?? 'See what teams say about building on CloudShift.'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'We migrated our entire microservices stack from AWS to CloudShift and cut our infrastructure costs by 34%. The per-second billing made a huge difference for our batch processing workloads.',
            name: 'David Chen',
            role: 'VP Engineering, StripeScale',
            avatarAlt:
              'Professional headshot of David Chen, VP of Engineering at FinTech startup',
          },
          {
            quote:
              "The serverless functions cold start at 89ms—faster than anything we've tested. Our API response times dropped from 400ms to under 120ms after switching to CloudShift's edge deployment.",
            name: 'Sarah Miller',
            role: 'CTO, NeuralPath AI',
            avatarAlt:
              'Professional headshot of Sarah Miller, CTO at AI startup',
          },
          {
            quote:
              "We needed HIPAA-compliant infrastructure for our healthcare platform. CloudShift's compliance documentation and BAA process was the smoothest we've experienced. Live in 2 days.",
            name: 'Dr. Marcus Johnson',
            role: 'Founder, CareSync Health',
            avatarAlt:
              'Professional headshot of Dr. Marcus Johnson, founder of healthcare startup',
          },
        ]
    return (
      <section
        className={cn(
          'overflow-hidden bg-muted/40 py-14 sm:py-20 lg:py-28',
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
              titleClassName="text-3xl font-extrabold tracking-tight sm:text-4xl"
              subtitleClassName="text-base sm:text-lg"
            />
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
            >
              <span className="text-primary">$</span> tail -f customers.log
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
                    'gap-0 rounded-none border border-border bg-background p-0 shadow-none',
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
