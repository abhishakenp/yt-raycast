import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * FitnessClasses — responsive class / program grid for a gym or fitness studio. A
 * centered heading + lead paragraph above a 1/2/3-column grid of bordered card-surface
 * tiles, each with a cover photo, title, short description, and a footer meta row of
 * a clock-icon duration and a bolt-icon intensity. Cards lift on hover. Images use
 * the alt-driven Image component. Use to showcase classes, programs or services on
 * gyms, fitness studios, CrossFit boxes, yoga / pilates / boxing / spin studios.
 */
import { Container } from '#/section-kit/Container.tsx'
import { ClassGrid, ClassCard } from '#/section-kit/ClassGrid.tsx'
export const FitnessClasses = defineCapsule({
  name: 'FitnessClasses',
  description:
    'Responsive class / program grid for a gym or fitness studio: a centered heading and lead paragraph above a 1/2/3-column grid of bordered card-surface tiles, each with a cover photo, title, short description and a footer meta row of a clock-icon duration and a bolt-icon intensity, with cards lifting on hover. Images use the alt-driven Image component. Use to showcase classes, programs or services (strength, yoga, cycle, HIIT, pilates, boxing) on gyms, fitness studios, CrossFit boxes or yoga / pilates / boxing / spin studios.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          imageAlt: z.string(),
          duration: z.string(),
          intensity: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const classesHeading = props.heading ?? 'Classes for every goal'
    const classesDesc =
      props.description ??
      'From high-intensity interval training to restorative yoga, find the perfect class to match your fitness journey.'
    const classItems = props.items?.length
      ? props.items
      : [
          {
            title: 'Strength Training',
            description:
              'Build lean muscle with barbell and dumbbell workouts. Suitable for all levels with progressive programming.',
            imageAlt:
              'person lifting heavy barbell during strength training session',
            duration: '60 min',
            intensity: 'High intensity',
          },
          {
            title: 'Power Yoga',
            description:
              'Dynamic vinyasa flow combining strength, flexibility, and breathwork. Heated to 85°F for deeper movement.',
            imageAlt: 'woman in warrior yoga pose on mat in peaceful studio',
            duration: '75 min',
            intensity: 'Moderate',
          },
          {
            title: 'Cycle',
            description:
              'Rhythm-based indoor cycling with choreographed movements. Burn 500+ calories while riding to the beat.',
            imageAlt:
              'group cycling class with people on stationary bikes in dark studio with colored lights',
            duration: '45 min',
            intensity: 'High intensity',
          },
          {
            title: 'HIIT',
            description:
              'High-intensity interval training with short bursts of explosive movement followed by active recovery periods.',
            imageAlt: 'person doing burpees during HIIT workout in gym',
            duration: '45 min',
            intensity: 'High intensity',
          },
          {
            title: 'Pilates',
            description:
              'Core-focused movements on reformers and mats. Improve posture, flexibility, and deep muscle stability.',
            imageAlt:
              'woman practicing pilates on reformer machine in bright studio',
            duration: '50 min',
            intensity: 'Low intensity',
          },
          {
            title: 'Boxing',
            description:
              'Learn proper boxing technique, footwork, and combinations. Full-body conditioning with bag and partner work.',
            imageAlt:
              'two people sparring during boxing training session with gloves and focus mitts',
            duration: '60 min',
            intensity: 'High intensity',
          },
        ]
    const ClockIcon = () => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
    const BoltIcon = () => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
    return (
      <section className={cn('py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-semibold text-foreground md:text-4xl">
              {classesHeading}
            </h2>
            <p className="text-muted-foreground">{classesDesc}</p>
          </div>

          <ClassGrid cols="1-2-3" className="gap-6">
            {classItems.map((item) => (
              <ClassCard
                asChild
                key={item.title}
                className="group overflow-hidden transition-shadow hover:shadow-lg"
              >
                <article>
                  <Image
                    alt={item.imageAlt}
                    w={600}
                    h={400}
                    loading="lazy"
                    className="h-48 w-full object-cover"
                  />
                  <div className="p-6">
                    <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                      {item.title}
                    </h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ClockIcon /> {item.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <BoltIcon /> {item.intensity}
                      </span>
                    </div>
                  </div>
                </article>
              </ClassCard>
            ))}
          </ClassGrid>
        </Container>
      </section>
    )
  },
})
