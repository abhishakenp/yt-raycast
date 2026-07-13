import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * CafeValues — 4-up values / highlights grid for a cozy cafe / coffee shop
 * page, on a subtle card-colored band. Each of the four columns centers an
 * inline decorative icon inside a muted circular tile, a serif title, and a
 * small description. Icons rotate via index modulo four. No links. Use as a
 * trust / ethos block for cafes, bakeries, tea houses, or any small
 * food-and-drink business. Renders fully with no props via baked-in defaults.
 */
export const CafeValues = defineCapsule({
  name: 'CafeValues',
  description:
    '4-up values / highlights grid for a cozy cafe page on a card-colored band: each column centers an inline decorative icon inside a muted circular tile, a serif title, and a small description. Icons rotate via index modulo four. No links. Use as a trust / ethos block for cafes, bakeries, tea houses, or any small food-and-drink business.',
  props: z.object({
    /** Value cards: title + description. */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Single Origin',
            description:
              'Direct trade beans from Ethiopia, Colombia, and Guatemala',
          },
          {
            title: 'Baked Fresh',
            description: 'Pastries made in-house every morning at 4am',
          },
          {
            title: 'Community First',
            description:
              'Local art displays, open mic nights, neighborhood gatherings',
          },
          {
            title: 'Sustainable',
            description: 'Compostable cups, local sourcing, zero-waste goals',
          },
        ]

    const valueIcons: ReactNode[] = [
      <svg
        key="signal"
        className="size-7"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 2.829a4.978 4.978 0 01-1.414-2.83M6 12a6 6 0 0112 0v1H6v-1z"
        />
      </svg>,
      <svg
        key="clock"
        className="size-7"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>,
      <svg
        key="community"
        className="size-7"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"
        />
      </svg>,
      <svg
        key="sparkle"
        className="size-7"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
        />
      </svg>,
    ]

    return (
      <section className={cn('bg-card pt-28 pb-20', props.className)}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((v, i) => (
              <div key={v.title} className="space-y-4 text-center">
                <div className="mx-auto grid size-16 place-items-center rounded-full bg-muted text-primary">
                  {valueIcons[i % valueIcons.length]}
                </div>
                <h3 className="font-serif text-lg font-medium text-foreground">
                  {v.title}
                </h3>
                <p className="text-sm text-muted-foreground">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
