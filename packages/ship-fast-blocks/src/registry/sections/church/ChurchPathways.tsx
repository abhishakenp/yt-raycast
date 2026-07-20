import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  PathwayGrid,
  PathwayCard,
  PathwayCardImage,
  PathwayCardBody,
  PathwayCardTitle,
  PathwayCardDescription,
  PathwayCardCta,
} from '#/section-kit/PathwayGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * ChurchPathways — serene editorial "next step" pathways section for a church
 * or faith-community site. An asymmetric header row: a mono metadata rail
 * ("Pathways" — hairline rule — "01 — 03" index) above a large serif heading
 * on the left and the description pushed to the right column on desktop.
 * Below, a gently staggered 3-card grid (middle card drifts down on desktop):
 * each card is a sharp hairline-framed photo plate whose body carries a faint
 * serif index numeral beside a serif title, a quiet description, and an
 * uppercase-mono CTA with arrow above a hairline rule. Images lazily load and
 * scale softly on hover; CTAs route through section-kit route links. Use for
 * small-groups, kids/youth, serve-together, or any multi-pathway onboarding
 * flow for churches, ministries, or community organizations. Renders fully
 * with no props via baked-in defaults.
 */
export const ChurchPathways = defineCapsule({
  name: 'ChurchPathways',
  description:
    "Serene editorial next-step pathways section for a church or faith-community site: an asymmetric header row with a mono metadata rail ('Pathways' — hairline rule — index) above a large serif heading on the left and the description pushed right on desktop, then a gently staggered 3-card grid whose middle card drifts down. Each card is a sharp hairline-framed photo plate with a faint serif index numeral beside a serif title, quiet description, and an uppercase-mono CTA with arrow above a hairline rule. Images lazily load and scale softly on hover; CTAs route through section-kit route links. Use for small-groups, kids/youth, serve-together, or any multi-pathway onboarding flow for churches, ministries, or community organizations.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Paragraph under the heading. */
    description: z.string().optional(),
    /** Pathway cards; each has a title, description, CTA label, and image alt. */
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          cta: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Everyone has a next step'
    const description =
      props.description ??
      "Whether you're taking your first steps in faith or have been walking with Jesus for decades, we have pathways designed to help you grow, connect, and serve."
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Small Groups',
            description:
              'Meet weekly in homes across the Portland metro area. Share life, study scripture, and build lasting friendships with 8-12 people.',
            cta: 'Find a group',
            imageAlt:
              'Young adults laughing together during a small group Bible study in a cozy living room',
          },
          {
            title: 'Kids & Youth',
            description:
              'Nursery through high school programs every Sunday. Safe, fun environments where young people discover faith at their level.',
            cta: 'Learn more',
            imageAlt:
              'Children smiling and raising hands during a colorful Sunday school worship session',
          },
          {
            title: 'Serve Together',
            description:
              "Join one of 40+ volunteer teams. From greeting guests to global missions, there's a place for your gifts to make a difference.",
            cta: 'Explore teams',
            imageAlt:
              'Volunteers wearing matching t-shirts distributing food at a community outreach event',
          },
        ]

    return (
      <section className={cn('py-20 lg:py-28', props.className)}>
        <Container size="xl" className="px-6">
          {/* Asymmetric header: serif heading left, description offset right. */}
          <div className="mb-14 grid items-end gap-6 lg:mb-16 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <div className="mb-5 flex items-center gap-4">
                <MonoTag tone="primary" className="shrink-0">
                  Pathways
                </MonoTag>
                <span aria-hidden="true" className="h-px flex-1 bg-border" />
                <MonoTag tone="faint" className="shrink-0">
                  01 — {String(items.length).padStart(2, '0')}
                </MonoTag>
              </div>
              <SectionHeading
                align="left"
                title={heading}
                className="gap-0"
                titleClassName="font-serif text-4xl font-medium leading-[1.08] tracking-tight text-foreground sm:text-5xl"
              />
            </div>
            <p className="max-w-md border-l border-border pl-5 text-base leading-relaxed text-muted-foreground sm:text-lg lg:col-span-5 lg:justify-self-end">
              {description}
            </p>
          </div>
          <PathwayGrid cols="1-2-3" className="gap-x-8 gap-y-12">
            {items.map((item, i) => (
              <PathwayCard
                key={item.title}
                className={cn(
                  'rounded-none border-border bg-background transition-colors duration-200 hover:border-foreground/40',
                  i % 3 === 1 && 'lg:translate-y-10',
                  i % 2 === 1 && 'sm:max-lg:translate-y-8',
                )}
              >
                <PathwayCardImage className="border-b border-border">
                  <Image
                    alt={item.imageAlt}
                    w={600}
                    h={450}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </PathwayCardImage>
                <PathwayCardBody className="gap-3 p-6 sm:p-7">
                  <div className="flex items-baseline gap-4">
                    <span
                      aria-hidden="true"
                      className="font-serif text-2xl font-medium italic leading-none text-muted-foreground/40"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <PathwayCardTitle className="font-serif text-xl font-medium tracking-tight sm:text-2xl">
                      {item.title}
                    </PathwayCardTitle>
                  </div>
                  <PathwayCardDescription className="leading-relaxed sm:text-base">
                    {item.description}
                  </PathwayCardDescription>
                  <PathwayCardCta
                    asChild
                    className="mt-2 items-center gap-1.5 border-t border-border pt-4 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground hover:text-muted-foreground"
                  >
                    <NavbarRouteLink href={item.cta}>
                      {item.cta}
                      <span
                        aria-hidden="true"
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </NavbarRouteLink>
                  </PathwayCardCta>
                </PathwayCardBody>
              </PathwayCard>
            ))}
          </PathwayGrid>
        </Container>
      </section>
    )
  },
})
