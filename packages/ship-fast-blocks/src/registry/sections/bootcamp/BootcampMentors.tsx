import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import {
  PersonCard,
  PersonCardName,
  PersonCardRole,
} from '#/section-kit/PersonCard.tsx'

/**
 * BootcampMentors — world-class mentors gallery for a coding bootcamp / career-
 * school landing page. A centered eyebrow, heading and description above a
 * responsive grid of headshot cards; each card is clickable via useNavigate
 * and features an alt-driven square portrait with a bottom company overlay,
 * plus name and role beneath. Below the cards sits a 3-column row of classroom
 * photos. Use to showcase instructor credibility for bootcamps, academies, or
 * cohort-based education programs.
 */
import { Container } from '#/section-kit/Container.tsx'
import { Eyebrow } from '#/section-kit/Eyebrow.tsx'
export const BootcampMentors = defineCapsule({
  name: 'BootcampMentors',
  description:
    'World-class mentors gallery for a coding bootcamp / career-school landing page: centered eyebrow, heading and description above a responsive grid of clickable headshot cards. Each card features an alt-driven square portrait with a bottom company overlay, plus name and role beneath. Below the cards sits a 3-column row of classroom photos. Cards route through useNavigate. Use to showcase instructor credibility for bootcamps, academies, or cohort-based education programs.',
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
    const go = useNavigate()
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
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
            <Eyebrow
              variant="text"
              className="mb-4 inline-block tracking-wider text-primary"
            >
              {mentorsEyebrow}
            </Eyebrow>
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              {mentorsHeading}
            </h2>
            <p className="text-lg text-muted-foreground">{mentorsDesc}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {mentorItems.map((m) => (
              <PersonCard key={m.name} asChild variant="bare" rounded="none">
                <button
                  type="button"
                  onClick={() => go(m.name)}
                  className="group text-left"
                >
                  <div className="relative mb-4 overflow-hidden rounded-2xl">
                    <Image
                      alt={`professional headshot of ${m.name}, ${m.role} at ${m.company}`}
                      w={400}
                      h={400}
                      loading="lazy"
                      className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/80 to-transparent p-4">
                      <p className="text-sm font-medium text-background">
                        {m.company}
                      </p>
                    </div>
                  </div>
                  <PersonCardName>{m.name}</PersonCardName>
                  <PersonCardRole>{m.role}</PersonCardRole>
                </button>
              </PersonCard>
            ))}
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {mentorPhotos.map((photo) => (
              <Image
                key={photo}
                alt={photo}
                w={600}
                h={400}
                loading="lazy"
                className="h-64 w-full rounded-2xl object-cover"
              />
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
