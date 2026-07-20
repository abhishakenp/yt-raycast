import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { DotGrid } from '#/section-kit/Decor.tsx'
import { z } from 'zod/v4'

import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'

/**
 * PropertyListingFeatures — editorial "why search here" band for a property
 * marketplace. An asymmetric 5:7 split: a left rail with a mono meta rule
 * (primary tick + tabular benefit count), a left-aligned extrabold heading, and
 * the supporting subheading; on the right, a staggered 2-column grid of hairline
 * benefit cards over a faint dot-grid texture, each pairing a muted index
 * numeral with a bold title and short blurb (alternating cards step down on
 * desktop). Defaults cover verified listings, map search, saved alerts, and
 * virtual tours. Use to explain why renters and buyers should search on the
 * portal. Renders fully with no props via baked-in defaults.
 */
export const PropertyListingFeatures = defineCapsule({
  name: 'PropertyListingFeatures',
  description:
    'Editorial "why search here" band for a property marketplace: an asymmetric 5:7 split with a mono meta rule (primary tick + tabular benefit count), a left-aligned extrabold heading, and supporting subheading on the left, and a staggered 2-column grid of hairline benefit cards over a faint dot-grid texture on the right — each pairing a muted index numeral with a bold title and short blurb. Defaults cover verified listings, map search, saved alerts, and virtual tours. Use to explain why renters and buyers should search on the portal.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting line under the heading. */
    description: z.string().optional(),
    /** Benefit cards. */
    features: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'A smarter way to search'
    const description =
      props.description ??
      'Everything you need to find the right place faster — and skip the listings that waste your time.'
    const features = props.features?.length
      ? props.features
      : [
          {
            title: 'Verified listings',
            description:
              "Every listing is checked for accuracy and freshness, so you never chase a place that's already gone.",
          },
          {
            title: 'Map search',
            description:
              'Draw your area, see commute times, and explore homes right where you want to live.',
          },
          {
            title: 'Saved alerts',
            description:
              "Save a search and we'll ping you the moment a matching home hits the market.",
          },
          {
            title: 'Virtual tours',
            description:
              'Walk through homes in 3D before you book a visit — narrow your shortlist from the couch.',
          },
        ]

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background py-20 lg:py-28',
          props.className,
        )}
      >
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-5">
              <div className="flex items-center gap-4 border-b border-border pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                <span className="flex items-center gap-3">
                  <span aria-hidden="true" className="size-1.5 bg-primary" />
                  Why search here
                </span>
                <span aria-hidden="true" className="h-px flex-1 bg-border" />
                <span aria-hidden="true" className="tabular-nums">
                  {String(features.length).padStart(2, '0')}
                </span>
              </div>
              <SectionHeading
                align="left"
                title={heading}
                subtitle={description}
                className="mt-8 gap-4"
                titleClassName="text-3xl font-extrabold tracking-tighter text-foreground sm:text-4xl lg:text-5xl"
                subtitleClassName="max-w-md text-base leading-relaxed text-muted-foreground"
              />
            </div>

            <div className="relative lg:col-span-7">
              <DotGrid
                tone="border"
                fade="left"
                className="-right-6 -top-6 bottom-6 left-1/3 hidden lg:block"
              />
              <FeatureGrid columns={2} className="relative gap-0 sm:gap-5">
                {features.map((f, i) => {
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
                    <div
                      key={__iv__.title}
                      className={cn(
                        'mb-5 sm:mb-0',
                        i % 2 === 1 && 'sm:translate-y-8',
                      )}
                    >
                      <FeatureCard className="h-full gap-4 rounded-none bg-card p-6 hover:translate-y-0 hover:border-foreground/25 sm:p-7">
                        <span
                          aria-hidden="true"
                          className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60 tabular-nums"
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        {__iv__.icon && (
                          <FeatureIcon className="size-auto rounded-none bg-transparent p-0 text-muted-foreground">
                            {__iv__.icon}
                          </FeatureIcon>
                        )}
                        <FeatureTitle className="tracking-tight">
                          {__iv__.title}
                        </FeatureTitle>
                        <FeatureDescription className="leading-relaxed">
                          {__iv__.description}
                        </FeatureDescription>
                      </FeatureCard>
                    </div>
                  )
                })}
              </FeatureGrid>
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
