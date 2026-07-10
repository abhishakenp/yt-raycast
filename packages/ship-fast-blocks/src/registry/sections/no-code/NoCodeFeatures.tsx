import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Card } from '#/section-kit/Card.tsx'

/**
 * NoCodeFeatures — centered-header 6-up feature grid on a bright canvas. A
 * muted eyebrow, bold heading, and supporting paragraph sit above a 1-to-3
 * column grid of soft-bordered cards, each with a rounded tinted icon tile
 * (rotating token tints) that scales up on hover, a title, and a description.
 * Use as the core "everything you need" features section for a no-code builder,
 * SaaS, or product landing page. Renders fully with no props.
 */
export const NoCodeFeatures = defineCapsule({
  name: 'NoCodeFeatures',
  description:
    "Centered-header 6-up feature grid on a bright canvas: a muted eyebrow, bold heading, and supporting paragraph above a 1-to-3 column grid of soft-bordered cards, each with a rounded tinted icon tile (rotating token tints) that scales up on hover, a title, and a description. Use as the core 'everything you need' features section for a no-code / app-builder SaaS or product landing page.",
  props: z.object({
    /** Muted uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Feature cards (title + description). */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Features'
    const heading = props.heading ?? 'Everything you need to build amazing apps'
    const description =
      props.description ??
      'From drag-and-drop design to powerful integrations, Buildr gives you all the tools to bring your ideas to life.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Drag & Drop Builder',
            description:
              'Intuitive visual editor with 50+ pre-built components. Simply drag elements onto your canvas and arrange them exactly how you want.',
          },
          {
            title: '200+ Templates',
            description:
              'Start with professionally designed templates for SaaS, e-commerce, portfolios, blogs, and more. Fully customizable to match your brand.',
          },
          {
            title: 'Mobile Responsive',
            description:
              'Every app automatically adapts to any screen size. Preview and fine-tune your design for desktop, tablet, and mobile in real-time.',
          },
          {
            title: 'Lightning Fast',
            description:
              'Apps built on Buildr load instantly with global CDN delivery, automatic image optimization, and code minification built-in.',
          },
          {
            title: 'Secure by Default',
            description:
              "SSL certificates, DDoS protection, and SOC 2 compliance included. Your data and your users' data are always protected.",
          },
          {
            title: '100+ Integrations',
            description:
              'Connect with Stripe, Airtable, Zapier, Make, and more. Automate workflows and add powerful functionality without code.',
          },
        ]

    const iconTints = [
      'bg-primary/10 text-primary',
      'bg-secondary text-secondary-foreground',
      'bg-accent text-accent-foreground',
      'bg-chart-2/15 text-chart-2',
      'bg-chart-4/15 text-chart-4',
      'bg-chart-1/15 text-chart-1',
    ]
    const icons: ReactNode[] = [
      <svg
        key="drag"
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
        <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
        <path d="M13 13l6 6" />
      </svg>,
      <svg
        key="grid"
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
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>,
      <svg
        key="mobile"
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
        <rect x="7" y="2" width="10" height="20" rx="2" />
        <line x1="12" y1="18" x2="12" y2="18" />
      </svg>,
      <svg
        key="bolt"
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
        <polygon points="13 2 4 14 11 14 11 22 20 10 13 10 13 2" />
      </svg>,
      <svg
        key="shield"
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
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>,
      <svg
        key="plug"
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
        <path d="M9 7V3M15 7V3M7 7h10v4a5 5 0 01-10 0V7z" />
        <path d="M12 16v5" />
      </svg>,
    ]

    return (
      <section
        className={cn('bg-background py-24', props.className)}
        aria-labelledby="nc-features"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="mb-3 inline-block text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {eyebrow}
            </span>
            <h2
              id="nc-features"
              className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <Card
                key={item.title}
                rounded="2xl"
                className="group transition-all hover:border-border/80 hover:shadow-lg"
              >
                <div
                  className={cn(
                    'mb-4 grid size-12 place-items-center rounded-xl transition-transform group-hover:scale-110',
                    iconTints[i % iconTints.length],
                  )}
                >
                  {icons[i % icons.length]}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-card-foreground">
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
