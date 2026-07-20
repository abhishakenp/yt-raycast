import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  ServiceCard,
  ServiceIcon,
  ServiceTitle,
  ServiceDescription,
} from '#/section-kit/ServicesGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'

/**
 * AgencyServices — neo-brutalist capabilities plate for a creative
 * digital-agency page. An asymmetric header (giant uppercase slab heading
 * left, mono "02 / Capabilities" index right, lead paragraph below) above one
 * thick-bordered plate carrying a hard 8px offset shadow: inside it a
 * collapsed-border grid of service cells (2-col on mobile, 3-col on desktop),
 * each with a mono index numeral, a giant ghost numeral in the corner, a slab
 * uppercase title and a description; cells flood muted and underline their
 * title in primary on hover. A rotated sticker chip with the derived item
 * count sits half over the plate's top edge. Tokens-only, no links. Use to
 * present an agency's offerings — brand strategy, UI/UX, development,
 * marketing, motion, creative direction — or any "what we do" capabilities
 * block. Renders fully with no props via six baked-in default services.
 */
export const AgencyServices = defineCapsule({
  name: 'AgencyServices',
  description:
    "Neo-brutalist capabilities plate for a creative digital-agency page: asymmetric header (giant uppercase slab heading left, mono index right) above one thick-bordered plate with a hard 8px offset shadow holding a collapsed-border grid of service cells (2-col mobile / 3-col desktop), each with a mono index numeral, a giant ghost numeral, a slab uppercase title and description; cells flood muted and underline titles in primary on hover, and a rotated sticker chip with the item count overlaps the plate edge. Tokens-only, no links. Use to present an agency's offerings (brand strategy, UI/UX, development, marketing, motion, creative direction) or any 'what we do' / capabilities block.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Service cards: title + description. */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Capabilities that cover the full journey.'
    const description =
      props.description ??
      'From initial concept to final pixel, we offer end-to-end services designed to transform ambitious ideas into market-leading digital products.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Brand Strategy',
            description:
              'Positioning, messaging, and visual identity systems that resonate with your audience and differentiate you from competitors.',
          },
          {
            title: 'UI/UX Design',
            description:
              'User-centered interfaces crafted through research, wireframing, and high-fidelity prototyping for web and mobile.',
          },
          {
            title: 'Web Development',
            description:
              'Performance-first frontend engineering with modern frameworks, clean architecture, and scalable infrastructure.',
          },
          {
            title: 'Digital Marketing',
            description:
              'Data-driven growth campaigns across SEO, content, paid media, and social to acquire and retain high-value customers.',
          },
          {
            title: 'Motion Design',
            description:
              'Cinematic animations, micro-interactions, and video production that bring interfaces and stories to life.',
          },
          {
            title: 'Creative Direction',
            description:
              'Holistic creative leadership ensuring every touchpoint aligns with your brand vision and business objectives.',
          },
        ]
    const count = String(items.length).padStart(2, '0')

    return (
      <section
        className={cn('relative py-14 sm:py-20 lg:py-28', props.className)}
      >
        <Container size="xl" className="px-6">
          <div className="mb-4 flex items-end justify-between gap-6">
            <SectionHeading
              align="left"
              title={heading}
              className="max-w-3xl gap-0"
              titleClassName="text-4xl font-black uppercase leading-[0.95] tracking-tighter sm:text-6xl"
            />
            <MonoTag
              aria-hidden="true"
              className="hidden shrink-0 pb-2 sm:inline"
            >
              02 / Capabilities
            </MonoTag>
          </div>
          <p className="mb-12 max-w-xl text-base leading-relaxed text-muted-foreground sm:mb-16 sm:text-lg">
            {description}
          </p>

          <div className="relative">
            <span
              aria-hidden="true"
              className="absolute -top-4 right-4 z-10 inline-flex rotate-6 items-center rounded-full border-2 border-foreground bg-primary px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary-foreground shadow-[3px_3px_0_0] shadow-foreground sm:right-8"
            >
              {count} total
            </span>
            <div className="grid grid-cols-2 border-2 border-b-0 border-foreground bg-background shadow-[8px_8px_0_0] shadow-foreground lg:grid-cols-3">
              {items.map((f, i) => {
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
                  <ServiceCard
                    key={__iv__.title}
                    className={cn(
                      'group relative overflow-hidden rounded-none border-0 border-b-2 border-foreground bg-transparent p-4 shadow-none transition-colors hover:bg-muted/60 hover:shadow-none sm:p-8',
                      i % 2 === 0 && 'border-r-2',
                      i % 2 === 1 && 'border-r-0',
                      i % 3 !== 2 && 'lg:border-r-2',
                      i % 3 === 2 && 'lg:border-r-0',
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-2 -top-6 select-none text-[5rem] font-black leading-none tracking-tighter text-foreground/[0.05] sm:text-[7rem]"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <MonoTag className="text-[10px] text-muted-foreground/70">
                      {String(i + 1).padStart(2, '0')}
                    </MonoTag>
                    {__iv__.icon && <ServiceIcon>{__iv__.icon}</ServiceIcon>}
                    <ServiceTitle className="relative mt-3 text-base font-black uppercase leading-tight tracking-tight underline-offset-4 group-hover:underline group-hover:decoration-primary group-hover:decoration-4 sm:text-xl">
                      {__iv__.title}
                    </ServiceTitle>
                    <ServiceDescription className="relative mt-2 text-xs leading-relaxed sm:text-sm">
                      {__iv__.description}
                    </ServiceDescription>
                  </ServiceCard>
                )
              })}
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
