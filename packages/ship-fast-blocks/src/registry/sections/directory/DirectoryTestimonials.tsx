import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * DirectoryTestimonials — dark inverted testimonials band for a local-business
 * directory. A foreground-on-background inverted section with a centered heading
 * + description and a responsive 3-column grid of quote cards on a translucent
 * surface: each has a 5-star primary rating row, the quote in inverted text, and
 * a customer footer with a round headshot, name, and role. Avatars use the
 * alt-driven Image component; no links. Use as social proof on local directories,
 * find-a-service platforms, or review-and-discovery sites.
 */
import { Container } from '#/section-kit/Container.tsx'
import { TestimonialGrid } from '#/section-kit/TestimonialGrid.tsx'
export const DirectoryTestimonials = defineCapsule({
  name: 'DirectoryTestimonials',
  description:
    'Dark inverted testimonials band for a local-business DIRECTORY: a foreground-on-background inverted section with a centered heading and description and a responsive 3-column grid of quote cards on a translucent surface — each has a 5-star primary rating row, the quote in inverted text, and a customer footer with a round headshot, name, and role. Avatars use the alt-driven Image component; no links. Use as social proof on local directories, business-listing marketplaces, find-a-service platforms, or review-and-discovery sites.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description under the heading. */
    description: z.string().optional(),
    /** Testimonial quote cards. */
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          role: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'What People Are Saying'
    const description =
      props.description ??
      'Real experiences from customers and business owners in our community'
    const items = props.items?.length
      ? props.items
      : [
          {
            quote:
              'Found an amazing contractor for my kitchen renovation through LocalFindr. The reviews were spot-on and saved me from hiring someone unreliable. Absolutely love this platform!',
            name: 'Sarah Mitchell',
            role: 'Homeowner in Portland',
            avatarAlt:
              'Professional headshot of a smiling woman with shoulder-length brown hair',
          },
          {
            quote:
              "Since listing my bakery on LocalFindr, we've seen a 40% increase in foot traffic. The platform connects us with customers who genuinely appreciate local businesses.",
            name: 'Marcus Chen',
            role: 'Owner, Sunrise Bakery',
            avatarAlt:
              'Professional headshot of a smiling man with short dark hair and glasses',
          },
          {
            quote:
              'As someone new to the city, LocalFindr has been invaluable. Found my gym, dentist, and favorite pizza place all in one week. The detailed reviews helped me make informed decisions.',
            name: 'James Rodriguez',
            role: 'New Resident in Austin',
            avatarAlt:
              'Professional headshot of a young man with curly hair and friendly expression',
          },
        ]
    return (
      <section
        className={cn(
          'bg-foreground py-16 text-background lg:py-24',
          props.className,
        )}
      >
        <Container>
          <div className="mb-12 text-center lg:mb-16">
            <h2 className="mb-4 text-3xl font-semibold sm:text-4xl">
              {heading}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-background/70">
              {description}
            </p>
          </div>

          <TestimonialGrid items={items} columns={3} />
        </Container>
      </section>
    )
  },
})
