import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * FilmDirectorTestimonials — a client-testimonial grid for a film director or
 * cinematographer. A centered section header (thin heading + muted lede) above
 * a responsive 1/2/3-column grid of bordered cards, each with a round avatar +
 * name + role header and an italic muted quote. Avatars use the alt-driven
 * Image component. Use as social proof from creative directors, brand managers,
 * artists, and fellow filmmakers for directors, cinematographers, DPs, or
 * production houses.
 */
import { Container } from '#/section-kit/Container.tsx'
export const FilmDirectorTestimonials = defineCapsule({
  name: 'FilmDirectorTestimonials',
  description:
    'Client-testimonial grid for a film director or cinematographer: a centered section header (thin heading + muted lede) above a responsive 1/2/3-column grid of bordered cards, each with a round avatar + name + role header and an italic muted quote. Avatars use the Image component. Use as social proof from creative directors, brand managers, artists, and fellow filmmakers for directors, cinematographers, DPs, or production houses.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(
        z.object({
          name: z.string(),
          role: z.string(),
          quote: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const testimonialsHeading = props.heading ?? 'Client Words'
    const testimonialsDesc =
      props.description ??
      'What creative directors, brand managers, and fellow filmmakers say about working together.'
    const testimonialItems = props.items?.length
      ? props.items
      : [
          {
            name: 'Sarah Mitchell',
            role: 'Creative Director, Nike',
            quote:
              'Marcus has an incredible eye for detail and a gift for bringing out authentic performances. The campaign exceeded all our KPIs and won a Cannes Lion.',
            avatarAlt:
              'professional headshot of a smiling female creative director with short brown hair wearing minimalist black clothing',
          },
          {
            name: 'David Park',
            role: 'Executive Producer, Pulse Films',
            quote:
              "Working with Marcus is seamless. He comes prepared, communicates clearly, and delivers footage that's always beautifully composed. A true professional.",
            avatarAlt:
              'professional headshot of a male film producer in his forties with glasses and graying beard wearing a casual button shirt',
          },
          {
            name: 'Emma Larsson',
            role: 'VP Marketing, Spotify',
            quote:
              'Marcus directed our global brand film with such care and vision. He understood our brand instantly and elevated the concept beyond what we imagined.',
            avatarAlt:
              'professional headshot of a female marketing executive with blonde hair wearing elegant business attire and subtle jewelry',
          },
          {
            name: 'Julian Reyes',
            role: 'Artist, Midnight Bloom',
            quote:
              "The music video Marcus created for us captured the exact emotion of the song. He's a director who truly listens and understands artistic vision.",
            avatarAlt:
              'professional headshot of a young male indie musician with curly dark hair and artistic style wearing a vintage jacket',
          },
          {
            name: 'Robert Chen',
            role: 'Founder, Chen & Partners',
            quote:
              "We've worked with Marcus on six campaigns now. He consistently delivers cinematic quality while staying on time and on budget. Our go-to director.",
            avatarAlt:
              'professional headshot of a mature male advertising agency founder with distinguished gray hair wearing a premium suit',
          },
          {
            name: 'Nina Okafor',
            role: 'Producer, Netflix Documentaries',
            quote:
              "Marcus's cinematography on Chef's Table was breathtaking. He finds beauty in the smallest details and elevates every frame to art.",
            avatarAlt:
              'professional headshot of a female documentary producer with dark hair and natural makeup wearing practical outdoor clothing',
          },
        ]
    return (
      <section className={cn('py-20 md:py-32', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-light md:text-4xl">
              {testimonialsHeading}
            </h2>
            <p className="text-muted-foreground">{testimonialsDesc}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {testimonialItems.map((t) => (
              <div key={t.name} className="rounded-md border border-border p-6">
                <div className="mb-4 flex items-center gap-4">
                  <Image
                    alt={t.avatarAlt}
                    w={100}
                    h={100}
                    loading="lazy"
                    className="size-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </div>
                <p className="text-sm italic leading-relaxed text-muted-foreground">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
