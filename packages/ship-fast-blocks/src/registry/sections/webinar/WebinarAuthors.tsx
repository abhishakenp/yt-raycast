import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  PersonCard,
  PersonCardName,
  PersonCardRole,
  PersonCardBio,
} from '#/section-kit/PersonCard.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'

export const WebinarAuthors = defineCapsule({
  name: 'WebinarAuthors',
  description:
    'Speaker lineup band for a webinar or virtual event: a SectionHeading over a responsive grid of speaker cards, each with a rounded avatar photograph, name, role, company, and a short credibility-building bio. Use to introduce the presenters and establish authority on a webinar registration page.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
    speakers: z
      .array(
        z.object({
          name: z.string(),
          role: z.string(),
          company: z.string(),
          bio: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Speakers'
    const heading = props.heading ?? 'Meet the speakers'
    const subheading =
      props.subheading ??
      "Operators who have scaled SaaS products through the exact inflection points we'll cover."
    const speakers = props.speakers?.length
      ? props.speakers
      : [
          {
            name: 'Dana Whitfield',
            role: 'VP of Growth',
            company: 'Catalyst Labs',
            bio: 'Built and led growth teams across three SaaS scale-ups, taking two from $1M to $20M ARR.',
            avatarAlt:
              'professional headshot of a confident woman in business attire smiling at camera',
          },
          {
            name: 'Marcus Reyes',
            role: 'Head of Product',
            company: 'Northwind',
            bio: 'Product leader focused on activation and retention loops; previously shipped onboarding for a top PLG company.',
            avatarAlt:
              'professional headshot of a smiling man with short dark hair in a collared shirt',
          },
          {
            name: 'Priya Sharma',
            role: 'Founder & CEO',
            company: 'Loop Analytics',
            bio: 'Two-time founder who has raised across seed to Series B and obsesses over pricing and packaging.',
            avatarAlt:
              'professional headshot of a woman with long hair wearing a blazer against a neutral background',
          },
        ]

    return (
      <section
        className={cn(
          'bg-background py-20 text-foreground lg:py-28',
          props.className,
        )}
      >
        <Container size="lg" className="px-6 lg:px-6">
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            subtitle={subheading}
          />

          <ResponsiveGrid cols="1-2-3" className="mt-14 gap-6">
            {speakers.map((speaker, i) => (
              <PersonCard
                key={`${speaker.name}-${i}`}
                variant="outlined"

                className="items-center p-8 text-center rounded-2xl"
              >
                <Image
                  alt={speaker.avatarAlt}
                  w={160}
                  h={160}
                  loading="lazy"
                  className="size-20 rounded-full object-cover"
                />
                <PersonCardName className="mt-5 text-lg">
                  {speaker.name}
                </PersonCardName>
                <PersonCardRole className="mt-1 font-medium text-primary">
                  {speaker.role}
                </PersonCardRole>
                <p className="text-sm text-muted-foreground">
                  {speaker.company}
                </p>
                <PersonCardBio className="mt-4 leading-6">
                  {speaker.bio}
                </PersonCardBio>
              </PersonCard>
            ))}
          </ResponsiveGrid>
        </Container>
      </section>
    )
  },
})
