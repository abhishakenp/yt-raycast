import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  FeatureGrid,
  FeatureCard,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * EventPlannerServices — editorial gallery-plate services grid for an event
 * studio. An asymmetric intro (a mono metadata rail with a primary square, index
 * count and hairline rule above a giant tight-tracked heading and lede, over a
 * faint "MENU" watermark) sits above a staggered 3-up grid of hard-framed service
 * plates — each a rounded-none bordered card with an alt-driven 4:3 photo that
 * scales gently on hover, a mono index numeral, a bold title, a relaxed
 * description, and a ticket-stub "starting at" price chip. Imagery is alt-driven.
 * Use to present the service menu for wedding/event planners, gala organizers, or
 * premium hospitality services.
 */
export const EventPlannerServices = defineCapsule({
  name: 'EventPlannerServices',
  description:
    "Editorial gallery-plate services grid for an event studio: an asymmetric intro (a mono metadata rail with a primary square, index count and hairline rule above a giant tight-tracked heading and lede, over a faint 'MENU' watermark) above a staggered 3-up grid of hard-framed service plates, each a rounded-none bordered card with an alt-driven 4:3 photo that scales gently on hover, a mono index numeral, a bold title, a relaxed description, and a ticket-stub 'starting at' price chip. All imagery is alt-driven. Use to present the service menu (wedding planning, corporate events, private celebrations, galas, destination events, day-of coordination) for wedding/event planners, gala organizers, or premium hospitality services.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          price: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const servicesEyebrow = props.eyebrow ?? 'Our Services'
    const servicesHeading = props.heading ?? 'Comprehensive Event Solutions'
    const servicesDesc =
      props.description ??
      'From conception to celebration, we handle every aspect of your event with precision and creativity.'
    const serviceItems = props.items?.length
      ? props.items
      : [
          {
            title: 'Wedding Planning',
            description:
              'Full-service wedding coordination from engagement to "I do." We manage venues, vendors, timelines, and every detail that makes your day uniquely yours.',
            price: 'Starting at $8,500',
            imageAlt:
              'Elegant wedding ceremony with white floral arch and guests seated on manicured lawn',
          },
          {
            title: 'Corporate Events',
            description:
              "Professional galas, product launches, and executive retreats that reflect your brand's sophistication and leave lasting impressions on clients and partners.",
            price: 'Starting at $12,000',
            imageAlt:
              'Modern corporate conference with attendees networking in contemporary venue space',
          },
          {
            title: 'Private Celebrations',
            description:
              "Milestone birthdays, anniversary dinners, and intimate gatherings crafted with personal touches that honor life's precious moments.",
            price: 'Starting at $3,500',
            imageAlt:
              'Intimate private dinner party with elegant table setting and soft ambient lighting',
          },
          {
            title: 'Non-Profit Galas',
            description:
              'Fundraising events that inspire generosity and community engagement. We understand the unique needs of charitable organizations and donor cultivation.',
            price: 'Starting at $6,000',
            imageAlt:
              'Elegant charity gala with formal dinner setup and stage for presentations',
          },
          {
            title: 'Destination Events',
            description:
              'Napa wine country weddings, tropical celebrations, and European villa gatherings. We coordinate travel, accommodations, and local vendor relationships.',
            price: 'Starting at $15,000',
            imageAlt:
              'Elegant outdoor garden party with string lights and beautifully decorated tables',
          },
          {
            title: 'Day-Of Coordination',
            description:
              'Already planned your event? Our day-of coordination ensures flawless execution. We manage the timeline, vendors, and any unexpected situations.',
            price: 'Starting at $2,500',
            imageAlt:
              'Sophisticated cocktail party with elegant bar setup and professional bartenders',
          },
        ]

    return (
      <section
        className={cn(
          'relative overflow-hidden px-4 pt-28 pb-20 sm:px-6 lg:px-8 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <span className="absolute -right-6 top-8 select-none font-extrabold leading-none tracking-tighter text-foreground/[0.035] text-[9rem] sm:text-[13rem] lg:text-[17rem]">
            MENU
          </span>
        </div>
        <Container size="xl" className="relative">
          <div className="mb-14 max-w-3xl lg:mb-20">
            <div className="flex items-center gap-4">
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 bg-primary"
              />
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {servicesEyebrow}
              </span>
              <span aria-hidden="true" className="h-px flex-1 bg-border" />
              <span
                aria-hidden="true"
                className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60 tabular-nums"
              >
                {String(serviceItems.length).padStart(2, '0')} / services
              </span>
            </div>
            <h2 className="mt-6 text-4xl font-extrabold leading-[0.95] tracking-tighter text-foreground text-balance sm:text-5xl lg:text-6xl">
              {servicesHeading}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              {servicesDesc}
            </p>
          </div>
          <FeatureGrid columns={3} className="gap-8">
            {serviceItems.map((f, i) => {
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
                  className={cn(
                    'group gap-0 overflow-hidden rounded-none border-2 border-foreground/15 p-0 hover:-translate-y-1 hover:border-foreground/40',
                    i % 3 === 1 && 'lg:translate-y-8',
                  )}
                >
                  {__iv__.imageAlt ? (
                    <div className="relative overflow-hidden border-b-2 border-foreground/15">
                      <Image
                        alt={__iv__.imageAlt}
                        w={640}
                        h={480}
                        loading="lazy"
                        className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
                      />
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-0 border-b-2 border-r-2 border-foreground/15 bg-background px-2.5 py-1 font-mono text-[11px] font-semibold tabular-nums text-muted-foreground"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                  ) : null}
                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <FeatureTitle className="text-xl font-bold tracking-tight">
                      {__iv__.title}
                    </FeatureTitle>
                    <FeatureDescription className="flex-1 text-[15px] leading-relaxed">
                      {__iv__.description}
                    </FeatureDescription>
                    {__iv__.price ? (
                      <span className="mt-2 inline-flex w-fit items-center gap-2 rounded-none border border-foreground/20 bg-muted px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-foreground">
                        <span aria-hidden="true" className="text-primary">
                          ◆
                        </span>
                        {__iv__.price}
                      </span>
                    ) : null}
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
