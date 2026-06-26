import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

/**
 * DirectoryFeatured — featured-business listing gallery for a local-business
 * directory. A background section with a header row (heading + description on the
 * left, a "View All" link on the right) and a responsive 1-to-3-column grid of
 * rated listing cards: each card has a 4:3 cover photo with an overlaid category
 * pill and a primary star-rating badge, then the business name, address, an
 * open-hours line with a clock icon, and a review count. Every card and the
 * view-all link route through useNavigate; photos use the alt-driven Image
 * component. Use to showcase top-rated or handpicked listings on directories,
 * marketplaces, or review-and-discovery sites.
 */
export const DirectoryFeatured = defineComponent({
  name: 'DirectoryFeatured',
  description:
    'Featured-business listing gallery for a local-business DIRECTORY: a background section with a header row (heading and description on the left, a View All link on the right) and a responsive 1-to-3-column grid of rated listing cards — each card has a 4:3 cover photo with an overlaid category pill and a primary star-rating badge, then the business name, address, an open-hours line with a clock icon, and a review count. Every card and the view-all link route through useNavigate; photos use the alt-driven Image component. Use to showcase top-rated or handpicked listings on local directories, business-listing marketplaces, find-a-service platforms, or review-and-discovery sites.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description under the heading. */
    description: z.string().optional(),
    /** View-all link label. */
    viewAll: z.string().optional(),
    /** Featured listing cards. */
    items: z
      .array(
        z.object({
          name: z.string(),
          category: z.string(),
          rating: z.string(),
          address: z.string(),
          hours: z.string(),
          reviews: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Featured Businesses'
    const description =
      props.description ?? 'Top-rated local favorites handpicked by our team'
    const viewAll = props.viewAll ?? 'View All'
    const items = props.items?.length
      ? props.items
      : [
          {
            name: 'Brew & Bloom Café',
            category: 'Coffee Shop',
            rating: '4.9',
            address: '142 Oak Street, Downtown',
            hours: 'Open 7am - 8pm',
            reviews: '287 reviews',
            imageAlt:
              'Modern minimalist coffee shop interior with exposed brick walls',
          },
          {
            name: 'Shear Perfection Studio',
            category: 'Hair Salon',
            rating: '4.8',
            address: '385 Main Avenue, Westside',
            hours: 'Open 9am - 7pm',
            reviews: '156 reviews',
            imageAlt:
              'Upscale hair salon with modern styling stations and mirrors',
          },
          {
            name: 'Zenith Yoga Collective',
            category: 'Yoga Studio',
            rating: '5.0',
            address: '78 Wellness Lane, North Hills',
            hours: 'Open 6am - 9pm',
            reviews: '203 reviews',
            imageAlt:
              'Professional yoga studio with wooden floors and natural lighting',
          },
          {
            name: 'Rapid Flow Plumbing',
            category: 'Plumbing',
            rating: '4.7',
            address: 'Serving Metro Area · 24/7',
            hours: 'Always Open',
            reviews: '412 reviews',
            imageAlt: 'Modern plumbing service van with company branding',
          },
          {
            name: 'Hive Workspace',
            category: 'Office Space',
            rating: '4.6',
            address: '220 Innovation Drive, Tech District',
            hours: 'Open 8am - 8pm',
            reviews: '89 reviews',
            imageAlt: 'Contemporary co-working office space with modern desks',
          },
          {
            name: 'Bright Smile Dental',
            category: 'Dentist',
            rating: '4.9',
            address: '56 Medical Plaza, Suite 200',
            hours: 'Mon-Fri 8am - 6pm',
            reviews: '324 reviews',
            imageAlt: 'Modern dental clinic with state-of-the-art equipment',
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

    const Clock = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )

    return (
      <section className={cn('bg-background py-16 lg:py-24', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="mb-2 text-3xl font-semibold text-foreground sm:text-4xl">
                {heading}
              </h2>
              <p className="text-muted-foreground">{description}</p>
            </div>
            <button
              type="button"
              onClick={() => go(viewAll)}
              className="font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {viewAll}
            </button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((biz) => (
              <button
                key={biz.name}
                type="button"
                onClick={() => go(biz.name)}
                className="group block overflow-hidden rounded-xl border border-border bg-card text-left transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-[4/3] bg-muted">
                  <Image
                    alt={biz.imageAlt}
                    w={600}
                    h={450}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                  <span className="absolute left-3 top-3 rounded bg-card px-2 py-1 text-xs font-medium text-card-foreground">
                    {biz.category}
                  </span>
                  <span className="absolute right-3 top-3 flex items-center gap-1 rounded bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                    <Star className="size-3" />
                    {biz.rating}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="mb-1 text-lg font-semibold text-card-foreground">
                    {biz.name}
                  </h3>
                  <p className="mb-3 text-sm text-muted-foreground">
                    {biz.address}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="size-4" />
                      {biz.hours}
                    </span>
                    <span>·</span>
                    <span>{biz.reviews}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
