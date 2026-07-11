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
    const Star = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
        className="text-chart-4"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )
    return (
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {eyebrow}
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {heading}
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {featured.map((t) => (
              <blockquote
                key={t.name}
                className="rounded-lg border border-border bg-muted p-6"
              >
                <div className="mb-4 flex items-center gap-1">
                  {[0, 1, 2, 3, 4].map((n) => (
                    <Star key={n} />
                  ))}
                </div>
                <p className="mb-6 leading-relaxed text-foreground">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <footer className="flex items-center gap-4">
                  <Image
                    alt={t.avatarAlt}
                    w={100}
                    h={100}
                    loading="lazy"
                    className="size-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-foreground">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {compact.map((t) => (
              <blockquote
                key={t.name}
                className="rounded-lg border border-border bg-muted p-6"
              >
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
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
