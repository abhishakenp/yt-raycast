import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import {
  TestimonialGrid,
  TestimonialCard,
  TestimonialQuote,
  TestimonialAuthor,
  TestimonialName,
  TestimonialMeta,
} from '#/section-kit/TestimonialGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * FoodTruckTestimonials — a sticker-poster customer-reviews section with a press-logo
 * stamp strip. Under a giant ghost quotation watermark, a rotated rubber-stamp caption +
 * mono index eyebrow and an extrabold slab heading sit above a 3-up grid of hard-bordered
 * rounded-none quote slabs, alternately tilted with hard offset token shadows, each with a
 * five-star row, a quote and an avatar + name + role byline; a centered row of clickable
 * press / publication logos rendered as stamp chips follows. Avatars use the alt-driven
 * Image component; logos route through section-kit route links. Use as the social-proof
 * section for food trucks, restaurants, caterers or street-food vendors showing reviews
 * and press.
 */
export const FoodTruckTestimonials = defineCapsule({
  name: 'FoodTruckTestimonials',
  description:
    'Sticker-poster customer-reviews section with a press-logo stamp strip: under a giant ghost quotation watermark, a rotated rubber-stamp caption + mono index eyebrow and an extrabold slab heading above a 3-up grid of hard-bordered rounded-none quote slabs, alternately tilted with hard offset token shadows, each with a five-star row, a quote and an avatar + name + role byline, followed by a centered row of clickable press / publication logos rendered as stamp chips. Avatars use the alt-driven Image component; logos route through section-kit route links. Use as the social-proof / testimonials section for food trucks, restaurants, caterers or street-food vendors showing reviews and press mentions.',
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

    const gridItems = testItems.map((t) => ({
      quote: t.quote,
      name: t.name,
      role: t.role,
      avatarAlt: t.avatarAlt,
      rating: 5,
    }))

    const tilts = ['-rotate-1', 'rotate-1', '-rotate-2']

    const Stars = ({ count }: { count: number }) => (
      <div className="flex gap-0.5 text-primary" aria-hidden="true">
        {Array.from({ length: count }).map((_, i) => (
          <svg
            key={i}
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )

    return (
      <section
        className={cn(
          'relative overflow-hidden px-6 pt-24 pb-20',
          props.className,
        )}
      >
        <Watermark className="-left-2 top-2 text-[12rem] leading-none sm:text-[16rem] lg:text-[20rem]">
          &ldquo;
        </Watermark>
        <Container size="lg" className="relative">
          <div className="mb-12 flex flex-wrap items-center gap-3">
            <span className="inline-flex rotate-1 items-center rounded-full border-2 border-foreground bg-background px-3.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-foreground shadow-[3px_3px_0_0] shadow-primary/40">
              {testEyebrow}
            </span>
            <MonoTag>Word on the street</MonoTag>
          </div>
          <h2 className="mb-12 text-4xl font-extrabold tracking-tighter md:text-5xl">
            {testHeading}
          </h2>

          <TestimonialGrid>
            {gridItems.map((t, i) => {
              const __iv__ = t as {
                quote: string
                name: string
                role?: string
                company?: string
                meta?: string
                rating?: number
                avatarAlt?: string
              }
              return (
                <TestimonialCard
                  key={__iv__.name}
                  className={cn(
                    'gap-4 rounded-none border-2 border-foreground bg-card p-6 shadow-[5px_5px_0_0] shadow-foreground transition-transform duration-150 hover:-translate-y-1 motion-reduce:transform-none',
                    tilts[i % tilts.length],
                  )}
                >
                  <Stars count={__iv__.rating ?? 5} />
                  <TestimonialQuote className="font-medium">
                    {__iv__.quote}
                  </TestimonialQuote>
                  <TestimonialAuthor className="border-t-2 border-dashed border-foreground/20 pt-4">
                    {__iv__.avatarAlt && (
                      <Image
                        alt={__iv__.avatarAlt}
                        w={96}
                        h={96}
                        loading="lazy"
                        className="size-10 rounded-none border-2 border-foreground object-cover"
                      />
                    )}
                    <div className="flex flex-col">
                      <TestimonialName className="font-extrabold">
                        {__iv__.name}
                      </TestimonialName>
                      {(__iv__.role || __iv__.company || __iv__.meta) && (
                        <TestimonialMeta className="font-mono text-[11px] uppercase tracking-[0.1em]">
                          {__iv__.role || __iv__.company || __iv__.meta}
                        </TestimonialMeta>
                      )}
                    </div>
                  </TestimonialAuthor>
                </TestimonialCard>
              )
            })}
          </TestimonialGrid>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-4">
            {pressLogos.map((logo) => (
              <NavbarRouteLink
                key={logo}
                className="rounded-full border-2 border-foreground bg-background px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-[0.12em] text-foreground transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0] hover:shadow-foreground active:translate-y-px active:shadow-none"
                href={logo}
              >
                {logo}
              </NavbarRouteLink>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
