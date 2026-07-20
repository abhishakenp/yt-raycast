import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * DentalWhyChooseUs — asymmetric 5/7 differentiators split for a dental
 * practice site. On a soft muted wash: a square hairline-framed clinic photo
 * with a restrained hard offset shadow on the left (5 cols) and, on the right
 * (7 cols), a left-aligned mono eyebrow + extrabold heading + lede followed by
 * an open hairline ledger of value props — each row pairing a zero-padded mono
 * index numeral with a title and supporting copy. Imagery uses the alt-driven
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
    'Asymmetric 5/7 differentiators split for a dental practice site on a soft muted wash: a square hairline-framed clinic photo with a restrained hard offset shadow on one side and, on the other, a left-aligned mono eyebrow + extrabold heading + lede followed by an open hairline ledger of value props, each row pairing a zero-padded mono index numeral with a title and supporting copy. Imagery uses the Image component. Use to communicate differentiators (technology, comfort, pricing, family care) for dentists, dental offices, or clinics.',
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
      <section
        className={cn('bg-muted/40 py-20 sm:py-24 lg:py-28', props.className)}
      >
        <Container>
          <WhyChooseUsGrid className="grid items-start gap-12 sm:grid-cols-1 lg:grid-cols-12 lg:gap-16">
            <div className="order-2 lg:order-1 lg:col-span-5">
              <div className="relative mr-2 sm:mr-3">
                <div className="aspect-[4/5] overflow-hidden border border-border shadow-[8px_8px_0_0] shadow-foreground/10">
                  <Image
                    alt={whyImageAlt}
                    w={800}
                    h={1000}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 lg:col-span-7">
              <SectionHeading
                align="left"
                eyebrow={whyEyebrow}
                title={whyHeading}
                subtitle={whyDesc}
                className="mb-10 gap-0"
                eyebrowClassName="mb-4 inline-block font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground"
                titleClassName="mb-5 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.05]"
                subtitleClassName="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
              />
              <ResponsiveGrid
                cols="1-2"
                className="gap-0 border-t border-border sm:grid-cols-1"
              >
                {whyItems.map((item, i) => (
                  <WhyChooseUsCard
                    key={item.title}
                    className="flex-row items-baseline gap-5 rounded-none border-0 border-b border-border bg-transparent py-5 sm:gap-8 sm:py-6"
                  >
                    <span
                      aria-hidden="true"
                      className="shrink-0 font-mono text-sm text-muted-foreground/60 tabular-nums sm:text-base"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0">
                      <h3 className="mb-1.5 text-lg font-bold tracking-tight text-foreground">
                        {item.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground sm:max-w-lg">
                        {item.description}
                      </p>
                    </span>
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
