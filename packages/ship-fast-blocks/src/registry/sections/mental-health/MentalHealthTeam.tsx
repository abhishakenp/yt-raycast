import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import {
  PersonCard,
  PersonCardName,
  PersonCardRole,
  PersonCardBio,
} from '#/section-kit/PersonCard.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'

/**
 * MentalHealthTeam — a clinician team gallery for a therapy practice. A centered
 * eyebrow + heading + intro above a responsive 1/2/4-column grid of clinician
 * cards (rounded headshot photo that zooms on hover, name, primary-colored role,
 * short bio), followed by a muted "looking for a specific specialty?" band with
 * a therapist-matching link. Calm, warm, sage-and-sand wellness aesthetic. The
 * specialty link routes through useNavigate. Use to introduce therapists,
 * counselors, psychologists or psychiatrists at a mental-health practice.
 */
export const MentalHealthTeam = defineCapsule({
  name: 'MentalHealthTeam',
  description:
    "Clinician team gallery for a therapy practice: a centered eyebrow + heading + intro above a responsive 1/2/4-column grid of clinician cards (rounded headshot photo that zooms on hover, name, primary-colored role, short bio), then a muted 'looking for a specific specialty?' band with a therapist-matching link. Calm, warm, sage-and-sand wellness aesthetic. The specialty link routes through useNavigate. Use to introduce therapists, counselors, psychologists or psychiatrists at a mental-health practice.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    members: z
      .array(
        z.object({
          name: z.string(),
          role: z.string(),
          bio: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    specialtyHeading: z.string().optional(),
    specialtyDescription: z.string().optional(),
    specialtyCta: z.string().optional(),
    /** Navigation target for the specialty / matching link (e.g. "Book Session"). */
    bookLabel: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Our Team'
    const heading = props.heading ?? 'Experienced, compassionate clinicians'
    const description =
      props.description ??
      'Our therapists are licensed professionals with advanced training in evidence-based approaches.'
    const members = props.members?.length
      ? props.members
      : [
          {
            name: 'Dr. Sarah Chen, PsyD',
            role: 'Clinical Director',
            bio: 'Specializes in anxiety disorders, trauma, and EMDR. 12+ years experience. Licensed in Oregon since 2015.',
            imageAlt:
              'Professional headshot of Dr. Sarah Chen, a licensed clinical psychologist with warm smile and professional attire',
          },
          {
            name: 'Marcus Williams, LMFT',
            role: 'Couples & Family Specialist',
            bio: 'Gottman-certified couples therapist. Expert in family systems, divorce mediation, and co-parenting support.',
            imageAlt:
              'Professional headshot of Marcus Williams, a licensed marriage and family therapist with kind expression',
          },
          {
            name: 'Dr. Elena Rodriguez, MD',
            role: 'Psychiatrist',
            bio: 'Board-certified psychiatrist. Medication management for depression, anxiety, bipolar, and ADHD. Available Thursdays.',
            imageAlt:
              'Professional headshot of Dr. Elena Rodriguez, a psychiatrist with compassionate demeanor',
          },
          {
            name: 'Jennifer Park, LCSW',
            role: 'Anxiety & Life Transitions',
            bio: "CBT and mindfulness-based therapy. Special focus on young adults, career transitions, and women's mental health.",
            imageAlt:
              'Professional headshot of Jennifer Park, a licensed clinical social worker with warm approachable presence',
          },
        ]
    const specialtyHeading =
      props.specialtyHeading ?? 'Looking for a specific specialty?'
    const specialtyDescription =
      props.specialtyDescription ??
      'We also have clinicians specializing in eating disorders, substance recovery, LGBTQ+ affirming care, and adolescent therapy.'
    const specialtyCta =
      props.specialtyCta ?? 'Contact us for therapist matching'
    const bookLabel = props.bookLabel ?? 'Book Session'

    return (
      <section className={cn('py-20 lg:py-28', props.className)}>
        <Container size="lg">
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            subtitle={description}
            className="mx-auto mb-16 max-w-2xl gap-0"
            eyebrowClassName="text-sm font-medium uppercase tracking-wider text-primary"
            titleClassName="mt-3 text-3xl font-semibold text-foreground sm:text-4xl"
            subtitleClassName="mt-4 leading-relaxed text-muted-foreground"
          />

          <ResponsiveGrid cols="1-2-4">
            {members.map((m) => (
              <PersonCard
                key={m.name}
                variant="bare"

                className="group rounded-none"
              >
                <div className="relative mb-4 overflow-hidden rounded-2xl">
                  <Image
                    alt={m.imageAlt}
                    w={400}
                    h={500}
                    loading="lazy"
                    className="h-80 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <PersonCardName className="text-lg">{m.name}</PersonCardName>
                <PersonCardRole className="mb-2 font-medium text-primary">
                  {m.role}
                </PersonCardRole>
                <PersonCardBio className="leading-relaxed">
                  {m.bio}
                </PersonCardBio>
              </PersonCard>
            ))}
          </ResponsiveGrid>

          <div className="mt-12 rounded-2xl bg-muted p-8 text-center">
            <h3 className="mb-2 text-xl font-semibold text-foreground">
              {specialtyHeading}
            </h3>
            <p className="mb-6 text-muted-foreground">{specialtyDescription}</p>
            <button
              type="button"
              onClick={() => go(bookLabel)}
              className="inline-flex items-center gap-2 font-medium text-primary transition-colors hover:text-primary/80"
            >
              {specialtyCta}
              <svg
                className="size-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </button>
          </div>
        </Container>
      </section>
    )
  },
})
