import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * ManufacturingTestimonials — a heavy-industrial two-tier testimonials grid for a
 * precision-manufacturing site. An asymmetric header (mono index eyebrow + giant
 * heading left, mono count right) sits above a giant ghost quotation watermark
 * and a row of three featured quote slabs (hard borders + offset shadow, full
 * quote, mono attribution) and, beneath, a row of three compact quote slabs
 * (short quote, small alt-driven avatar, mono name + role). Tech-brutalist,
 * binary-radius, trustworthy. Use to surface engineer and procurement social
 * proof on machine-shop or contract-manufacturer pages. Renders fully with no
 * props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
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
    'A heavy-industrial two-tier testimonials grid for a precision-manufacturing site: an asymmetric header (mono index eyebrow + giant heading left, mono count right) above a giant ghost quotation watermark and a row of three featured quote slabs (hard borders + offset shadow, full quote, mono attribution) and, beneath, a row of three compact quote slabs (short quote, small alt-driven avatar, mono name + role). Tech-brutalist, binary-radius, trustworthy. Use to surface engineer and procurement social proof on machine-shop or contract-manufacturer pages.',
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
      <section
        className={cn(
          'relative overflow-hidden bg-background py-20 lg:py-28',
          props.className,
        )}
      >
        <Watermark className="-left-4 top-2 text-[10rem] leading-none sm:text-[16rem]">
          &ldquo;
        </Watermark>
        <Container className="relative">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              className="max-w-3xl gap-0"
              eyebrowClassName="font-mono uppercase tracking-[0.2em] text-muted-foreground"
              titleClassName="mt-3 font-extrabold uppercase tracking-tight sm:text-4xl"
            />
            <MonoTag
              aria-hidden="true"
              className="shrink-0 md:mb-2 md:text-right"
            >
              {String(featured.length + compact.length).padStart(2, '0')} /
              Voices
            </MonoTag>
          </div>
          <TestimonialGrid columns={3}>
            {featured.map((t, i) => {
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
                  className="rounded-none border-2 border-foreground bg-card shadow-[6px_6px_0_0] shadow-foreground transition-[transform,box-shadow] duration-150 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[8px_8px_0_0] motion-reduce:transform-none"
                >
                  <MonoTag aria-hidden="true" className="block">
                    {String(i + 1).padStart(2, '0')} / Featured
                  </MonoTag>
                  <TestimonialQuote className="text-base leading-relaxed">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="mt-auto border-t-2 border-foreground pt-4">
                    <TestimonialName className="font-bold uppercase tracking-tight">
                      {__iv__.name}
                    </TestimonialName>
                    {(__iv__.role || __iv__.company || __iv__.meta) && (
                      <TestimonialMeta className="font-mono text-[11px] uppercase tracking-[0.12em]">
                        {__iv__.role || __iv__.company || __iv__.meta}
                      </TestimonialMeta>
                    )}
                  </TestimonialAuthor>
                </TestimonialCard>
              )
            })}
          </TestimonialGrid>
          <ResponsiveGrid
            cols="1-md-3"
            className="mt-8 gap-0 border-l-2 border-t-2 border-foreground"
          >
            {compact.map((t) => (
              <Card
                asChild
                key={t.name}
                variant="muted"
                className="rounded-none border-0 border-b-2 border-r-2 border-foreground bg-card"
              >
                <blockquote>
                  <p className="mb-4 text-sm leading-relaxed text-foreground">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <footer className="flex items-center gap-3 border-t-2 border-foreground pt-4">
                    <Image
                      alt={t.avatarAlt}
                      w={100}
                      h={100}
                      loading="lazy"
                      className="size-10 rounded-none border-2 border-foreground object-cover"
                    />
                    <div>
                      <p className="text-sm font-bold uppercase tracking-tight text-foreground">
                        {t.name}
                      </p>
                      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        {t.role}
                      </p>
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
