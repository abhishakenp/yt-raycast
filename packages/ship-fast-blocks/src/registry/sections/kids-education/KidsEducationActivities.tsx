import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * KidsEducationActivities — playful activities / features grid for a kids /
 * family learning platform. A centered eyebrow + heading + description intro
 * above a responsive 3-up grid of rounded cards; each card has a photo with a
 * floating count badge, a rotating soft-tint icon tile (science, art, coding,
 * math, reading, nature), a title, a description, and an arrow "explore" link.
 * Cards lift and the photo zooms on hover. Every explore link routes through
 * section-kit route links. Use to showcase course categories / subjects for kids-education
 * startups, children's e-learning platforms, STEM programs, and family learning
 * apps. Renders fully with no props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  ActivityGrid,
  ActivityTile,
  ActivityTileMedia,
  ActivityTileBadge,
  ActivityTileIcon,
  ActivityTileTitle,
  ActivityTileDescription,
} from '#/section-kit/ActivityGrid.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

export const KidsEducationActivities = defineCapsule({
  name: 'KidsEducationActivities',
  description:
    "Playful activities / features grid for a kids / family learning platform: a centered eyebrow + heading + description intro above a responsive 3-up grid of rounded cards; each card has a photo with a floating count badge, a rotating soft-tint icon tile (science, art, coding, math, reading, nature), a title, a description, and an arrow 'explore' link, lifting and zooming the photo on hover. Explore links route through section-kit route links. Use to showcase course categories / subjects for kids-education startups, children's e-learning platforms, STEM programs, and family learning apps.",
  props: z.object({
    /** Uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description under the heading. */
    description: z.string().optional(),
    /** Activity cards. */
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          badge: z.string(),
          cta: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Activities'
    const heading = props.heading ?? 'Explore, Create, Learn'
    const description =
      props.description ??
      'Hundreds of age-appropriate activities across science, art, math, reading, and more. New content added weekly.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Science Lab',
            description:
              'Hands-on experiments exploring chemistry, physics, biology, and the natural world. From volcano eruptions to stargazing guides.',
            badge: '150+ Activities',
            cta: 'Explore Science',
            imageAlt:
              'Child conducting a colorful volcano science experiment with baking soda and vinegar',
          },
          {
            title: 'Art Studio',
            description:
              'Drawing, painting, sculpture, and digital art projects. Learn techniques from professional artists while expressing creativity.',
            badge: '200+ Projects',
            cta: 'Explore Art',
            imageAlt:
              'Child painting with bright watercolors on a large canvas in a sunny art studio',
          },
          {
            title: 'Coding Adventures',
            description:
              'Game-based programming for beginners. Build animations, games, and interactive stories with drag-and-drop blocks.',
            badge: '100+ Games',
            cta: 'Explore Coding',
            imageAlt:
              'Young child using a tablet to learn coding with colorful visual programming blocks',
          },
          {
            title: 'Math Magic',
            description:
              'Puzzles, games, and real-world math problems. From basic counting to early algebra concepts made fun and visual.',
            badge: '180+ Challenges',
            cta: 'Explore Math',
            imageAlt:
              'Colorful wooden math manipulatives and counting blocks arranged for learning',
          },
          {
            title: 'Story World',
            description:
              'Interactive stories, phonics games, and creative writing prompts. Build vocabulary and a lifelong love of reading.',
            badge: '500+ Stories',
            cta: 'Explore Reading',
            imageAlt:
              'Child reading a colorful picture book with whimsical illustrations',
          },
          {
            title: 'Nature Explorer',
            description:
              'Outdoor adventures, gardening guides, animal facts, and environmental science. Connect with the natural world.',
            badge: '120+ Explorations',
            cta: 'Explore Nature',
            imageAlt:
              'Children exploring nature outdoors with magnifying glass examining leaves and insects',
          },
        ]
    const activityIcons: ReactNode[] = [
      <svg
        key="science"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>,
      <svg
        key="art"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>,
      <svg
        key="coding"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>,
      <svg
        key="math"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>,
      <svg
        key="reading"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>,
      <svg
        key="nature"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
    ]
    const iconTints = [
      'bg-accent/15 text-accent-foreground',
      'bg-primary/15 text-primary',
      'bg-secondary/15 text-secondary-foreground',
      'bg-primary/15 text-primary',
      'bg-accent/15 text-accent-foreground',
      'bg-secondary/15 text-secondary-foreground',
    ]
    const ArrowRight = ({ className }: { className?: string }) => (
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
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )
    return (
      <section className={cn('bg-background py-24', props.className)}>
        <Container>
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            subtitle={description}
            className="mb-16 max-w-3xl gap-0"
            eyebrowClassName="mb-3 inline-block text-sm font-semibold tracking-wider text-secondary"
            titleClassName="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl"
            subtitleClassName="text-lg text-muted-foreground"
          />

          <ActivityGrid cols="1-2-3" className="gap-8">
            {items.map((item, i) => (
              <ActivityTile key={item.title}>
                <ActivityTileMedia>
                  <Image
                    alt={item.imageAlt}
                    w={600}
                    h={450}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <ActivityTileBadge>{item.badge}</ActivityTileBadge>
                </ActivityTileMedia>
                <ActivityTileIcon className={iconTints[i % iconTints.length]}>
                  {activityIcons[i % activityIcons.length]}
                </ActivityTileIcon>
                <ActivityTileTitle>{item.title}</ActivityTileTitle>
                <ActivityTileDescription>
                  {item.description}
                </ActivityTileDescription>
                <NavbarRouteLink
                  className="inline-flex items-center gap-2 font-semibold text-foreground transition-colors hover:text-secondary"
                  href={item.cta}
                >
                  {item.cta}
                  <ArrowRight className="size-4" />
                </NavbarRouteLink>
              </ActivityTile>
            ))}
          </ActivityGrid>
        </Container>
      </section>
    )
  },
})
