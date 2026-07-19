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
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  WhyChooseUsGrid,
  WhyChooseUsCard,
} from '#/section-kit/WhyChooseUsGrid.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
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
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
        }),
      )
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
        <Container>
          <WhyChooseUsGrid className="grid items-center gap-16 lg:grid-cols-2">
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
              <SectionHeading
                align="left"
                eyebrow={whyEyebrow}
                title={whyHeading}
                subtitle={whyDesc}
                className="mb-10 gap-0"
                eyebrowClassName="mb-3 inline-block text-xs font-semibold tracking-wider text-primary"
                titleClassName="mb-6 text-3xl font-bold text-foreground sm:text-4xl"
                subtitleClassName="text-lg leading-relaxed text-muted-foreground"
              />
              <ResponsiveGrid cols="1-2" gap="lg">
                {whyItems.map((item) => (
                  <WhyChooseUsCard key={item.title} className="rounded-xl">
                    <h3 className="mb-2 font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </WhyChooseUsCard>
                ))}
              </ResponsiveGrid>
            </div>
          </WhyChooseUsGrid>
        </Container>
      </section>
    )
  },
})
