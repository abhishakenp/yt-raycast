import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'

/**
 * BarNightclubFeatures — 3-up centered features strip for a cocktail-bar /
 * nightclub page. A responsive row of equal columns, each with a thin
 * circle-bordered line icon (building / music / clock, rotated by index), a
 * medium title, and a muted description paragraph. Quiet, editorial, monochrome
 * — used to summarize the venue's three pillars (e.g. craft cocktails, live DJ
 * sets, late night). Use directly under the hero on bar, nightclub, lounge, or
 * speakeasy pages. Renders fully with no props via baked-in defaults.
 */
export const BarNightclubFeatures = defineCapsule({
  name: 'BarNightclubFeatures',
  description:
    "3-up centered features strip for a cocktail-bar / nightclub page: a responsive row of equal columns, each with a thin circle-bordered line icon (building / music / clock, rotated by index), a medium title, and a muted description paragraph. Quiet, editorial and monochrome, used to summarize the venue's three pillars such as craft cocktails, live DJ sets, and late night. Use directly under the hero on bar, nightclub, lounge, or speakeasy pages.",
  props: z.object({
    /** Three feature cards (title + description). */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Craft Cocktails',
            description:
              'Award-winning mixologists creating signature drinks with house-made syrups, rare spirits, and precision technique.',
          },
          {
            title: 'Live DJ Sets',
            description:
              'Resident and guest DJs spinning deep house, techno, and disco every Thursday through Saturday until 4 AM.',
          },
          {
            title: 'Late Night',
            description:
              'Open until 4 AM on weekends. Private booths, VIP sections, and bottle service available all night.',
          },
        ]

    return (
      <section className={cn('pt-28 pb-24 lg:pt-32 lg:pb-28', props.className)}>
        <Container>
          <FeatureGrid columns={3}>
            {items.map((f) => {
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
