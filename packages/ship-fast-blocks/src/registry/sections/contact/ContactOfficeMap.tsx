import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * ContactOfficeMap — split office information and photo section for a contact page.
 * A two-column card: left side shows a heading, description, and icon-prefixed meta
 * rows (transit, parking, accessibility); right side shows a large cover photo
 * with a gradient overlay and a floating map-pin glyph. Use to present physical
 * location details on agency, SaaS, or startup contact pages. Renders fully with
 * no props via baked-in defaults.
 */
export const ContactOfficeMap = defineCapsule({
  name: 'ContactOfficeMap',
  description:
    'Split office information and photo section for a contact page: a two-column card with a heading, description, and icon-prefixed meta rows (transit, parking, accessibility) on the left; a large cover photo with gradient overlay and a floating map-pin glyph on the right. Use to present physical location details on agency, SaaS, or startup contact pages.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Short paragraph describing the office / visit policy. */
    description: z.string().optional(),
    /** Meta lines (e.g. transit notes, parking, accessibility). */
    meta: z.array(z.string()).optional(),
    /** Alt text driving the office photo via Image. */
    imageAlt: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Visit our HQ'
    const description =
      props.description ??
      'Our headquarters are located in the heart of San Francisco. We are always happy to welcome partners, clients, and friends for a coffee and a chat.'
    const meta = props.meta?.length
      ? props.meta
      : [
          '12 min walk from Montgomery BART',
          'Parking available on-site',
          'Wheelchair accessible entrance',
        ]
    const imageAlt = props.imageAlt ?? 'San Francisco downtown office building'

    const metaIcons: ReactNode[] = [
      <svg
        key="nav"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polygon points="3 11 22 2 13 21 11 13 3 11" />
      </svg>,
      <svg
        key="car"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 17h2v-3.34a4 4 0 0 0-.8-2.4L18 8H6L3.8 11.26a4 4 0 0 0-.8 2.4V17h2" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
      </svg>,
      <svg
        key="access"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="16" cy="4" r="1" />
        <path d="m18 19-1-7-6 1.5" />
        <path d="M5 8.5 9 7l1.5 4 4 1.5" />
        <path d="M4.24 19.5a5 5 0 1 0 6.88-6.55" />
      </svg>,
    ]

    return (
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <Container>
          <div className="grid overflow-hidden rounded-2xl border border-border shadow-[0_24px_64px_rgba(0,0,0,0.45)] md:grid-cols-[1fr_1.3fr]">
            <div className="flex flex-col justify-center bg-card p-11">
              <h2 className="mb-2.5 text-2xl font-bold text-foreground">
                {heading}
              </h2>
              <p className="mb-6 text-[0.95rem] leading-[1.7] text-muted-foreground">
                {description}
              </p>
              <div className="flex flex-col gap-3.5">
                {meta.map((line, i) => (
                  <div
                    key={line}
                    className="flex items-center gap-2.5 text-[0.92rem] text-muted-foreground"
                  >
                    <span className="text-primary">
                      {metaIcons[i % metaIcons.length]}
                    </span>
                    {line}
                  </div>
                ))}
              </div>
            </div>
            <div className="relative min-h-[260px] bg-muted md:min-h-[340px]">
              <Image
                alt={imageAlt}
                w={900}
                h={680}
                loading="lazy"
                className="absolute inset-0 size-full object-cover"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-background/70 via-transparent to-primary/10"
              />
              <span className="absolute bottom-4 left-4 grid size-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
