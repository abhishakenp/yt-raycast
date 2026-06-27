import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * EventPlannerServices — airy services grid for an event-planning agency. A
 * centered intro block (uppercase eyebrow, thin light heading, supporting lede)
 * above a responsive 2-up/3-up grid of service cards, each with a rounded 4:3
 * photo that scales gently on hover, a medium-weight title, a relaxed description,
 * and a muted "starting at" price line. Imagery is alt-driven. Use to present the
 * service menu for wedding/event planners, gala organizers, or premium
 * hospitality services.
 */
export const EventPlannerServices = defineCapsule({
  name: 'EventPlannerServices',
  description:
    "Airy services grid for an event-planning agency: a centered intro block (uppercase eyebrow, thin light heading, supporting lede) above a responsive 2-up/3-up grid of service cards, each with a rounded 4:3 photo that scales gently on hover, a medium-weight title, a relaxed description, and a muted 'starting at' price line. All imagery is alt-driven. Use to present the service menu (wedding planning, corporate events, private celebrations, galas, destination events, day-of coordination) for wedding/event planners, gala organizers, or premium hospitality services.",
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
        className={cn('px-4 py-20 sm:px-6 lg:px-8 lg:py-32', props.className)}
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-24">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
              {servicesEyebrow}
            </p>
            <h2 className="mb-6 text-3xl font-light text-foreground sm:text-4xl lg:text-5xl">
              {servicesHeading}
            </h2>
            <p className="text-lg text-muted-foreground">{servicesDesc}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
            {serviceItems.map((item) => (
              <article key={item.title} className="group">
                <div className="mb-6 aspect-[4/3] overflow-hidden rounded-xl">
                  <Image
                    alt={item.imageAlt}
                    w={600}
                    h={450}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="mb-3 text-xl font-medium text-foreground">
                  {item.title}
                </h3>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
                <p className="text-sm text-muted-foreground">{item.price}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
