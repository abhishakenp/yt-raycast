import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { z } from 'zod/v4'

import {
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'

function PlaneIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.8 19.2 16 11l3.5-3.5a2.1 2.1 0 0 0-3-3L13 8 4.8 6.2a.5.5 0 0 0-.5.8l4 4-1.5 3-2-1a.5.5 0 0 0-.6.7l1.7 3 3 1.7a.5.5 0 0 0 .7-.6l-1-2 3-1.5 4 4a.5.5 0 0 0 .8-.5z" />
    </svg>
  )
}

function BedIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M2 16V6m0 4h20m0 6V10a2 2 0 0 0-2-2H8v4M2 20v-4m20 4v-4" />
      <circle cx="6" cy="11" r="1.5" />
    </svg>
  )
}

function PackageIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M21 8 12 3 3 8v8l9 5 9-5z" />
      <path d="M3 8l9 5 9-5M12 13v8" />
    </svg>
  )
}

function ShipIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 18a4 4 0 0 0 3 1 4 4 0 0 0 3-1 4 4 0 0 0 3 1 4 4 0 0 0 3-1 4 4 0 0 0 3 1" />
      <path d="M4 13l8-3 8 3-1.5 5H5.5z" />
      <path d="M12 10V4M9 6h6" />
    </svg>
  )
}

export const TravelAgencyServices = defineCapsule({
  name: 'TravelAgencyServices',
  description:
    'Editorial-wanderlust services ledger for the Travel Agency page family. An asymmetric intro (mono eyebrow + heading left, supporting copy right) above a collapsed-border grid of four service cells — Flights, Hotels, Packages, Cruises — each sharing hairline rules and carrying a ghost mono index numeral, a token-styled square line icon, a title, and a concise benefit-led description. Use to summarize what a curated travel agency handles beneath the hero. All copy is prop-driven with wanderlust-themed defaults so it renders with no props.',
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    services: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const icons = [
      <PlaneIcon className="size-6 text-primary" />,
      <BedIcon className="size-6 text-primary" />,
      <PackageIcon className="size-6 text-primary" />,
      <ShipIcon className="size-6 text-primary" />,
    ]
    const baseServices = props.services?.length
      ? props.services
      : [
          {
            title: 'Flights',
            description:
              'Best-fare routing in every cabin, with flexible dates and seamless rebooking handled by your dedicated advisor.',
          },
          {
            title: 'Hotels',
            description:
              'Hand-picked boutique stays and five-star resorts, complete with upgrades, late checkout, and exclusive perks.',
          },
          {
            title: 'Packages',
            description:
              'All-in-one itineraries that bundle flights, stays, and experiences into one effortless, beautifully priced trip.',
          },
          {
            title: 'Cruises',
            description:
              "Ocean and river voyages to once-in-a-lifetime ports, curated with the suites and shore excursions you'll love.",
          },
        ]
    const features = baseServices.map((service, index) => ({
      ...service,
      icon: icons[index % icons.length],
    }))
    return (
      <section
        className={cn(
          'bg-background pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container size="xl">
          <div className="mb-14 grid items-end gap-8 lg:grid-cols-12 lg:gap-12">
            <SectionHeading
              align="left"
              eyebrow="Services"
              title={props.heading ?? 'Everything for your journey'}
              className="gap-3 lg:col-span-7"
              eyebrowClassName="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground"
              titleClassName="text-4xl font-semibold tracking-tight lg:text-5xl"
            />
            <p className="text-base leading-relaxed text-muted-foreground lg:col-span-5 lg:pb-1">
              {props.subheading ??
                'One trusted team handling every detail, so you can simply look forward to the destination.'}
            </p>
          </div>
          <div className="grid grid-cols-1 border-l border-t border-border sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, index) => {
              const __iv__ = f as {
                title: string
                description: string
                icon?: React.ReactNode
                points?: string[]
                cta?: string
                price?: string
                imageAlt?: string
              }
              return (
                <div
                  key={__iv__.title}
                  className="group relative flex flex-col gap-4 border-b border-r border-border p-6 transition-colors duration-150 hover:bg-muted/40 sm:p-8"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-5 top-5 select-none font-mono text-5xl font-bold leading-none tabular-nums text-foreground/[0.07]"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <MonoTag tone="faint">
                    N° {String(index + 1).padStart(2, '0')}
                  </MonoTag>
                  {__iv__.icon && (
                    <FeatureIcon className="mt-2 size-11 rounded-none bg-primary/10">
                      {__iv__.icon}
                    </FeatureIcon>
                  )}
                  <FeatureTitle className="mt-1 text-lg font-semibold tracking-tight">
                    {__iv__.title}
                  </FeatureTitle>
                  <FeatureDescription className="leading-relaxed">
                    {__iv__.description}
                  </FeatureDescription>
                </div>
              )
            })}
          </div>
        </Container>
      </section>
    )
  },
})
