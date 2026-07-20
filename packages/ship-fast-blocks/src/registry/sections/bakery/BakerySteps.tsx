import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import { DotGrid, MonoTag } from '#/section-kit/Decor.tsx'
import {
  StepTimeline,
  StepTimelineGrid,
  StepItem,
} from '#/section-kit/StepTimeline.tsx'

/**
 * BakerySteps — "how to order" 3-step guide for an artisan-bakery page, in a
 * playful-geometric warm language. An asymmetric heading row (mono "05 /
 * Order" index + oversized serif heading left, lead paragraph right) above a
 * 3-up grid of staggered step cards — the middle card drops on desktop for a
 * broken-grid rhythm. Each card is chunky-bordered with a soft offset shadow
 * and an alternating blob corner, carries a giant serif italic ghost ordinal
 * bleeding off its top-right corner, a rotated rounded-full sticker icon tile
 * (rotating inline line-icons: device, phone, pin), a serif title, a
 * description, and the note line as a rounded-full primary-washed mono chip.
 * A faint dot grid fades in behind the band. Tokens-only, no links. Use to
 * explain a bakery's ordering options — pre-order online, call ahead, walk in
 * — or any "how it works" / process steps block for food makers. Renders
 * fully with no props via three baked-in default steps.
 */
export const BakerySteps = defineCapsule({
  name: 'BakerySteps',
  description:
    "'How to order' 3-step guide for an artisan-bakery page in a playful-geometric warm language: an asymmetric heading row with a mono index tag and oversized serif heading beside the lead paragraph, above a 3-up grid of staggered step cards (middle card drops on desktop) — each chunky-bordered with soft offset shadow and an alternating blob corner, a giant serif italic ghost ordinal bleeding off the top-right corner, a rotated rounded-full sticker icon tile (rotating inline line-icons: device, phone, pin), a serif title, a description, and the note line as a rounded-full primary-washed mono chip — over a faint fading dot grid. Tokens-only, no links. Use to explain a bakery's ordering options (pre-order online, call ahead, walk in) or any 'how it works' / process steps block for food makers.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Step cards: title, description, note. */
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          note: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'How to order'
    const description =
      props.description ?? 'Three simple ways to get your hands on fresh bread.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Pre-order online',
            description:
              'Reserve your favorites by 6pm the day before. Pick up anytime during business hours. Guaranteed availability.',
            note: 'Best for: Large orders, special items, busy weekends',
          },
          {
            title: 'Call ahead',
            description:
              'Phone in your order for same-day pickup. We set aside your items and have them ready at the counter.',
            note: '(503) 555-0142',
          },
          {
            title: 'Walk in',
            description:
              'Visit us at 1423 Oak Street. First come, first served. Popular items often sell out by midday.',
            note: 'Open 7am–4pm daily',
          },
        ]

    const stepIcons: ReactNode[] = [
      <svg
        key="device"
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
        <path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>,
      <svg
        key="phone"
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
        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>,
      <svg
        key="pin"
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
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>,
    ]

    const cardShapes = [
      'rounded-[2rem] rounded-tl-none',
      'rounded-[2rem] rounded-br-none lg:translate-y-10',
      'rounded-[2rem] rounded-bl-none',
    ]
    const iconTilt = ['-rotate-3', 'rotate-3', '-rotate-2']

    return (
      <StepTimeline
        className={cn(
          'relative overflow-hidden bg-background py-16 lg:py-24 lg:pb-32',
          props.className,
        )}
      >
        <DotGrid
          density="loose"
          fade="bottom"
          className="inset-x-0 top-0 h-64"
        />
        <Container className="relative">
          <div className="mb-12 grid gap-5 lg:mb-16 lg:grid-cols-12 lg:items-end lg:gap-10">
            <div className="lg:col-span-7">
              <MonoTag>05 / Order</MonoTag>
              <h2 className="mt-4 font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {heading}
              </h2>
            </div>
            <p className="max-w-sm text-base leading-relaxed text-muted-foreground lg:col-span-5 lg:justify-self-end lg:text-right">
              {description}
            </p>
          </div>

          <StepTimelineGrid columns={3} className="gap-6 lg:gap-8">
            {items.map((step, i) => (
              <StepItem
                key={step.title}
                className={cn(
                  'relative overflow-hidden border-2 border-foreground/15 bg-card p-6 shadow-[6px_6px_0_0] shadow-foreground/10 transition-transform duration-150 hover:-translate-y-0.5 sm:p-8',
                  cardShapes[i % cardShapes.length],
                )}
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-2 -top-6 select-none font-serif text-[6rem] italic leading-none text-foreground/[0.07]"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div
                  className={cn(
                    'relative mb-6 grid size-12 place-items-center rounded-full border-2 border-foreground/15 bg-primary/10 text-primary shadow-[3px_3px_0_0] shadow-foreground/10',
                    iconTilt[i % iconTilt.length],
                  )}
                >
                  {stepIcons[i % stepIcons.length]}
                </div>
                <h3 className="relative mb-3 font-serif text-xl font-medium text-card-foreground sm:text-2xl">
                  {step.title}
                </h3>
                <p className="relative mb-5 leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
                <p className="relative inline-flex items-center rounded-full border-2 border-foreground/10 bg-primary/10 px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground">
                  {step.note}
                </p>
              </StepItem>
            ))}
          </StepTimelineGrid>
        </Container>
      </StepTimeline>
    )
  },
})
