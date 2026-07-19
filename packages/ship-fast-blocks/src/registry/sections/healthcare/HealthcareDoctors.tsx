import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  PersonCard,
  PersonCardAvatar,
  PersonCardName,
  PersonCardRole,
  PersonCardBio,
} from '#/section-kit/PersonCard.tsx'

/**
 * HealthcareDoctors — physician team grid for a medical-clinic page. A centered
 * eyebrow chip, heading and intro above a responsive 1/2/4-column grid of
 * profile cards; each card has a tall 3:4 alt-driven headshot that gently zooms
 * on hover, the doctor's name, an accent-colored specialty line, and a short
 * bio. Tokens-only, no links. Use for a "meet our physicians" / care-team /
 * provider-bios section of a doctors' office, family-medicine practice,
 * pediatric / women's-health clinic, hospital or medical group. Renders fully
 * with no props via baked-in board-certified-physician defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
export const HealthcareDoctors = defineCapsule({
  name: 'HealthcareDoctors',
  description:
    "Physician team grid for a medical-clinic page: a centered eyebrow chip, heading and intro above a responsive 1/2/4-column grid of profile cards, each with a tall 3:4 alt-driven headshot that gently zooms on hover, the doctor's name, an accent-colored specialty line, and a short bio. Tokens-only, no links. Use for a 'meet our physicians' / care-team / provider-bios section of a doctors' office, family-medicine practice, pediatric / women's-health clinic, hospital or medical group.",
  props: z.object({
    /** Eyebrow chip text above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Physician profiles: name, specialty, bio, and headshot alt. */
    items: z
      .array(
        z.object({
          name: z.string(),
          specialty: z.string(),
          bio: z.string(),
          photoAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Our Team'
    const heading = props.heading ?? 'Meet our physicians'
    const description =
      props.description ??
      'Board-certified doctors with decades of combined experience, committed to building lasting relationships with every patient.'
    const items = props.items?.length
      ? props.items
      : [
          {
            name: 'Dr. Sarah Chen, MD',
            specialty: 'Internal Medicine',
            bio: 'Harvard Medical School. 15 years experience. Specializes in chronic disease management and preventive care.',
            photoAlt:
              'Professional headshot of Dr. Sarah Chen, a female physician with shoulder-length dark hair wearing a white coat',
          },
          {
            name: 'Dr. James Mitchell, MD',
            specialty: 'Family Medicine',
            bio: 'Stanford University. 12 years experience. Board certified in family medicine with focus on holistic care.',
            photoAlt:
              'Professional headshot of Dr. James Mitchell, a male physician in his 40s with short gray hair and glasses',
          },
          {
            name: 'Dr. Priya Patel, DO',
            specialty: "Women's Health",
            bio: 'Johns Hopkins University. 10 years experience. OB/GYN trained, specializing in reproductive health and wellness.',
            photoAlt:
              'Professional headshot of Dr. Priya Patel, a female physician with long dark hair wearing a white coat and stethoscope',
          },
          {
            name: 'Dr. Michael Torres, MD',
            specialty: 'Pediatrics',
            bio: 'UCSF School of Medicine. 8 years experience. Fellow of the American Academy of Pediatrics. Speaks English and Spanish.',
            photoAlt:
              'Professional headshot of Dr. Michael Torres, a male pediatrician in his 30s with a warm smile',
          },
        ]
    return (
      <section
        className={cn('bg-background py-20 lg:py-28', props.className)}
        aria-labelledby="doctors-heading"
      >
        <Container>
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            subtitle={description}
            titleId="doctors-heading"
            className="mb-16 max-w-3xl gap-0"
            eyebrowClassName="mb-4 inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground"
            titleClassName="mb-4 text-3xl font-bold text-foreground sm:text-4xl"
            subtitleClassName="text-lg text-muted-foreground"
          />

          <ResponsiveGrid cols="1-md-2-4" gap="lg">
            {items.map((doc) => (
              <PersonCard
                key={doc.name}
                variant="bare"
                rounded="none"
                className="group"
              >
                <PersonCardAvatar className="mb-6 aspect-[3/4] rounded-2xl bg-muted">
                  <Image
                    alt={doc.photoAlt}
                    w={600}
                    h={800}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </PersonCardAvatar>
                <PersonCardName className="mb-1 text-xl font-bold">
                  {doc.name}
                </PersonCardName>
                <PersonCardRole className="mb-2 text-base font-medium text-primary">
                  {doc.specialty}
                </PersonCardRole>
                <PersonCardBio className="leading-relaxed">
                  {doc.bio}
                </PersonCardBio>
              </PersonCard>
            ))}
          </ResponsiveGrid>
        </Container>
      </section>
    )
  },
})
