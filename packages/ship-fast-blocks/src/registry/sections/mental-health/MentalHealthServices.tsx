import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  LocalServiceBookingButton,
  LocalServiceMutationSpinner,
  localServiceItem,
  useSyncLocalServices,
} from '../local-service/local-service-interactions.tsx'
import { localServiceLakebed } from '../local-service/local-service-lakebed.ts'

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

    const serviceIcons: ReactNode[] = [
      <svg
        key="person"
        className="size-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>,
      <svg
        key="couples"
        className="size-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>,
      <svg
        key="family"
        className="size-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>,
      <svg
        key="bolt"
        className="size-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>,
      <svg
        key="face"
        className="size-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>,
      <svg
        key="transition"
        className="size-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
        />
      </svg>,
    ]

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
          <ResponsiveGrid cols="1-md-2-3" gap="lg">
            {items.map((item, i) => (
              <LocalServiceBookingButton
                key={item.title}
                lakebed={lakebed}
                intentLabel={`Book ${item.title}`}
                service={item.title}
                source="services"
                pendingChildren={<LocalServiceMutationSpinner />}
                className="rounded-2xl border border-border bg-card p-8 text-left transition-shadow hover:shadow-xl disabled:pointer-events-none disabled:opacity-70"
              >
                <div className="mb-6 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  {serviceIcons[i % serviceIcons.length]}
                </div>
                <h3 className="mb-3 text-xl font-semibold text-card-foreground">
                  {item.title}
                </h3>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {item.points.map((p) => (
                    <li key={p} className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-primary/60" />
                      {p}
                    </li>
                  ))}
                </ul>
              </LocalServiceBookingButton>
            ))}
          </ResponsiveGrid>
        </div>
      </section>
    )
  },
})
