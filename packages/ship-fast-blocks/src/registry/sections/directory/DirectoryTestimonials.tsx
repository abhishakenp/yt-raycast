import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * DirectoryTestimonials — dark inverted testimonials band for a local-business
 * directory. A foreground-on-background inverted section with a centered heading
 * + description and a responsive 3-column grid of quote cards on a translucent
 * surface: each has a 5-star primary rating row, the quote in inverted text, and
 * a customer footer with a round headshot, name, and role. Avatars use the
 * alt-driven Image component; no links. Use as social proof on local directories,
 * find-a-service platforms, or review-and-discovery sites.
 */
export const DirectoryTestimonials = defineComponent({
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

    const Star = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    return (
      <section
        className={cn(
          'bg-foreground py-16 text-background lg:py-24',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center lg:mb-16">
            <h2 className="mb-4 text-3xl font-semibold sm:text-4xl">
              {heading}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-background/70">
              {description}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
            {items.map((t) => (
              <blockquote
                key={t.name}
                className="rounded-xl bg-background/10 p-6 lg:p-8"
              >
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="size-5 text-primary" />
                  ))}
                </div>
                <p className="mb-6 text-background/80">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <Image
                    alt={t.avatarAlt}
                    w={100}
                    h={100}
                    className="size-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-sm text-background/60">{t.role}</div>
                  </div>
                </div>
              </blockquote>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
