import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { FeatureGrid } from '#/section-kit/FeatureGrid.tsx'

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
        className={cn(
          'px-4 pt-28 pb-20 sm:px-6 lg:px-8 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow={servicesEyebrow}
            title={servicesHeading}
            subtitle={servicesDesc}
            align="center"
            eyebrowClassName="text-muted-foreground tracking-widest"
            titleClassName="text-3xl font-light sm:text-4xl lg:text-5xl"
            subtitleClassName="text-lg"
            className="mb-16 max-w-3xl gap-6 lg:mb-24"
          />
          <FeatureGrid features={serviceItems} columns={3} />
        </div>
      </section>
    )
  },
})
