import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * FilmDirectorServices — a capabilities "shot list" for a film director or
 * cinematographer. A mono slate meta rule with a service count sits above an
 * asymmetric header (giant credits-style extrabold heading left, mono meta right),
 * over a responsive 1/2/3-column grid of square hairline cards, each carrying a
 * mono "SC. 0X / SERVICE" slate index, a giant ghost numeral, an extrabold title,
 * and a short muted description (no hover-lift). Tokens-only. Use to present
 * production offerings such as commercial direction, cinematography, creative
 * development, documentary, music videos, and post production for filmmakers,
 * directors, DPs, or video production houses.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  FeatureGrid,
  FeatureCard,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'
export const FilmDirectorServices = defineCapsule({
  name: 'FilmDirectorServices',
  description:
    'Capabilities "shot list" for a film director or cinematographer: a mono slate meta rule with a service count above an asymmetric header (giant credits-style extrabold heading left, mono meta right), over a responsive 1/2/3-column grid of square hairline cards, each with a mono "SC. 0X / SERVICE" slate index, a giant ghost numeral, an extrabold title, and a short muted description (no hover-lift). Tokens-only. Use to present production offerings such as commercial direction, cinematography, creative development, documentary, music videos, and post production for filmmakers, directors, DPs, or video production houses.',
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
          <div className="mb-10 flex items-center justify-between gap-4 border-b border-border pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="size-2 bg-primary" />
              Capabilities
            </span>
            <span className="tabular-nums">
              {String(serviceItems.length).padStart(2, '0')} services
            </span>
          </div>
          <SectionHeading
            align="left"
            title={servicesHeading}
            subtitle={servicesDesc}
            className="mb-12 max-w-2xl gap-0 sm:mb-16"
            titleClassName="mb-4 text-4xl font-extrabold tracking-tight md:text-5xl"
            subtitleClassName="leading-relaxed text-muted-foreground"
          />
          <FeatureGrid columns={3}>
            {serviceItems.map((f, i) => {
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
                  className="relative gap-3 overflow-hidden rounded-none border-border bg-card p-6 shadow-none hover:translate-y-0 hover:border-foreground/30 sm:p-8"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-2 -top-3 select-none font-extrabold leading-none tracking-tighter text-foreground/[0.05] text-7xl"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <MonoTag className="relative text-muted-foreground">
                    SC. {String(i + 1).padStart(2, '0')} / Service
                  </MonoTag>
                  <FeatureTitle className="relative text-xl font-extrabold tracking-tight">
                    {__iv__.title}
                  </FeatureTitle>
                  <FeatureDescription className="relative">
                    {__iv__.description}
                  </FeatureDescription>
                </FeatureCard>
              )
            })}
          </FeatureGrid>
        </Container>
      </section>
    )
  },
})
