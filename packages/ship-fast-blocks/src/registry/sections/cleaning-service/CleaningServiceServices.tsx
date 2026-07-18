import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import {
  localServiceItem,
  useSyncLocalServices,
} from '../local-service/local-service-interactions.tsx'
import { localServiceLakebed } from '../local-service/local-service-lakebed.ts'

/**
 * CleaningServiceServices — a 6-up cleaning-services capabilities grid for a home-cleaning / maid-service landing page. A centered section heading + lead paragraph above a responsive 1/2/3-column grid of clickable service cards; each card has a rounded icon tile (cycling through inline line-icons), a title, a description, and a from-price line. Cards gain a border highlight and lift shadow on hover, and each routes through useNavigate on click. Use for "what we do" / services blocks for residential cleaning companies, maid services, housekeeping platforms, or local home-service brands. Renders fully with no props via six baked-in default services.
 */
import { Container } from '#/section-kit/Container.tsx'
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
    "A 6-up cleaning-services capabilities grid for a home-cleaning / maid-service landing page: centered heading and lead paragraph above a responsive 1/2/3-column grid of clickable service cards, each with a rounded icon tile (cycling inline line-icons), title, description, and from-price line. Cards gain border highlight and lift shadow on hover; each routes through useNavigate on click. Use for 'what we do' services blocks for residential cleaning, maid services, housekeeping, or local home-service brands.",
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
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <FeatureGrid columns={3}>
            {items.map((f) => {
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
                <FeatureCard key={__iv__.title}>
                  {__iv__.icon && <FeatureIcon>{__iv__.icon}</FeatureIcon>}
                  <FeatureTitle>{__iv__.title}</FeatureTitle>
                  <FeatureDescription>{__iv__.description}</FeatureDescription>
                </FeatureCard>
              )
            })}
          </FeatureGrid>
        </Container>
      </section>
    )
  },
})
