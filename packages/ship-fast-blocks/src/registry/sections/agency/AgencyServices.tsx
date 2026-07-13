import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { ResponsiveGrid, Card } from '#/section-kit/index.ts'

/**
 * AgencyServices — capabilities / services grid for a creative digital-agency
 * page. A left-aligned section heading + lead paragraph above a responsive
 * 1/2/3-column grid of hover-lift cards; each card has a rounded tinted icon
 * tile (rotating inline line-icons), a title, and a description. Cards lift and
 * glow on hover. Tokens-only, no links. Use to present an agency's offerings —
 * brand strategy, UI/UX, development, marketing, motion, creative direction — or
 * any "what we do" capabilities block. Renders fully with no props via six
 * baked-in default services.
 */
export const AgencyServices = defineCapsule({
  name: 'AgencyServices',
  description:
    "Capabilities / services grid for a creative digital-agency page: a left-aligned section heading and lead paragraph above a responsive 1/2/3-column grid of hover-lift cards, each with a rounded tinted icon tile (rotating inline line-icons), a title and a description; cards lift and glow on hover. Tokens-only, no links. Use to present an agency's offerings (brand strategy, UI/UX, development, marketing, motion, creative direction) or any 'what we do' / capabilities block.",
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

    const serviceIcons: ReactNode[] = [
      <svg
        key="compass"
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
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>,
      <svg
        key="layout"
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
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>,
      <svg
        key="code"
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
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>,
      <svg
        key="megaphone"
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
        <path d="m3 11 18-5v12L3 14v-3z" />
        <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
      </svg>,
      <svg
        key="video"
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
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>,
      <svg
        key="sparkles"
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
        <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
        <path d="M19 15l.95 2.55L22.5 18.5l-2.55.95L19 22l-.95-2.55L15.5 18.5l2.55-.95L19 15z" />
      </svg>,
    ]

    return (
      <section
        className={cn(
          'relative pt-28 pb-24 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 max-w-3xl">
            <h2 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
              {heading}
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
          <ResponsiveGrid cols="1-md-2-3" gap="md">
            {items.map((item, i) => (
              <Card
                key={item.title}
                rounded="2xl"
                padding="lg"
                className="group transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.45)]"
              >
                <div className="mb-6 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                  {serviceIcons[i % serviceIcons.length]}
                </div>
                <h3 className="mb-3 text-xl font-semibold text-card-foreground">
                  {item.title}
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </Card>
            ))}
          </ResponsiveGrid>
        </div>
      </section>
    )
  },
})
