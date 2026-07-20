import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import {
  LocalServiceBookingButton,
  LocalServiceMutationSpinner,
  localServiceItem,
  useSyncLocalServices,
} from '../local-service/local-service-interactions.tsx'
import { localServiceLakebed } from '../local-service/local-service-lakebed.ts'

/**
 * CleaningServiceServices — playful-Swiss collapsed-border services ledger for
 * a home-cleaning / maid-service landing page. An asymmetric header row (left
 * mono "01 / Services" eyebrow + heading + lead, right tabular mono item
 * count) above a 1/2/3-column collapsed-border grid whose cells share hairline
 * rules: each cell carries a giant ghost index numeral, a mono checkbox-square
 * index label, a bold title, a description, and a footer row pairing a mono
 * tabular from-price with a square hard-shadow "Book" button (press feedback)
 * that files a booking through the shared local-service lakebed. On mobile the
 * grid stacks into a single bordered ledger. Use for "what we do" / services
 * blocks for residential cleaning companies, maid services, housekeeping
 * platforms, or local home-service brands. Renders fully with no props via six
 * baked-in default services.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'
export const CleaningServiceServices = defineCapsule({
  name: 'CleaningServiceServices',
  description:
    "Playful-Swiss collapsed-border services ledger for a home-cleaning / maid-service landing page: asymmetric header row (left mono '01 / Services' eyebrow + heading + lead, right tabular mono item count) above a 1/2/3-column collapsed-border grid of service cells sharing hairline rules. Each cell has a giant ghost index numeral, a mono checkbox-square index label, a bold title, a description, and a footer row with a mono tabular from-price plus a square hard-shadow 'Book' button with press feedback that files a booking through the shared local-service lakebed. Stacks into a single bordered ledger on mobile. Use for 'what we do' services blocks for residential cleaning, maid services, housekeeping, or local home-service brands.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Service cards: title + description + from-price. */
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          price: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: localServiceLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Services designed around your life'
    const description =
      props.description ??
      'From one-time deep cleans to recurring maintenance, we have a service that fits your schedule and budget.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Standard Cleaning',
            description:
              'Perfect for weekly or bi-weekly maintenance. Includes dusting, vacuuming, mopping, bathroom sanitization, and kitchen wipe-down.',
            price: 'From $129 per visit',
          },
          {
            title: 'Deep Cleaning',
            description:
              'Intensive cleaning for neglected spaces. Inside appliances, baseboards, light fixtures, window sills, and detailed scrubbing of every surface.',
            price: 'From $249 per visit',
          },
          {
            title: 'Move-In/Move-Out',
            description:
              'Comprehensive cleaning for transitions. Cabinets, closets, appliances, and every nook cleaned to ensure your deposit return or fresh start.',
            price: 'From $349 per visit',
          },
          {
            title: 'Post-Construction',
            description:
              'Specialized cleaning after renovations. Dust removal, paint spot cleaning, debris disposal, and polishing of newly installed fixtures.',
            price: 'From $399 per visit',
          },
          {
            title: 'Same-Day Service',
            description:
              'Urgent cleaning when you need it most. Last-minute bookings available for unexpected guests, events, or emergencies within 4 hours.',
            price: 'From $199 per visit',
          },
          {
            title: 'Eco-Friendly Cleaning',
            description:
              'Plant-based, non-toxic products safe for children and pets. HEPA filtration vacuums and sustainable practices for health-conscious homes.',
            price: 'From $159 per visit',
          },
        ]
    useSyncLocalServices(
      lakebed,
      items.map((item) =>
        localServiceItem({
          name: item.title,
          price: item.price,
          summary: item.description,
        }),
      ),
    )
    return (
      <section className={cn('bg-background py-16 lg:py-24', props.className)}>
        <Container>
          <div className="mb-10 flex flex-col gap-4 sm:mb-14 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              eyebrow="01 / Services"
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-3"
              titleClassName="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
              subtitleClassName="max-w-xl text-lg text-muted-foreground"
            />
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70"
            >
              <span className="tabular-nums">
                {String(items.length).padStart(2, '0')}
              </span>{' '}
              services · flat rates
            </p>
          </div>
          <FeatureGrid
            columns={3}
            className="gap-0 [&>div]:gap-0 [&>div]:border-l-2 [&>div]:border-t-2 [&>div]:border-foreground"
          >
            {items.map((f, i) => {
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
                <FeatureCard
                  key={__iv__.title}
                  className="group relative gap-3 rounded-none border-0 border-b-2 border-r-2 border-foreground bg-card p-6 transition-colors duration-150 hover:-translate-y-0 hover:border-foreground hover:bg-muted/40 sm:p-8"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-4 top-3 select-none font-mono text-6xl font-extrabold tabular-nums leading-none text-foreground/[0.06] sm:text-7xl"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="flex items-center gap-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                    <span
                      aria-hidden="true"
                      className="grid size-4 place-items-center border-2 border-foreground bg-background text-primary"
                    >
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeLinecap="square"
                        aria-hidden="true"
                      >
                        <path d="M3 11l4 4 10-11" />
                      </svg>
                    </span>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {__iv__.icon && <FeatureIcon>{__iv__.icon}</FeatureIcon>}
                  <FeatureTitle className="text-xl font-bold tracking-tight text-card-foreground">
                    {__iv__.title}
                  </FeatureTitle>
                  <FeatureDescription className="text-sm leading-relaxed text-muted-foreground">
                    {__iv__.description}
                  </FeatureDescription>
                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
                    {__iv__.price ? (
                      <span className="font-mono text-xs font-semibold tabular-nums uppercase tracking-[0.06em] text-foreground">
                        {__iv__.price}
                      </span>
                    ) : (
                      <span />
                    )}
                    <LocalServiceBookingButton
                      lakebed={lakebed}
                      intentLabel={__iv__.title}
                      service={__iv__.title}
                      source="services"
                      aria-label={`Book ${__iv__.title}`}
                      pendingChildren={
                        <LocalServiceMutationSpinner className="text-foreground" />
                      }
                      className="inline-flex shrink-0 items-center justify-center rounded-none border-2 border-foreground bg-background px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-foreground shadow-[3px_3px_0_0] shadow-foreground transition-all duration-150 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:pointer-events-none disabled:opacity-70"
                    >
                      Book
                    </LocalServiceBookingButton>
                  </div>
                </FeatureCard>
              )
            })}
          </FeatureGrid>
        </Container>
      </section>
    )
  },
})
