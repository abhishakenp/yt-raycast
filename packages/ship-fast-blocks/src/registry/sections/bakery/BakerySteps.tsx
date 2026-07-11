import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'

/**
 * BakerySteps — "how to order" 3-step guide for an artisan-bakery page, on a
 * card surface. A centered heading + lead paragraph above a responsive 3-up
 * grid of step cards; each card has a giant faded ordinal number bleeding off
 * the corner, a rounded tinted icon tile (rotating inline line-icons: device,
 * phone, pin), a title, a description, and an accent-colored note line. Warm,
 * editorial, light and craft-forward. Tokens-only, no links. Use to explain a
 * bakery's ordering options — pre-order online, call ahead, walk in — or any
 * "how it works" / process steps block for food makers. Renders fully with no
 * props via three baked-in default steps.
 */
export const BakerySteps = defineCapsule({
  name: 'BakerySteps',
  description:
    "'How to order' 3-step guide for an artisan-bakery page on a card surface: a centered heading and lead paragraph above a responsive 3-up grid of step cards, each with a giant faded ordinal number bleeding off the corner, a rounded tinted icon tile (rotating inline line-icons: device, phone, pin), a title, a description, and an accent-colored note line. Warm, editorial, light and craft-forward; tokens-only, no links. Use to explain a bakery's ordering options (pre-order online, call ahead, walk in) or any 'how it works' / process steps block for food makers.",
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

    return (
      <section className={cn('bg-card py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-semibold text-foreground lg:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {items.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="absolute -left-2 -top-4 text-6xl font-bold text-muted">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="relative h-full rounded-xl bg-muted p-8">
                  <div className="mb-6 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                    {stepIcons[i % stepIcons.length]}
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mb-4 leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                  <p className="text-sm font-medium text-primary">
                    {step.note}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
