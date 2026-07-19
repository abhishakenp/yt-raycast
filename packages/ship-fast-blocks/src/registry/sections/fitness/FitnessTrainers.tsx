import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  PersonCard,
  PersonCardName,
  PersonCardRole,
  PersonCardBio,
} from '#/section-kit/PersonCard.tsx'

/**
 * FitnessTrainers — expert-trainers / coaches grid for a gym or fitness studio. A
 * centered heading + lead paragraph above a 1/2/4-column grid of centered cards, each
 * with a tall rounded headshot, name, role, and a short credentials bio. Headshots
 * use the alt-driven Image component. Use to introduce coaches, instructors or
 * personal trainers on gyms, fitness studios, yoga / pilates / boxing / spin studios.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
export const FitnessTrainers = defineCapsule({
  name: 'FitnessTrainers',
  description:
    'Expert-trainers / coaches grid for a gym or fitness studio: a centered heading and lead paragraph above a 1/2/4-column grid of centered cards, each with a tall rounded headshot, name, role and a short credentials bio. Headshots use the alt-driven Image component. Use to introduce coaches, instructors, yoga directors or personal trainers on gyms, fitness studios, CrossFit boxes, yoga, pilates, boxing or spin / cycle studios.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(
        z.object({
          name: z.string(),
          role: z.string(),
          bio: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const trainersHeading = props.heading ?? 'Expert trainers'
    const trainersDesc =
      props.description ??
      'Our coaches bring years of experience, certifications, and a genuine passion for helping you reach your goals.'
    const trainerItems = props.items?.length
      ? props.items
      : [
          {
            name: 'Marcus Williams',
            role: 'Head Coach — Strength',
            bio: 'CSCS, CrossFit L2. 12 years experience. Former collegiate strength coach.',
            imageAlt:
              'professional headshot of Marcus Williams a muscular Black male fitness trainer with short hair wearing black athletic shirt',
          },
          {
            name: 'Elena Park',
            role: 'Yoga Director',
            bio: 'E-RYT 500, YACEP. 8 years teaching. Specializes in power vinyasa.',
            imageAlt:
              'professional headshot of Elena Park a Korean American female yoga instructor with long dark hair in peaceful smile',
          },
          {
            name: 'James Chen',
            role: 'Boxing Coach',
            bio: 'Golden Gloves champion. NASM-CPT. Focus on technique and conditioning.',
            imageAlt:
              'professional headshot of James Chen an athletic Asian male boxing trainer with buzz cut and confident expression',
          },
          {
            name: 'Sofia Martinez',
            role: 'Pilates Lead',
            bio: 'Balanced Body certified. Former dancer. 6 years pilates instruction.',
            imageAlt:
              'professional headshot of Sofia Martinez a fit Latina female pilates instructor with warm smile and athletic build',
          },
        ]
    return (
      <section className={cn('py-20 lg:py-28', props.className)}>
        <Container>
          <SectionHeading
            title={trainersHeading}
            subtitle={trainersDesc}
            className="mb-16 max-w-2xl gap-0"
            titleClassName="mb-4 text-3xl font-semibold text-foreground md:text-4xl"
            subtitleClassName="text-muted-foreground"
          />

          <ResponsiveGrid cols="1-md-2-4">
            {trainerItems.map((trainer) => (
              <PersonCard
                key={trainer.name}
                variant="bare"

                className="text-center rounded-none"
              >
                <Image
                  alt={trainer.imageAlt}
                  w={400}
                  h={500}
                  loading="lazy"
                  className="mb-4 h-72 w-full rounded-lg object-cover"
                />
                <PersonCardName className="text-lg">
                  {trainer.name}
                </PersonCardName>
                <PersonCardRole>{trainer.role}</PersonCardRole>
                <PersonCardBio className="mt-2">{trainer.bio}</PersonCardBio>
              </PersonCard>
            ))}
          </ResponsiveGrid>
        </Container>
      </section>
    )
  },
})
