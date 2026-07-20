import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

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

/**
 * CybersecurityTestimonials — terminal-stealth field-report wall. A light
 * section opening with a hairline mono meta rule ("FIELD REPORTS" + tabular
 * source count) above an asymmetric header (left-aligned heading + lede, mono
 * "[ SOURCES VERIFIED ]" tag right). Reports render as square-edged, bordered
 * transmission cards in a staggered 2-to-3 column grid (middle column shifts
 * down at desktop): each card opens with a mono "[ VERIFIED ]" + "TX-0X" meta
 * row over a hairline rule, then the verbatim quote, and closes with the
 * alt-driven grayscale avatar beside the leader's name and mono role line.
 * Pure display, no links, no star ratings, no glows. Use to deliver
 * authoritative social proof for cybersecurity vendors, SOC/MDR providers, or
 * any enterprise B2B security SaaS. Renders fully with no props via baked-in
 * CISO-quote defaults.
 */
export const CybersecurityTestimonials = defineCapsule({
  name: 'CybersecurityTestimonials',
  description:
    "Terminal-stealth field-report testimonial wall: a light section with a mono meta rule and asymmetric left-aligned header above a staggered 2-to-3 column grid of square-edged transmission cards, each opening with a mono '[ VERIFIED ]' + 'TX-0X' meta row, then the verbatim quote, then an alt-driven grayscale avatar beside the leader's name and mono role. Pure display, no links. Use to deliver authoritative social proof for cybersecurity vendors, SOC/MDR providers, or any enterprise B2B security SaaS.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description under the heading. */
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
    const heading = props.heading ?? 'Trusted by security leaders'
    const description =
      props.description ??
      'See what CISOs and security teams say about SentinelGuard'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              '"SentinelGuard detected a sophisticated APT attack that our previous vendor missed for 3 weeks. Their AI caught the lateral movement within 4 minutes. That response time saved us millions."',
            name: 'Michael Chen',
            role: 'CISO, FinTech Solutions Inc.',
            avatarAlt:
              'Professional headshot of Michael Chen, a middle-aged Asian-American male executive with short black hair wearing a navy suit',
          },
          {
            quote:
              '"The compliance automation alone paid for the platform in 3 months. What used to take our team 2 weeks of manual work for SOC 2 audits now happens automatically. Game changer."',
            name: 'Sarah Williams',
            role: 'VP Security, HealthCloud Systems',
            avatarAlt:
              'Professional headshot of Sarah Williams, a professional Caucasian woman with shoulder-length brown hair wearing business attire',
          },
          {
            quote:
              '"We evaluated 12 vendors before choosing SentinelGuard. Their zero-trust implementation was the most seamless, and their SOC team\'s expertise is unmatched. Our mean time to respond dropped 87%."',
            name: 'David Rodriguez',
            role: 'Director of Security, RetailMax Corp',
            avatarAlt:
              'Professional headshot of David Rodriguez, a Hispanic male security director in his 40s with glasses and a beard wearing a dark suit',
          },
          {
            quote:
              '"The cloud security posture management caught 147 misconfigurations in our first week. Without SentinelGuard, we would have been exposed to data exfiltration through S3 bucket leaks."',
            name: 'Emily Watson',
            role: 'Cloud Security Lead, DataStream AI',
            avatarAlt:
              'Professional headshot of Emily Watson, a young Caucasian woman with blonde hair pulled back wearing a professional blazer',
          },
          {
            quote:
              '"Their API security stopped a credential stuffing attack on our payment endpoints that would have compromised 40,000 customer accounts. The automated blocking kicked in within seconds."',
            name: 'James Park',
            role: 'CTO, PayFlow Technologies',
            avatarAlt:
              'Professional headshot of James Park, an Asian male CTO in his 30s with short black hair wearing a casual button-up shirt',
          },
          {
            quote:
              '"After migrating from a legacy SIEM, we reduced our security tooling costs by 60% while improving detection accuracy. The unified platform eliminated data silos between our security tools."',
            name: 'Robert Kim',
            role: 'IT Director, Global Logistics Partners',
            avatarAlt:
              'Professional headshot of Robert Kim, a Korean-American male IT director in his 50s with graying hair wearing glasses and a suit',
          },
        ]

    return (
      <section
        className={cn('bg-background py-16 sm:py-20 lg:py-24', props.className)}
      >
        <Container>
          <div className="mb-8 flex items-center justify-between gap-4 border-b border-border pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground sm:mb-10">
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="size-2 bg-primary" />
              Field reports
            </span>
            <span aria-hidden="true" className="tabular-nums">
              n={String(items.length).padStart(2, '0')}
            </span>
          </div>
          <div className="mb-10 flex flex-col gap-6 sm:mb-14 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-3"
              titleClassName="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl"
              subtitleClassName="max-w-xl text-base text-muted-foreground sm:text-lg"
            />
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
            >
              [ sources verified ]
            </p>
          </div>
          <TestimonialGrid columns={3} className="lg:pb-8">
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
                    'gap-4 rounded-none border-border bg-card p-6 transition-colors duration-150 hover:border-foreground/40 sm:p-7',
                    i % 3 === 1 && 'lg:translate-y-8',
                  )}
                >
                  <p
                    aria-hidden="true"
                    className="flex items-center justify-between gap-4 border-b border-border pb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70"
                  >
                    <span>[ verified ]</span>
                    <span className="tabular-nums">
                      tx-{String(i + 1).padStart(2, '0')}
                    </span>
                  </p>
                  <TestimonialQuote className="text-[15px] leading-relaxed">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="gap-3 border-t border-border pt-4">
                    {__iv__.avatarAlt && (
                      <Image
                        alt={__iv__.avatarAlt}
                        w={80}
                        h={80}
                        className="size-10 shrink-0 rounded-none border border-border object-cover grayscale"
                      />
                    )}
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <TestimonialName className="font-bold tracking-tight">
                        {__iv__.name}
                      </TestimonialName>
                      {(__iv__.role || __iv__.company || __iv__.meta) && (
                        <TestimonialMeta className="font-mono text-[10px] uppercase tracking-[0.12em]">
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
