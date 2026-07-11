import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { Card } from '#/section-kit/Card.tsx'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

import { Container } from '#/section-kit/Container.tsx'

/**
 * CybersecurityTestimonials — CISO / security-leader testimonial wall. A light
 * section with a centered heading + subheading above a responsive 2-to-3 column
 * grid of muted, bordered quote cards. Each card stacks a 5-star rating, a
 * verbatim quote, then an alt-driven avatar beside the leader's name and role.
 * Pure display, no links. Use to deliver authoritative social proof for
 * cybersecurity vendors, SOC/MDR providers, or any enterprise B2B security
 * SaaS. Renders fully with no props via baked-in CISO-quote defaults.
 */
export const CybersecurityTestimonials = defineCapsule({
  name: 'CybersecurityTestimonials',
  description:
    "CISO / security-leader testimonial wall: a light section with a centered heading + subheading above a responsive 2-to-3 column grid of muted, bordered quote cards, each stacking a 5-star rating, a verbatim quote, then an alt-driven avatar beside the leader's name and role. Pure display, no links. Use to deliver authoritative social proof for cybersecurity vendors, SOC/MDR providers, or any enterprise B2B security SaaS.",
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

    const Star = ({ className }: { className?: string }) => (
      <svg
        className={className}
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    return (
      <section className={cn('bg-background py-24', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">{heading}</h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((t) => (
              <Card
                key={t.name}
                variant="muted"
                rounded="2xl"
                padding="lg"
                className="bg-muted/50"
              >
                <div className="mb-4 flex gap-1" aria-label="5 star rating">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-5 text-chart-4" />
                  ))}
                </div>
                <p className="mb-6 leading-relaxed text-foreground/80">
                  {t.quote}
                </p>
                <div className="flex items-center gap-4">
                  <Image
                    alt={t.avatarAlt}
                    w={100}
                    h={100}
                    loading="lazy"
                    className="size-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
