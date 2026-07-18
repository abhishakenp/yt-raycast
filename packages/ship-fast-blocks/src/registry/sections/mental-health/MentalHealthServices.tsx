import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  localServiceItem,
  useSyncLocalServices,
} from '../local-service/local-service-interactions.tsx'
import { localServiceLakebed } from '../local-service/local-service-lakebed.ts'
import { FeatureGrid } from '#/section-kit/FeatureGrid.tsx'

/**
 * MentalHealthServices — a centered-heading services grid for a therapy practice.
 * An eyebrow + heading + intro paragraph above a responsive 1/2/3-column grid of
 * rounded bordered cards, each with a primary-tinted icon tile, a service title,
 * a description, and a bulleted list of session details. Calm, warm, sage-and-sand
 * wellness aesthetic with gentle hover shadow. Use to present therapy modalities
 * (individual, couples, family, EMDR/trauma, anxiety & depression, life
 * transitions) for therapists, counselors, psychologists or wellness centers.
 */
export const MentalHealthServices = defineCapsule({
  name: 'MentalHealthServices',
  description:
    'Centered-heading services grid for a therapy practice: an eyebrow + heading + intro paragraph above a responsive 1/2/3-column grid of rounded bordered cards, each with a primary-tinted icon tile, a service title, a description, and a bulleted list of session details. Calm, warm, sage-and-sand wellness aesthetic with gentle hover shadow. Use to present therapy modalities (individual, couples, family, EMDR/trauma, anxiety & depression, life transitions) for therapists, counselors, psychologists or wellness centers.',
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
      <section className={cn('py-20 lg:py-28', props.className)}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            subtitle={description}
            align="center"
            eyebrowClassName="text-primary tracking-wider"
            subtitleClassName="leading-relaxed"
            className="mx-auto mb-16 max-w-2xl"
          />
          <FeatureGrid features={items} columns={3} />
        </div>
      </section>
    )
  },
})
