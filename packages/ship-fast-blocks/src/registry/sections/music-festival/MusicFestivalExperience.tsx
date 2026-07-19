import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  FeatureListItem,
  FeatureListItemIcon,
  FeatureListItemBody,
  FeatureListItemTitle,
  FeatureListItemDescription,
} from '#/section-kit/FeatureListItem.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'

/**
 * MusicFestivalExperience — an experience / features split for a music / arts
 * festival landing page. A two-column card-surface band: on the left an eyebrow,
 * heading, intro paragraph, and a vertical list of icon features (immersive art,
 * curated dining, camping, wellness — each with a rounded accent icon tile,
 * title and description); on the right a four-up staggered photo collage. Photos
 * use the alt-driven Image component. Use to communicate everything-beyond-the-
 * music value on music festivals, arts festivals, camping/desert events, or any
 * multi-day immersive event.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
export const MusicFestivalExperience = defineCapsule({
  name: 'MusicFestivalExperience',
  description:
    'Experience / features split for a music / arts festival landing page: a two-column card-surface band with an eyebrow, heading, intro paragraph, and a vertical list of icon features (immersive art, curated dining, camping community, wellness — each with a rounded accent icon tile, title and description) on the left, and a four-up staggered photo collage on the right. Photos use the alt-driven Image component. Use to communicate everything-beyond-the-music value on music festivals, arts festivals, camping/desert events, raves, or any multi-day immersive event.',
  props: z.object({
    /** Eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Intro paragraph beneath the heading. */
    description: z.string().optional(),
    /** Icon feature list (title + description). */
    features: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
        }),
      )
      .optional(),
    /** Alt texts for the four collage photos. */
    imageAlts: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'The Experience'
    const heading = props.heading ?? 'More than just music'
    const description =
      props.description ??
      'Horizon Festival is a complete sensory journey. Beyond the four stages, discover immersive art installations, curated food experiences, wellness programs, and a community that celebrates creativity in all its forms.'
    const features = props.features?.length
      ? props.features
      : [
          {
            title: 'Immersive Art',
            description:
              '15 large-scale installations by renowned contemporary artists transform the desert landscape into a living gallery.',
          },
          {
            title: 'Curated Dining',
            description:
              '40+ food vendors featuring local California cuisine, vegan options, and late-night snacks until 3am.',
          },
          {
            title: 'Camping Community',
            description:
              'Choose from car camping, RV spots, or premium glamping tents. All campers get exclusive sunrise acoustic sets.',
          },
          {
            title: 'Wellness Oasis',
            description:
              'Daily yoga, meditation sessions, and a dedicated chill zone with massage and sound healing.',
          },
        ]
    const imageAlts = props.imageAlts?.length
      ? props.imageAlts
      : [
          'Large-scale glowing art installation sphere in desert at night',
          'Festival camping area with colorful tents under starry desert sky',
          'Food truck serving gourmet tacos at an outdoor festival',
          'Group yoga session at sunrise in desert festival setting',
        ]
    const featureIcons: ReactNode[] = [
      <svg
        key="bulb"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>,
      <svg
        key="flame"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      </svg>,
      <svg
        key="clock"
        width="24"
        height="24"
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
        key="heart"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>,
    ]
    const collageCls = [
      'h-64 object-cover rounded-xl',
      'h-64 object-cover rounded-xl mt-8',
      'h-64 object-cover rounded-xl',
      'h-64 object-cover rounded-xl -mt-8',
    ]
    return (
      <section
        className={cn(
          'bg-card py-24 text-card-foreground lg:py-28',
          props.className,
        )}
      >
        <Container>
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <SectionHeading
                align="left"
                eyebrow={eyebrow}
                title={heading}
                subtitle={description}
                className="mb-8 gap-0"
                eyebrowClassName="mb-4 text-sm font-medium uppercase tracking-widest text-primary"
                titleClassName="mb-6 text-4xl font-bold tracking-tight lg:text-5xl"
                subtitleClassName="text-lg leading-relaxed text-card-foreground/70"
              />
              <div className="space-y-6">
                {features.map((f, i) => (
                  <FeatureListItem key={f.title} className="gap-4">
                    <FeatureListItemIcon
                      shape="square"
                      className="grid size-12 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground"
                    >
                      {featureIcons[i % featureIcons.length]}
                    </FeatureListItemIcon>
                    <FeatureListItemBody>
                      <FeatureListItemTitle className="mb-1 font-semibold">
                        {f.title}
                      </FeatureListItemTitle>
                      <FeatureListItemDescription className="text-card-foreground/60">
                        {f.description}
                      </FeatureListItemDescription>
                    </FeatureListItemBody>
                  </FeatureListItem>
                ))}
              </div>
            </div>
            <ResponsiveGrid cols="2" gap="sm">
              {imageAlts.map((alt, i) => (
                <Image
                  key={alt}
                  alt={alt}
                  w={600}
                  h={800}
                  loading="lazy"
                  className={cn('w-full', collageCls[i % collageCls.length])}
                />
              ))}
            </ResponsiveGrid>
          </div>
        </Container>
      </section>
    )
  },
})
