import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'

/**
 * InteriorDesignServices — editorial-spatial design-services ledger for an
 * upscale interior-design / architecture studio. An asymmetric header (mono
 * "02 / SERVICES" rail + light-weight heading on the left, supporting paragraph
 * on the right) above a collapsed-hairline three-column grid of service cells,
 * each a giant faint index numeral watermark with a hairline line icon (home /
 * briefcase / sofa), a mono index label, a medium title and a relaxed
 * description, cells sharing borders and washing to muted on hover. Editorial,
 * airy, binary radius — no icon tiles. Use to present core offerings —
 * residential design, commercial spaces, furniture curation — for interior
 * designers, design studios or architecture firms. Renders fully with no props
 * via baked-in defaults.
 */
export const InteriorDesignServices = defineCapsule({
  name: 'InteriorDesignServices',
  description:
    'Editorial-spatial design-services ledger for an upscale interior-design / architecture studio: an asymmetric header (mono "02 / SERVICES" rail + light-weight heading on the left, supporting paragraph on the right) above a collapsed-hairline three-column grid of service cells, each with a giant faint index numeral watermark, a hairline line icon (home / briefcase / sofa), a mono index label, a medium title and a relaxed description, cells sharing borders and washing to muted on hover. Editorial, airy, binary radius — no icon tiles. Use to present core offerings such as residential design, commercial spaces and furniture curation for interior designers, design studios or architecture firms.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Design excellence in every detail'
    const description =
      props.description ??
      'We believe that exceptional design lies in the thoughtful curation of space, light, and material. Our approach combines architectural integrity with personalized aesthetics.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Residential Design',
            description:
              'Complete home transformations from single rooms to full estates. We create living spaces that reflect your lifestyle while maximizing comfort and functionality.',
          },
          {
            title: 'Commercial Spaces',
            description:
              'Offices, retail, and hospitality environments designed to enhance productivity and brand identity. Strategic layouts that inspire teams and impress clients.',
          },
          {
            title: 'Furniture Curation',
            description:
              'Bespoke furniture selection and custom piece design. From vintage finds to contemporary maker collaborations, every piece tells a story in your space.',
          },
        ]

    const icons: ReactNode[] = [
      <svg
        key="home"
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
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>,
      <svg
        key="briefcase"
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
        <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>,
      <svg
        key="furniture"
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
        <path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>,
    ]

    return (
      <section
        className={cn(
          'px-4 pt-24 pb-16 sm:px-6 md:pt-28 md:pb-24 lg:px-8',
          props.className,
        )}
      >
        <Container size="xl">
          <div className="mb-12 grid gap-6 md:mb-16 md:grid-cols-12 md:items-end md:gap-10">
            <div className="md:col-span-7">
              <MonoTag className="mb-5 flex items-center gap-3 tracking-[0.2em]">
                <span aria-hidden="true" className="size-2 bg-primary" />
                02 / Services
              </MonoTag>
              <h2 className="max-w-xl text-balance text-3xl font-light tracking-tight text-foreground md:text-5xl">
                {heading}
              </h2>
            </div>
            <p className="max-w-md text-pretty leading-relaxed text-muted-foreground md:col-span-5 md:justify-self-end">
              {description}
            </p>
          </div>

          <div className="grid grid-cols-1 border-l border-t border-border md:grid-cols-3">
            {items
              .map((item, i) => ({ ...item, icon: icons[i % icons.length] }))
              .map((f, i) => {
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
                    className="group relative gap-4 overflow-hidden rounded-none border-0 border-b border-r border-border bg-transparent p-8 transition-colors duration-200 hover:translate-y-0 hover:bg-muted/40 md:p-10"
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-1 -top-3 select-none font-mono text-7xl font-light leading-none tabular-nums text-foreground/[0.05]"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {__iv__.icon && (
                      <FeatureIcon className="size-auto rounded-none bg-transparent text-foreground">
                        {__iv__.icon}
                      </FeatureIcon>
                    )}
                    <MonoTag tone="faint" className="tracking-[0.2em]">
                      No. {String(i + 1).padStart(2, '0')}
                    </MonoTag>
                    <FeatureTitle className="text-xl font-medium tracking-tight">
                      {__iv__.title}
                    </FeatureTitle>
                    <FeatureDescription className="leading-relaxed">
                      {__iv__.description}
                    </FeatureDescription>
                  </FeatureCard>
                )
              })}
          </div>
        </Container>
      </section>
    )
  },
})
