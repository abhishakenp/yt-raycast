import type { ReactNode } from 'react'
import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'

/**
 * InteriorDesignServices — left-aligned three-up design-services grid for an
 * upscale interior-design / architecture studio. A light-weight section heading
 * with a supporting paragraph above a responsive three-column grid of services,
 * each with a circular muted icon tile (rotating line icons: home, briefcase,
 * sofa), a medium title and a relaxed-leading description. Editorial, airy and
 * gallery-like. Use to present core offerings — residential design, commercial
 * spaces, furniture curation — for interior designers, design studios or
 * architecture firms. Renders fully with no props via baked-in defaults.
 */
export const InteriorDesignServices = defineComponent({
  name: 'InteriorDesignServices',
  description:
    'Left-aligned three-up design-services grid for an upscale interior-design / architecture studio: a light-weight section heading with a supporting paragraph above a responsive three-column grid of services, each with a circular muted icon tile (rotating home / briefcase / sofa line icons), a medium title and a relaxed description. Editorial and airy. Use to present core offerings such as residential design, commercial spaces and furniture curation for interior designers, design studios or architecture firms.',
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
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>,
      <svg
        key="briefcase"
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
        <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>,
      <svg
        key="furniture"
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
        <path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>,
    ]

    return (
      <section
        className={cn('px-4 py-20 sm:px-6 md:py-32 lg:px-8', props.className)}
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 max-w-2xl md:mb-24">
            <h2 className="mb-6 text-3xl font-light text-foreground md:text-4xl">
              {heading}
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
          <div className="grid gap-12 md:grid-cols-3 md:gap-16">
            {items.map((item, i) => (
              <div key={item.title} className="space-y-6">
                <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  {icons[i % icons.length]}
                </div>
                <h3 className="text-xl font-medium text-foreground">
                  {item.title}
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
