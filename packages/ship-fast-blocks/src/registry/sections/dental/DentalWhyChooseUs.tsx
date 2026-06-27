import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * DentalWhyChooseUs — numbered "why choose us" split for a dental practice site.
 * On a soft muted band: a two-column layout with a tall rounded clinic photo on
 * one side and, on the other, an eyebrow + heading + lede followed by a vertical
 * list of value props, each prefixed with a zero-padded numbered primary tile
 * (01, 02, …) beside a title and supporting copy. Imagery uses the alt-driven
 * Image component. Use to communicate differentiators (technology, comfort,
 * pricing, family care) for dentists, dental offices, or clinics.
 */
export const DentalWhyChooseUs = defineCapsule({
  name: 'DentalWhyChooseUs',
  description:
    'Numbered why-choose-us split for a dental practice site on a soft muted band: a two-column layout with a tall rounded clinic photo on one side and, on the other, an eyebrow + heading + lede followed by a vertical list of value props, each prefixed with a zero-padded numbered primary tile (01, 02, ...) beside a title and supporting copy. Imagery uses the Image component. Use to communicate differentiators (technology, comfort, pricing, family care) for dentists, dental offices, or clinics.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    imageAlt: z.string().optional(),
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const whyEyebrow = props.eyebrow ?? 'Why Choose Us'
    const whyHeading = props.heading ?? 'Experience dentistry reimagined'
    const whyDesc =
      props.description ??
      "At Bright Smile Dental, we've created an environment where advanced technology meets genuine human care. Your comfort and results are our top priorities."
    const whyImageAlt =
      props.imageAlt ??
      'Female dentist performing gentle dental examination on comfortable patient in modern dental clinic'
    const whyItems = props.items?.length
      ? props.items
      : [
          {
            title: 'Advanced Technology',
            description:
              'Digital X-rays with 90% less radiation, 3D imaging, laser dentistry, and CEREC same-day crowns for precise, efficient care.',
          },
          {
            title: 'Pain-Free Techniques',
            description:
              'Nitrous oxide, oral sedation, and The Wand computer-assisted anesthesia ensure your comfort throughout every procedure.',
          },
          {
            title: 'Transparent Pricing',
            description:
              'No surprise bills. We provide upfront cost estimates, accept all major insurance plans, and offer flexible financing options.',
          },
          {
            title: 'Family-Friendly',
            description:
              'From toddlers to grandparents, we create personalized care plans for every age with a gentle, patient-centered approach.',
          },
        ]

    return (
      <section className={cn('bg-muted py-24', props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <div className="aspect-[4/5] overflow-hidden rounded-3xl shadow-xl">
                <Image
                  alt={whyImageAlt}
                  w={800}
                  h={1000}
                  loading="lazy"
                  className="size-full object-cover"
                />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-primary">
                {whyEyebrow}
              </span>
              <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl">
                {whyHeading}
              </h2>
              <p className="mb-10 text-lg leading-relaxed text-muted-foreground">
                {whyDesc}
              </p>
              <div className="space-y-8">
                {whyItems.map((item, i) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary font-bold text-primary-foreground">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-bold text-foreground">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  },
})
