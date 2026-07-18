import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { Card } from '#/section-kit/Card.tsx'
import {
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * ChurchServices — split weekly service-times section for a church or faith-community
 * site. Left column: eyebrow, heading, description, and an icon-accented list of
 * service cards (clock/moon/hands cycle). Right column: a sticky tall photo with a
 * "What to Expect" checklist card beneath it. Warm, informative, and welcoming. Use
 * as the service-times / weekly-gatherings section for churches, worship centers,
 * parishes, or ministries. Renders fully with no props via baked-in defaults.
 */
export const ChurchServices = defineCapsule({
  name: 'ChurchServices',
  description:
    "Split weekly service-times section for a church or faith-community site: left column with eyebrow, heading, description, and an icon-accented list of service cards (clock/moon/hands cycle); right column with a sticky tall photo and a 'What to Expect' checklist card beneath. Warm, informative, and welcoming. Use as the service-times / weekly-gatherings section for churches, worship centers, parishes, or ministries.",
  props: z.object({
    /** Small uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Paragraph under the heading. */
    description: z.string().optional(),
    /** Service cards; each has a title, detail line, and location. */
    items: z
      .array(
        z.object({
          title: z.string(),
          detail: z.string(),
          location: z.string(),
        }),
      )
      .optional(),
    /** Alt text for the right-side sticky image. */
    imageAlt: z.string().optional(),
    /** Title of the expectations checklist card. */
    expectTitle: z.string().optional(),
    /** Bullet items in the expectations checklist. */
    expect: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Weekly Gatherings'
    const heading = props.heading ?? 'Join us this Sunday'
    const description =
      props.description ??
      'Experience contemporary worship, relevant teaching, and a welcoming community. Services last approximately 75 minutes.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Sunday Morning Worship',
            detail:
              "9:00 AM & 11:00 AM — Contemporary service with full band, children's programs, and nursery care.",
            location: 'Main Sanctuary & Live Stream',
          },
          {
            title: 'Wednesday Night Encounter',
            detail:
              '7:00 PM — Midweek prayer, worship, and teaching. Dinner served at 6:00 PM ($5 suggested).',
            location: 'Fellowship Hall',
          },
          {
            title: 'Saturday Prayer Vigil',
            detail:
              'First Saturday monthly, 8:00 AM — 12:00 PM — Corporate prayer for our city and world.',
            location: 'Prayer Chapel',
          },
        ]
    const imageAlt =
      props.imageAlt ??
      'Wide interior view of a modern church sanctuary with warm lighting and wooden accents'
    const expectTitle = props.expectTitle ?? 'What to Expect'
    const expect = props.expect?.length
      ? props.expect
      : [
          'Casual dress — come as you are',
          'Free coffee and pastries before service',
          'Programs for kids ages 0-18',
          'Accessible parking and seating',
        ]

    const Check = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    const serviceIcons = [
      <svg
        key="clock"
        className="size-5 text-foreground"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      <svg
        key="moon"
        className="size-5 text-foreground"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>,
      <svg
        key="hands"
        className="size-5 text-foreground"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
      </svg>,
    ]

    return (
      <section
        className={cn(
          'bg-muted pt-28 pb-24 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container size="xl" className="px-6">
          <div className="grid items-start gap-16 lg:grid-cols-2">
            <div>
              <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
                {eyebrow}
              </p>
              <h2 className="mb-6 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
                {heading}
              </h2>
              <p className="mb-10 text-lg leading-relaxed text-muted-foreground">
                {description}
              </p>
              <div className="space-y-6">
                {items.map((s, i) => (
                  <FeatureCard
                    key={s.title}
                    className="flex flex-row items-start gap-4"
                  >
                    <FeatureIcon className="flex size-12 flex-shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
                      {serviceIcons[i % serviceIcons.length]}
                    </FeatureIcon>
                    <div>
                      <FeatureTitle className="mb-1 font-medium text-card-foreground">
                        {s.title}
                      </FeatureTitle>
                      <FeatureDescription className="mb-2">
                        {s.detail}
                      </FeatureDescription>
                      <p className="text-sm text-muted-foreground">
                        {s.location}
                      </p>
                    </div>
                  </FeatureCard>
                ))}
              </div>
            </div>
            <div className="lg:sticky lg:top-24">
              <div className="aspect-[3/4] overflow-hidden rounded-xl bg-muted">
                <Image
                  alt={imageAlt}
                  w={800}
                  h={1000}
                  loading="lazy"
                  className="size-full object-cover"
                />
              </div>
              <Card className="mt-6">
                <h4 className="mb-3 font-medium text-card-foreground">
                  {expectTitle}
                </h4>
                <ul className="space-y-3 text-muted-foreground">
                  {expect.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Check className="mt-0.5 size-5 flex-shrink-0 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
