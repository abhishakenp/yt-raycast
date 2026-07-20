import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  localServiceItem,
  useSyncLocalServices,
} from '../local-service/local-service-interactions.tsx'
import { localServiceLakebed } from '../local-service/local-service-lakebed.ts'
import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * MentalHealthServices — a warm-editorial services grid for a therapy practice.
 * An asymmetric header (left-aligned mono eyebrow + serif heading + lede, mono
 * index meta on the right) above a responsive 1/2/3-column grid of square cards
 * on a soft muted wash; each card carries a zero-padded mono index numeral, a
 * serif service title, a description, and a hairline-divided list of session
 * details with primary tick dashes. Calm, warm, sage-and-sand wellness
 * aesthetic with generous air. Use to present therapy modalities (individual,
 * couples, family, EMDR/trauma, anxiety & depression, life transitions) for
 * therapists, counselors, psychologists or wellness centers.
 */
export const MentalHealthServices = defineCapsule({
  name: 'MentalHealthServices',
  description:
    'Warm-editorial services grid for a therapy practice: an asymmetric header (left-aligned mono eyebrow + serif heading + lede, mono index meta right) above a responsive 1/2/3-column grid of square cards on a soft muted wash, each with a zero-padded mono index numeral, a serif service title, a description, and a hairline-divided list of session details with primary tick dashes. Calm, warm, sage-and-sand wellness aesthetic with generous air. Use to present therapy modalities (individual, couples, family, EMDR/trauma, anxiety & depression, life transitions) for therapists, counselors, psychologists or wellness centers.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          points: z.array(z.string()),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: localServiceLakebed,
  component: ({ props, lakebed }) => {
    const eyebrow = props.eyebrow ?? 'Our Services'
    const heading = props.heading ?? 'Personalized care for your journey'
    const description =
      props.description ??
      'We offer a range of therapeutic approaches tailored to your unique needs. All sessions are available in-person at our Pearl District office or via secure video conferencing.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Individual Therapy',
            description:
              'One-on-one sessions addressing anxiety, depression, trauma, stress management, and personal growth. Using CBT, mindfulness, and psychodynamic approaches.',
            points: ['50-minute sessions', 'Weekly or bi-weekly', 'Ages 18+'],
          },
          {
            title: 'Couples Therapy',
            description:
              'Evidence-based couples counseling using Gottman Method and EFT. Strengthen communication, rebuild trust, and navigate major life transitions together.',
            points: [
              '80-minute sessions',
              'Premarital counseling available',
              'All relationship types welcome',
            ],
          },
          {
            title: 'Family Therapy',
            description:
              'Support for families navigating conflict, communication breakdowns, parenting challenges, divorce transitions, and multigenerational dynamics.',
            points: [
              '90-minute sessions',
              'Up to 6 family members',
              'All ages included',
            ],
          },
          {
            title: 'EMDR & Trauma',
            description:
              'Specialized EMDR therapy for PTSD, complex trauma, and processing difficult experiences. A structured approach to reduce emotional distress.',
            points: [
              'Certified EMDR therapists',
              '60-90 minute sessions',
              'Phased treatment protocol',
            ],
          },
          {
            title: 'Anxiety & Depression',
            description:
              'Comprehensive treatment for mood disorders, panic attacks, social anxiety, and OCD. Combining CBT, ACT, and mindfulness-based interventions.',
            points: [
              'Evidence-based protocols',
              'Between-session support',
              'Medication coordination',
            ],
          },
          {
            title: 'Life Transitions',
            description:
              'Support through career changes, grief and loss, relocation, becoming a parent, aging, retirement, and other major life adjustments.',
            points: [
              'Flexible scheduling',
              'Short-term options',
              'Strengths-based focus',
            ],
          },
        ]
    useSyncLocalServices(
      lakebed,
      items.map((item) =>
        localServiceItem({
          name: item.title,
          summary: item.description,
        }),
      ),
    )

    return (
      <section
        className={cn('bg-background py-20 sm:py-24 lg:py-28', props.className)}
      >
        <Container size="lg">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <SectionHeading
              align="left"
              eyebrow={eyebrow}
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-0"
              eyebrowClassName="mb-4 inline-block font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground"
              titleClassName="mb-4 font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]"
              subtitleClassName="text-base leading-relaxed text-muted-foreground sm:text-lg"
            />
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 md:pb-1"
            >
              {String(items.length).padStart(2, '0')} / services
            </MonoTag>
          </div>
          <FeatureGrid columns={3} className="gap-4 lg:gap-6">
            {items.map((f, i) => {
              const __iv__ = f as {
                title: string
                description: string
                icon?: React.ReactNode
                points?: string[]
                cta?: string
                price?: string
                imageAlt?: string
              }
              return (
                <FeatureCard
                  key={__iv__.title}
                  className="gap-4 rounded-none border-border bg-muted/30 p-6 shadow-none transition-colors hover:bg-muted/50 sm:p-8"
                >
                  <MonoTag aria-hidden="true" tone="faint">
                    {String(i + 1).padStart(2, '0')}
                  </MonoTag>
                  {__iv__.icon && <FeatureIcon>{__iv__.icon}</FeatureIcon>}
                  <FeatureTitle className="font-serif text-xl font-medium tracking-tight">
                    {__iv__.title}
                  </FeatureTitle>
                  <FeatureDescription className="leading-relaxed">
                    {__iv__.description}
                  </FeatureDescription>
                  {__iv__.points?.length ? (
                    <ul className="mt-1 divide-y divide-border border-t border-border">
                      {__iv__.points.map((point) => (
                        <li
                          key={point}
                          className="flex items-center gap-3 py-2.5 text-sm text-muted-foreground"
                        >
                          <span
                            aria-hidden="true"
                            className="h-px w-3.5 shrink-0 bg-primary"
                          />
                          {point}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </FeatureCard>
              )
            })}
          </FeatureGrid>
        </Container>
      </section>
    )
  },
})
