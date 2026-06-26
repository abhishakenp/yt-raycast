import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

/**
 * FoodTruckTestimonials — a customer-reviews section with a press-logo strip. A
 * centered eyebrow + heading sits above a 3-up grid of muted quote cards, each with a
 * five-star row, an italicized quote and an avatar + name + role byline, followed by a
 * centered row of clickable press / publication logos. Avatars use the alt-driven
 * Image component; logos route through useNavigate. Use as the social-proof section for
 * food trucks, restaurants, caterers or street-food vendors showing reviews and press.
 */
export const FoodTruckTestimonials = defineComponent({
  name: 'FoodTruckTestimonials',
  description:
    'Customer-reviews section with a press-logo strip: a centered eyebrow + heading above a 3-up grid of muted quote cards, each with a five-star row, a quote and an avatar + name + role byline, followed by a centered row of clickable press / publication logos. Avatars use the alt-driven Image component; logos route through useNavigate. Use as the social-proof / testimonials section for food trucks, restaurants, caterers or street-food vendors showing reviews and press mentions.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
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
    pressLogos: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const testEyebrow = props.eyebrow ?? 'Reviews'
    const testHeading = props.heading ?? 'What People Say'
    const testItems = props.items?.length
      ? props.items
      : [
          {
            quote:
              'Had them cater our company lunch for 80 people. The Korean short rib tacos were the hit of the day. Everyone asked where we found them. Will definitely book again!',
            name: 'Sarah Chen',
            role: 'VP Marketing, TechFlow Inc.',
            avatarAlt:
              'Professional headshot of Sarah Chen, a marketing executive',
          },
          {
            quote:
              "Best food truck in LA hands down. I've been tracking them for months. The cauliflower tacos are so good I dream about them. Worth driving across town for.",
            name: 'Marcus Johnson',
            role: 'Food Blogger @LAEats',
            avatarAlt:
              'Professional headshot of Marcus Johnson, a food blogger',
          },
          {
            quote:
              'Hired them for my wedding reception. They were professional, punctual, and the food was absolutely incredible. Our guests are still talking about it three months later!',
            name: 'Emily Rodriguez',
            role: 'Wedding Client',
            avatarAlt: 'Professional headshot of Emily Rodriguez, a bride',
          },
        ]
    const pressLogos = props.pressLogos?.length
      ? props.pressLogos
      : ['Eater LA', 'LA Times Food', 'The Infatuation']

    const Star = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="16"
        height="16"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    return (
      <section className={cn('px-6 py-20', props.className)}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 space-y-4 text-center">
            <span className="text-sm uppercase tracking-widest text-muted-foreground">
              {testEyebrow}
            </span>
            <h2 className="text-3xl font-bold md:text-4xl">{testHeading}</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {testItems.map((t) => (
              <div key={t.name} className="rounded-xl bg-muted p-6">
                <div className="mb-4 flex items-center gap-1 text-chart-4">
                  {[0, 1, 2, 3, 4].map((s) => (
                    <Star key={s} className="size-4" />
                  ))}
                </div>
                <p className="mb-6 leading-relaxed text-muted-foreground">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <Image
                    alt={t.avatarAlt}
                    w={120}
                    h={120}
                    className="size-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {t.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
            {pressLogos.map((logo) => (
              <button
                key={logo}
                type="button"
                onClick={() => go(logo)}
                className="text-sm font-semibold uppercase tracking-wide text-muted-foreground/60 transition-colors hover:text-foreground"
              >
                {logo}
              </button>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
