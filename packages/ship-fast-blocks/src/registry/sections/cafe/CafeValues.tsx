import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'

/**
 * CafeValues — collapsed-border values ledger for a cozy cafe / coffee shop
 * page on a kraft-toned muted wash. A mono "House Rules" rail with a hairline
 * rule leads a shared-hairline grid (2-up on small screens, 4-up on desktop):
 * each cell carries a mono index numeral ("01"–"04") beside a small inline
 * decorative icon, a serif title, and a muted description, with hover lifting
 * the cell onto a card wash. Icons rotate via index modulo four. No links. Use
 * as a trust / ethos block for cafes, bakeries, tea houses, or any small
 * food-and-drink business. Renders fully with no props via baked-in defaults.
 */
export const CafeValues = defineCapsule({
  name: 'CafeValues',
  description:
    'Collapsed-border values ledger for a cozy cafe page on a kraft-toned muted wash: a mono rail with hairline rule leads a shared-hairline grid (2-up small screens, 4-up desktop) where each cell carries a mono index numeral beside a small inline decorative icon, a serif title, and a muted description, with a card-wash hover. Icons rotate via index modulo four. No links. Use as a trust / ethos block for cafes, bakeries, tea houses, or any small food-and-drink business.',
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
        className="size-5"
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
        className="size-5"
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
        className="size-5"
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
        className="size-5"
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
      <section
        className={cn(
          'bg-muted/40 pt-16 pb-16 lg:pt-20 lg:pb-20',
          props.className,
        )}
      >
        <Container size="xl" className="px-6">
          <div className="flex items-center gap-4">
            <MonoTag>House Rules</MonoTag>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
          </div>
          <div className="mt-6 grid grid-cols-1 border-t border-l border-foreground/15 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((v, i) => (
              <div
                key={v.title}
                className="group border-r border-b border-foreground/15 bg-background/60 p-6 transition-colors duration-150 hover:bg-card sm:p-7"
              >
                <div className="flex items-center justify-between gap-3">
                  <MonoTag tone="primary">
                    {String(i + 1).padStart(2, '0')}
                  </MonoTag>
                  <span className="text-muted-foreground transition-colors duration-150 group-hover:text-foreground">
                    {valueIcons[i % valueIcons.length]}
                  </span>
                </div>
                <h3 className="mt-5 font-serif text-xl font-medium tracking-tight text-foreground">
                  {v.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
