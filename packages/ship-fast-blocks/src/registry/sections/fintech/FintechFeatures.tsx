import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { Card } from '#/section-kit/Card.tsx'
import { cn } from '#/lib/utils.ts'

/**
 * FintechFeatures — 6-up features grid for a digital-banking / fintech landing
 * page. A centered section heading + description above a responsive 1/2/3-column
 * grid of border-muted cards; each card carries a tokenized primary-colored
 * icon tile (rotating inline line-icons), a title, and a description. Use to
 * showcase product capabilities (transfers, cards, savings, analytics,
 * payments, business accounts). Tokens-only, no links. Renders fully with no
 * props via baked-in defaults.
 */
export const FintechFeatures = defineCapsule({
  name: 'FintechFeatures',
  description:
    '6-up features grid for a digital-banking / fintech landing page: centered section heading + description above a responsive 1/2/3-column grid of border-muted cards, each with a tokenized primary-colored icon tile (rotating inline line-icons), a title and a description. Use to showcase product capabilities (transfers, cards, savings, analytics, payments, business accounts). Tokens-only, no links.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Feature cards: title + description. */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Everything you need in one place'
    const description =
      props.description ??
      'From instant transfers to smart savings, Vault puts you in complete control of your money.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Instant Transfers',
            description:
              'Send money to anyone, anywhere in seconds. Zero fees between Vault accounts. Real-time notifications on every transaction.',
          },
          {
            title: 'Virtual & Physical Cards',
            description:
              'Generate unlimited virtual cards for online purchases. Order physical cards with customizable designs. Freeze instantly if lost.',
          },
          {
            title: 'Smart Savings Goals',
            description:
              'Set custom savings goals with automatic round-ups. Earn 3.5% APY on your savings. No minimum balance required ever.',
          },
          {
            title: 'Spending Analytics',
            description:
              'Beautiful charts show exactly where your money goes. Categorize transactions automatically. Get weekly spending insights.',
          },
          {
            title: 'Global Payments',
            description:
              'Send money to 180+ countries with competitive exchange rates. Multi-currency accounts. SWIFT and local transfer options.',
          },
          {
            title: 'Business Accounts',
            description:
              'Separate business and personal finances effortlessly. Team access controls. Invoice generation and expense tracking built-in.',
          },
        ]

    const featureIcons: ReactNode[] = [
      <svg
        key="bolt"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>,
      <svg
        key="card"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>,
      <svg
        key="savings"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      <svg
        key="analytics"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>,
      <svg
        key="globe"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      <svg
        key="team"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>,
    ]

    return (
      <section className={cn('py-20 lg:py-32', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <Card key={item.title} variant="muted">
                <div className="mb-4 grid size-12 place-items-center rounded-lg bg-primary text-primary-foreground">
                  {featureIcons[i % featureIcons.length]}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
