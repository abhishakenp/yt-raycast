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
import { Watermark } from '#/section-kit/Decor.tsx'

export const WebinarAuthors = defineCapsule({
  name: 'WebinarAuthors',
  description:
    'Kinetic-event speaker lineup for a webinar or virtual summit: an asymmetric left-aligned header (mono index eyebrow + oversized heading + lede) with a giant ghost watermark, above a responsive grid of staggered, hairline-framed speaker cards. Each square-edged outlined card carries a mono lineup numeral, a square-framed avatar photograph, the name, a mono uppercase role, company, and a short credibility-building bio, and steps down the page for a kinetic stagger. Use to introduce the presenters and establish authority on a webinar registration page.',
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

    const stagger = [
      'lg:translate-y-0',
      'lg:translate-y-8',
      'lg:translate-y-16',
    ]

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background py-20 text-foreground lg:py-28',
          props.className,
        )}
      >
        <Watermark className="-left-6 top-8 text-[7rem] leading-none sm:text-[12rem] lg:text-[16rem]">
          LINEUP
        </Watermark>
        <Container size="lg" className="relative">
          <SectionHeading
            align="left"
            eyebrow={`01 / ${eyebrow}`}
            title={heading}
            subtitle={subheading}
            className="max-w-2xl gap-4"
            eyebrowClassName="text-muted-foreground"
            titleClassName="text-4xl font-extrabold tracking-tight sm:text-5xl"
            subtitleClassName="text-lg text-muted-foreground"
          />

          <ResponsiveGrid cols="1-2-3" className="mt-14 items-start gap-6">
            {speakers.map((speaker, i) => (
              <PersonCard
                key={`${speaker.name}-${i}`}
                variant="outlined"
                className={cn(
                  'items-center rounded-none border-foreground/80 p-8 text-center shadow-[6px_6px_0_0] shadow-foreground/10',
                  stagger[i % stagger.length],
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <span
                    aria-hidden="true"
                    className="font-mono text-sm tabular-nums text-muted-foreground/50"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span aria-hidden="true" className="size-1.5 bg-primary" />
                </div>
                <Image
                  alt={speaker.avatarAlt}
                  w={160}
                  h={160}
                  loading="lazy"
                  className="mt-4 size-20 rounded-none border border-border object-cover"
                />
                <PersonCardName className="mt-5 text-lg font-bold tracking-tight">
                  {speaker.name}
                </PersonCardName>
                <PersonCardRole className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-primary">
                  {speaker.role}
                </PersonCardRole>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
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
