import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  LocationBlock,
  LocationMap,
  LocationContact,
} from '#/section-kit/LocationBlock.tsx'
import { MapOverlay, MapPin } from '#/section-kit/MapBlock.tsx'

/**
 * ContactOfficeMap — slanted-seam office band for a contact page. The whole
 * section sits on a muted wash that cuts in on a diagonal clip-path seam, with
 * a giant ghost "→" watermark and a mono "02 / Visit" metadata rail over a
 * hairline rule. Inside, a sharp collapsed-border split card (asymmetric
 * 1:1.3): left panel carries the left-aligned heading, description, and a
 * hairline ledger of meta rows — mono index numeral + icon + line (transit,
 * parking, accessibility); right panel is a large cover photo with gradient
 * overlay and a squared map-pin chip. Tokens only, no soft shadows. Use to
 * present physical location details on agency, SaaS, or startup contact
 * pages. Renders fully with no props via baked-in defaults.
 */
export const ContactOfficeMap = defineCapsule({
  name: 'ContactOfficeMap',
  description:
    'Slanted-seam office band for a contact page: a muted wash cutting in on a diagonal clip-path seam with a giant ghost "→" watermark and mono "02 / Visit" metadata rail, holding a sharp collapsed-border split card (asymmetric 1:1.3) — left panel with left-aligned heading, description, and a hairline ledger of meta rows (mono index numeral + icon + line for transit, parking, accessibility); right panel a large cover photo with gradient overlay and squared map-pin chip. Tokens only, no soft shadows. Use to present physical location details on agency, SaaS, or startup contact pages.',
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
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polygon points="3 11 22 2 13 21 11 13 3 11" />
      </svg>,
      <svg
        key="car"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
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
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
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
      <section
        className={cn(
          'relative overflow-hidden bg-muted/40 py-14 pt-24 [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] sm:py-20 sm:pt-28 lg:py-24 lg:pt-32',
          props.className,
        )}
      >
        <Watermark className="-right-6 -bottom-20 text-[12rem] sm:text-[18rem]">
          →
        </Watermark>

        <Container className="relative">
          {/* Mono metadata rail */}
          <div className="mb-8 flex items-center gap-4 sm:mb-10">
            <MonoTag aria-hidden="true" className="text-foreground">
              02 / Visit
            </MonoTag>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
            <MonoTag aria-hidden="true" tone="faint">
              On-site
            </MonoTag>
          </div>

          <LocationBlock className="grid overflow-hidden rounded-none border border-border bg-card shadow-none md:grid-cols-[1fr_1.3fr]">
            <div className="flex flex-col justify-center border-b border-border p-7 sm:p-10 md:border-b-0 md:border-r lg:p-12">
              <SectionHeading
                align="left"
                title={heading}
                subtitle={description}
                className="gap-0"
                titleClassName="mb-3 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl"
                subtitleClassName="mb-7 text-[0.95rem] leading-[1.7] text-muted-foreground"
              />
              <LocationContact className="flex flex-col">
                {meta.map((line, i) => (
                  <div
                    key={line}
                    className="flex items-center gap-4 border-t border-border py-3.5 text-sm text-foreground"
                  >
                    <span
                      aria-hidden="true"
                      className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground/60"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-muted-foreground">
                      {metaIcons[i % metaIcons.length]}
                    </span>
                    {line}
                  </div>
                ))}
              </LocationContact>
            </div>
            <LocationMap className="h-auto min-h-[260px] overflow-hidden rounded-none md:min-h-[340px]">
              <Image
                alt={imageAlt}
                w={900}
                h={680}
                loading="lazy"
                className="absolute inset-0 size-full object-cover"
              />
              <MapOverlay />
              <MapPin className="rounded-none bg-foreground text-background shadow-none" />
            </LocationMap>
          </LocationBlock>
        </Container>
      </section>
    )
  },
})
