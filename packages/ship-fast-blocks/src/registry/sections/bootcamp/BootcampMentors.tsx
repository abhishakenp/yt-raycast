import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  PersonCard,
  PersonCardName,
  PersonCardRole,
} from '#/section-kit/PersonCard.tsx'

/**
 * BootcampMentors — "Terminal Classroom" mentor roster for a coding bootcamp /
 * career-school landing page. An asymmetric header (left-aligned heading, mono
 * roster-count tag on the right) above a staggered 1/2/4-column grid of
 * clickable bare headshot cards: every other card offsets downward, portraits
 * sit in sharp hairline frames with a mono ghost index numeral and an
 * inverted mono company chip pinned to the photo, with the name and a mono
 * uppercase role line beneath. A 3-up classroom photo strip with mono
 * `fig.01` captions and a middle-offset column closes the section, over a
 * giant ghost "1:1" watermark. Cards route through section-kit route links.
 * Use to showcase instructor credibility for bootcamps, academies, or
 * cohort-based education programs.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

export const BootcampMentors = defineCapsule({
  name: 'BootcampMentors',
  description:
    "Terminal-styled staggered mentor roster for a coding bootcamp / career-school landing page: asymmetric left-aligned header with a mono roster-count tag, above a 1/2/4-column grid of clickable bare headshot cards where every other card offsets downward. Portraits sit in sharp hairline frames with a mono ghost index numeral and an inverted mono company chip pinned to the photo; name and mono uppercase role sit beneath. A 3-up classroom photo strip with mono 'fig.01' captions and a middle-offset column closes the section over a giant ghost '1:1' watermark. Cards route through section-kit route links. Use to showcase instructor credibility for bootcamps, academies, or cohort-based education programs.",
  props: z.object({
    /** Section eyebrow label. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Mentors: name, role, company. */
    items: z
      .array(
        z.object({
          name: z.string(),
          role: z.string(),
          company: z.string(),
        }),
      )
      .optional(),
    /** Classroom / workspace photo alt texts. */
    photos: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const mentorsEyebrow = props.eyebrow ?? 'World-Class Mentors'
    const mentorsHeading =
      props.heading ?? 'Learn from engineers at top tech companies'
    const mentorsDesc =
      props.description ??
      "Daily 1:1 mentorship and code reviews from senior developers who've built systems serving millions."
    const mentorItems = props.items?.length
      ? props.items
      : [
          {
            name: 'Sarah Chen',
            role: 'Senior Staff Engineer • 8 years experience',
            company: 'Google',
          },
          {
            name: 'Marcus Johnson',
            role: 'Principal Engineer • 12 years experience',
            company: 'Stripe',
          },
          {
            name: 'Priya Sharma',
            role: 'Engineering Manager • 10 years experience',
            company: 'Netflix',
          },
          {
            name: 'David Kim',
            role: 'Tech Lead • 9 years experience',
            company: 'Airbnb',
          },
        ]
    const mentorPhotos = props.photos?.length
      ? props.photos
      : [
          'coding bootcamp classroom with students learning on laptops',
          'students collaborating on a group programming project',
          'modern tech workspace with developers working at standing desks',
        ]
    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background py-16 lg:py-24',
          props.className,
        )}
      >
        <Watermark className="-left-4 bottom-0 font-mono text-[7rem] sm:text-[13rem]">
          1:1
        </Watermark>
        <Container className="relative">
          <div className="mb-10 grid items-end gap-4 lg:mb-14 lg:grid-cols-12">
            <SectionHeading
              align="left"
              eyebrow={mentorsEyebrow}
              title={mentorsHeading}
              subtitle={mentorsDesc}
              className="max-w-2xl gap-0 lg:col-span-8"
              eyebrowClassName="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
              titleClassName="mb-4 text-3xl font-bold tracking-tight sm:text-5xl"
              subtitleClassName="text-base text-muted-foreground sm:text-lg"
            />
            <MonoTag tone="faint" className="lg:col-span-4 lg:justify-self-end">
              [ {String(mentorItems.length).padStart(2, '0')} mentors · on
              rotation ]
            </MonoTag>
          </div>
          <ResponsiveGrid cols="1-2-4" className="gap-6 sm:gap-x-6 sm:gap-y-10">
            {mentorItems.map((m, i) => (
              <PersonCard
                key={m.name}
                asChild
                variant="bare"
                className={cn(
                  'rounded-none',
                  i % 2 === 1 && 'sm:translate-y-8',
                )}
              >
                <NavbarRouteLink className="group text-left" href={m.name}>
                  <div className="relative mb-4 overflow-hidden rounded-none border border-border">
                    <Image
                      alt={`professional headshot of ${m.name}, ${m.role} at ${m.company}`}
                      w={400}
                      h={400}
                      loading="lazy"
                      className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none"
                    />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute right-2 top-1 select-none font-mono text-4xl font-bold leading-none text-background/60 mix-blend-screen"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="absolute bottom-3 left-3 border border-background/30 bg-foreground/85 px-2 py-1">
                      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-background">
                        {m.company}
                      </p>
                    </div>
                  </div>
                  <PersonCardName className="text-base font-semibold tracking-tight">
                    {m.name}
                  </PersonCardName>
                  <PersonCardRole className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                    {m.role}
                  </PersonCardRole>
                </NavbarRouteLink>
              </PersonCard>
            ))}
          </ResponsiveGrid>
          <ResponsiveGrid
            cols="1"
            className="mt-14 gap-6 sm:mt-20 md:grid-cols-3"
          >
            {mentorPhotos.map((photo, i) => (
              <figure
                key={photo}
                className={cn('m-0', i === 1 && 'md:translate-y-6')}
              >
                <Image
                  alt={photo}
                  w={600}
                  h={400}
                  loading="lazy"
                  className="h-64 w-full rounded-none border border-border object-cover"
                />
                <figcaption
                  aria-hidden="true"
                  className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70"
                >
                  fig.{String(i + 1).padStart(2, '0')} — on campus
                </figcaption>
              </figure>
            ))}
          </ResponsiveGrid>
        </Container>
      </section>
    )
  },
})
