import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * CorporateTestimonials — Swiss-corporate proof ledger for an enterprise /
 * corporate B2B site. A double-rule asymmetric header (mono "05 / Proof"
 * index, left-aligned heading, lede in the offset right column) above a
 * 1/2/3-column grid of square-edged hairline testimonial cards; the middle
 * card rises on a calculated offset (the section's rupture). Each card opens
 * with a mono tabular index numeral and a giant ghost quote mark, carries the
 * quote, and closes with a hairline-topped footer of a square grayscale
 * avatar photo, name, and mono role label. Use to build social proof on SaaS,
 * consultancy, or managed services landing pages.
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
export const CorporateTestimonials = defineCapsule({
  name: 'CorporateTestimonials',
  description:
    'Swiss-corporate proof ledger for an enterprise / corporate B2B site: a double-rule asymmetric header (mono index, left-aligned heading, offset lede) above a 1/2/3-column grid of square-edged hairline testimonial cards with the middle card offset upward. Each card opens with a mono tabular index numeral and a giant ghost quote mark, carries the quote, and closes with a hairline-topped footer of square grayscale avatar photo, name, and mono role label. Use to build social proof on SaaS, consultancy, or managed services landing pages.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
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
    const heading = props.heading ?? 'Trusted by industry leaders'
    const description =
      props.description ??
      'See how leading organizations transformed their operations with Nexus.'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              "Nexus transformed our infrastructure in just 90 days. We reduced operational costs by 40% while improving system reliability. Their team's expertise is unmatched in the industry.",
            name: 'Michael Chen',
            role: 'CTO, Meridian Financial Group',
            avatarAlt:
              'Professional headshot of a smiling male executive in business attire',
          },
          {
            quote:
              'The security and compliance features gave our board complete confidence. We passed our SOC 2 audit with zero findings—a first for our company. Nexus made it possible.',
            name: 'Sarah Williams',
            role: 'CISO, Horizon Healthcare Systems',
            avatarAlt:
              'Professional headshot of a female executive with confident expression',
          },
          {
            quote:
              'We evaluated 12 vendors before choosing Nexus. Their analytics platform helped us identify $3.2M in operational inefficiencies within the first quarter.',
            name: 'David Park',
            role: 'COO, Pacific Logistics Inc.',
            avatarAlt:
              'Professional headshot of a middle-aged male business leader with glasses',
          },
        ]
    return (
      <section className={cn('bg-background py-16 lg:py-28', props.className)}>
        <Container>
          <div className="mb-10 grid gap-6 border-b border-border pb-8 sm:mb-14 lg:mb-20 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-5">
              <span
                aria-hidden="true"
                className="mb-4 block font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
              >
                05 / Proof
              </span>
              <SectionHeading
                align="left"
                title={heading}
                className="gap-0"
                titleClassName="text-3xl font-semibold tracking-tight sm:text-4xl"
              />
            </div>
            <p className="text-lg leading-relaxed text-muted-foreground lg:col-span-6 lg:col-start-7 lg:self-end">
              {description}
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
                    'relative gap-5 overflow-hidden rounded-none bg-background p-6 sm:p-8',
                    i % 3 === 1 && 'lg:-translate-y-6',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-2 -top-7 select-none font-serif text-[7rem] leading-none text-foreground/[0.05]"
                  >
                    &ldquo;
                  </span>
                  <span
                    aria-hidden="true"
                    className="font-mono text-[11px] uppercase tracking-[0.2em] tabular-nums text-primary"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <TestimonialQuote>{__iv__.quote}</TestimonialQuote>
                  <TestimonialAuthor className="border-t border-border pt-5">
                    {__iv__.avatarAlt && (
                      <Image
                        alt={__iv__.avatarAlt}
                        w={80}
                        h={80}
                        className="size-10 shrink-0 rounded-none border border-border object-cover grayscale"
                      />
                    )}
                    <span className="flex min-w-0 flex-col">
                      <TestimonialName>{__iv__.name}</TestimonialName>
                      {(__iv__.role || __iv__.company || __iv__.meta) && (
                        <TestimonialMeta className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-[0.14em]">
                          {__iv__.role || __iv__.company || __iv__.meta}
                        </TestimonialMeta>
                      )}
                    </span>
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
