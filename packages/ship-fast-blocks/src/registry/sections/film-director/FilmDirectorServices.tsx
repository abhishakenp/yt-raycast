import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * FilmDirectorServices — a services / capabilities grid for a film director or
 * cinematographer. A left-aligned section header (thin heading + muted lede)
 * above a responsive 1/2/3-column grid of bordered cards, each with a rounded
 * muted icon tile (rotating line-art film, camera, lightbulb, clapper, music,
 * and sliders glyphs), a title, and a short muted description. Use to present
 * production offerings such as commercial direction, cinematography, creative
 * development, documentary, music videos, and post production for filmmakers,
 * directors, DPs, or video production houses.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'
export const FilmDirectorServices = defineCapsule({
  name: 'FilmDirectorServices',
  description:
    'Services / capabilities grid for a film director or cinematographer: a left-aligned section header (thin heading + muted lede) above a responsive 1/2/3-column grid of bordered cards, each with a rounded muted icon tile (rotating line-art film, camera, lightbulb, clapper, music, and sliders glyphs), a title, and a short muted description. Use to present production offerings such as commercial direction, cinematography, creative development, documentary, music videos, and post production for filmmakers, directors, DPs, or video production houses.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const servicesHeading = props.heading ?? 'Services'
    const servicesDesc =
      props.description ??
      'Full-service video production from concept development through post-production, tailored for commercial, narrative, and documentary projects.'
    const serviceItems = props.items?.length
      ? props.items
      : [
          {
            title: 'Commercial Direction',
            description:
              'Brand films, product launches, and advertising campaigns that connect with audiences and drive results.',
          },
          {
            title: 'Cinematography',
            description:
              'Award-winning DP work for features, shorts, music videos, and high-end commercial productions.',
          },
          {
            title: 'Creative Development',
            description:
              'Storyboarding, visual treatment design, and creative consulting from pre-production through delivery.',
          },
          {
            title: 'Documentary',
            description:
              'Long and short-form documentary production with journalistic integrity and cinematic vision.',
          },
          {
            title: 'Music Videos',
            description:
              'Visual storytelling for artists and labels, from intimate performance pieces to high-concept narratives.',
          },
          {
            title: 'Post Production',
            description:
              'Color grading, editing supervision, and delivery for broadcast, theatrical, and digital platforms.',
          },
        ]
    return (
      <section className={cn('pt-28 pb-20 lg:pt-32 lg:pb-28', props.className)}>
        <Container>
          <SectionHeading
            align="left"
            title={servicesHeading}
            subtitle={servicesDesc}
            className="mb-16 max-w-2xl gap-0"
            titleClassName="mb-4 text-3xl font-light md:text-4xl"
            subtitleClassName="leading-relaxed text-muted-foreground"
          />
          <FeatureGrid columns={3}>
            {serviceItems.map((f) => {
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
                <FeatureCard key={__iv__.title}>
                  {__iv__.icon && <FeatureIcon>{__iv__.icon}</FeatureIcon>}
                  <FeatureTitle>{__iv__.title}</FeatureTitle>
                  <FeatureDescription>{__iv__.description}</FeatureDescription>
                </FeatureCard>
              )
            })}
          </FeatureGrid>
        </Container>
      </section>
    )
  },
})
