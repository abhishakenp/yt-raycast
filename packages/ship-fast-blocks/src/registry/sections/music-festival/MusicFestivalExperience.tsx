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
 * MusicFestivalExperience — a kinetic-poster experience split for a music /
 * arts festival landing page. A two-column card-surface band with a giant ghost
 * watermark word: on the left a mono eyebrow, a big uppercase heading, an intro
 * paragraph, and a hairline-divided list of numbered features (immersive art,
 * curated dining, camping, wellness — each with a square outlined icon, a
 * mono index, a title and a description); on the right a four-up staggered
 * square-cornered photo collage. Photos use the alt-driven Image component.
 * Use to communicate everything-beyond-the-music value on music festivals, arts
 * festivals, camping/desert events, or any multi-day immersive event.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
export const MusicFestivalExperience = defineCapsule({
  name: 'MusicFestivalExperience',
  description:
    'Kinetic-poster experience split for a music / arts festival landing page: a two-column card-surface band under a giant ghost watermark word, with a mono eyebrow, a big uppercase heading, an intro paragraph, and a hairline-divided list of numbered features (immersive art, curated dining, camping community, wellness — each with a square outlined icon, a mono index, a title and a description) on the left, and a four-up staggered square-cornered photo collage on the right. Photos use the alt-driven Image component. Use to communicate everything-beyond-the-music value on music festivals, arts festivals, camping/desert events, raves, or any multi-day immersive event.',
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
        width="22"
        height="22"
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
        width="22"
        height="22"
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
        width="22"
        height="22"
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
        width="22"
        height="22"
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
      'h-64 object-cover rounded-none',
      'h-64 object-cover rounded-none mt-8',
      'h-64 object-cover rounded-none',
      'h-64 object-cover rounded-none -mt-8',
    ]
    return (
      <section
        className={cn(
          'relative overflow-hidden bg-card py-24 text-card-foreground lg:py-28',
          props.className,
        )}
      >
        <Watermark className="-left-4 top-8 hidden text-[12rem] leading-[0.8] lg:block">
          MORE
        </Watermark>
        <Container className="relative">
          <div className="grid items-center gap-16 lg:grid-cols-[5fr_7fr]">
            <div>
              <SectionHeading
                align="left"
                eyebrow={eyebrow}
                title={heading}
                subtitle={description}
                className="mb-10 gap-3"
                eyebrowClassName="font-mono text-[11px] uppercase tracking-[0.2em] text-primary"
                titleClassName="text-4xl font-extrabold uppercase tracking-tight lg:text-5xl"
                subtitleClassName="text-lg leading-relaxed text-card-foreground/70"
              />
              <div className="border-t border-border">
                {features.map((f, i) => (
                  <FeatureListItem
                    key={f.title}
                    className="items-start gap-4 border-b border-border py-5"
                  >
                    <FeatureListItemIcon
                      shape="square"
                      className="grid size-11 shrink-0 place-items-center rounded-none border border-foreground bg-transparent text-foreground"
                    >
                      {featureIcons[i % featureIcons.length]}
                    </FeatureListItemIcon>
                    <FeatureListItemBody>
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-card-foreground/50">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <FeatureListItemTitle className="mt-0.5 text-lg font-bold uppercase tracking-tight">
                        {f.title}
                      </FeatureListItemTitle>
                      <FeatureListItemDescription className="mt-1 text-card-foreground/60">
                        {f.description}
                      </FeatureListItemDescription>
                    </FeatureListItemBody>
                  </FeatureListItem>
                ))}
              </div>
            </div>
            <ResponsiveGrid cols="2" className="gap-4">
              {imageAlts.map((alt, i) => (
                <Image
                  key={alt}
                  alt={alt}
                  w={600}
                  h={800}
                  loading="lazy"
                  className={cn(
                    'w-full grayscale-[0.1]',
                    collageCls[i % collageCls.length],
                  )}
                />
              ))}
            </ResponsiveGrid>
          </div>
        </Container>
      </section>
    )
  },
})
