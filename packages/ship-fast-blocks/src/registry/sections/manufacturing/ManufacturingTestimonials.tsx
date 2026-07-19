import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * ManufacturingTestimonials — a two-tier testimonials grid for a precision-
 * manufacturing site. A centered eyebrow + heading intro sits above a row of
 * three featured quote cards (5-star rating, full quote, avatar + name + role)
 * and, beneath, a row of three compact quote cards (short quote, smaller avatar
 * + name + role). Bordered, muted cards with alt-driven avatars. Clean, neutral,
 * trustworthy. Use to surface engineer and procurement social proof on machine-
 * shop or contract-manufacturer pages. Renders fully with no props via baked-in
 * defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Card } from '#/section-kit/Card.tsx'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
export const ManufacturingTestimonials = defineCapsule({
  name: 'ManufacturingTestimonials',
  description:
    'A two-tier testimonials grid for a precision-manufacturing site: a centered eyebrow + heading intro above a row of three featured quote cards (5-star rating, full quote, avatar + name + role) and, beneath, a row of three compact quote cards (short quote, smaller avatar + name + role). Bordered, muted cards with alt-driven avatars. Clean, neutral, trustworthy. Use to surface engineer and procurement social proof on machine-shop or contract-manufacturer pages.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    featured: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          role: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    compact: z
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
    const eyebrow = props.eyebrow ?? 'Testimonials'
    const heading =
      props.heading ?? 'Trusted by Engineers and Procurement Teams'
    const featured = props.featured?.length
      ? props.featured
      : [
          {
            quote:
              'Vertex has been our go-to machine shop for aerospace brackets for 8 years. Their AS9100 certification and attention to detail gives us confidence every time. Zero defects on 15,000+ parts shipped.',
            name: 'Michael Chen',
            role: 'Senior Manufacturing Engineer, Boeing Defense',
            avatarAlt:
              'Professional headshot of Michael Chen, Senior Manufacturing Engineer',
          },
          {
            quote:
              'When we needed 500 EV heat sinks turned around in two weeks for a prototype build, Vertex delivered. Their online portal made tracking progress effortless. Highly recommend for automotive programs.',
            name: 'Sarah Martinez',
            role: 'Supply Chain Director, Rivian Automotive',
            avatarAlt:
              'Professional headshot of Sarah Martinez, Supply Chain Director',
          },
          {
            quote:
              'Vertex helped us redesign a critical surgical instrument for manufacturability, cutting our cost by 40% while improving the ergonomics. Their engineering team is world-class.',
            name: 'Dr. James Wilson',
            role: 'Chief of Orthopedic Surgery, Mayo Clinic',
            avatarAlt:
              'Professional headshot of Dr. James Wilson, Chief of Orthopedic Surgery',
          },
        ]
    const compact = props.compact?.length
      ? props.compact
      : [
          {
            quote:
              'The ITAR compliance and secure facility made Vertex our preferred supplier for classified defense components. Documentation is always flawless.',
            name: 'Robert Thompson',
            role: 'Program Manager, Lockheed Martin',
            avatarAlt:
              'Professional headshot of Robert Thompson, Program Manager at Lockheed Martin',
          },
          {
            quote:
              "We've reduced lead times from 8 weeks to 3 weeks on our valve bodies since partnering with Vertex. Their capacity planning is exceptional.",
            name: 'Jennifer Kim',
            role: 'VP Operations, Halliburton',
            avatarAlt:
              'Professional headshot of Jennifer Kim, VP Operations at Halliburton',
          },
          {
            quote:
              'From small R&D batches to 10,000-unit production runs, Vertex scales with us. Consistent quality across every order size.',
            name: 'David Patel',
            role: 'CTO, Figure AI Robotics',
            avatarAlt:
              'Professional headshot of David Patel, CTO of robotics startup',
          },
        ]
    return (
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <Container>
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            className="mb-16 max-w-3xl gap-0"
            eyebrowClassName="tracking-wider text-muted-foreground"
            titleClassName="mt-3 tracking-tight sm:text-4xl"
          />
          <TestimonialGrid columns={3}>
            {featured.map((t) => {
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
                <TestimonialCard key={__iv__.name}>
                  <TestimonialQuote>{__iv__.quote}</TestimonialQuote>
                  <TestimonialAuthor>
                    <TestimonialName>{__iv__.name}</TestimonialName>
                    {(__iv__.role || __iv__.company || __iv__.meta) && (
                      <TestimonialMeta>
                        {__iv__.role || __iv__.company || __iv__.meta}
                      </TestimonialMeta>
                    )}
                  </TestimonialAuthor>
                </TestimonialCard>
              )
            })}
          </TestimonialGrid>
          <ResponsiveGrid cols="1-md-3" gap="md" className="mt-12">
            {compact.map((t) => (
              <Card
                asChild
                key={t.name}
                variant="muted"
               className="rounded-lg">
                <blockquote>
                  <p className="mb-4 text-sm leading-relaxed text-foreground">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <footer className="flex items-center gap-3">
                    <Image
                      alt={t.avatarAlt}
                      w={100}
                      h={100}
                      loading="lazy"
                      className="size-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {t.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </footer>
                </blockquote>
              </Card>
            ))}
          </ResponsiveGrid>
        </Container>
      </section>
    )
  },
})
