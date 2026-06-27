import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { PricingGrid } from '#/section-kit/PricingGrid.tsx'

const DEFAULT_TIERS: {
  name: string
  price: string
  period?: string
  features?: string[]
  cta?: string
  ctaTarget?: string
  highlighted?: boolean
}[] = [
  {
    name: 'Basic Wellness',
    price: '$29',
    period: '/month',
    features: [
      'Annual wellness exam',
      'Core vaccinations',
      'Heartworm test',
      '10% off additional services',
    ],
    cta: 'Choose Basic',
    ctaTarget: 'Contact',
  },
  {
    name: 'Plus Care',
    price: '$49',
    period: '/month',
    features: [
      'Everything in Basic',
      'Two wellness exams a year',
      'Dental check & cleaning',
      'Flea, tick & heartworm prevention',
      '15% off additional services',
    ],
    cta: 'Choose Plus',
    ctaTarget: 'Contact',
    highlighted: true,
  },
  {
    name: 'Complete Care',
    price: '$79',
    period: '/month',
    features: [
      'Everything in Plus',
      'Unlimited wellness visits',
      'Routine bloodwork & labs',
      'Priority emergency access',
      '20% off additional services',
    ],
    cta: 'Choose Complete',
    ctaTarget: 'Contact',
  },
]

export const PetVeterinaryPricing = defineCapsule({
  name: 'PetVeterinaryPricing',
  description:
    'Transparent wellness-plan pricing band for a veterinary clinic site, composing the PricingGrid kit composite into membership tiers. Renders a Basic Wellness plan, a highlighted Plus Care plan marked as most popular, and a Complete Care plan — each with a friendly feature list and a routed CTA. Accepts a public `tiers` prop to override the plans. Use it to give pet parents clear, no-surprises options for keeping their companions healthy year-round.',
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    tiers: z
      .array(
        z.object({
          name: z.string(),
          price: z.string(),
          period: z.string().optional(),
          features: z.array(z.string()).optional(),
          cta: z.string().optional(),
          ctaTarget: z.string().optional(),
          highlighted: z.boolean().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Wellness plans made simple'
    const subheading =
      props.subheading ??
      'Affordable monthly care that spreads the cost of keeping your pet healthy — no hidden fees, ever.'
    const tiers = props.tiers?.length ? props.tiers : DEFAULT_TIERS

    return (
      <section
        className={
          'bg-background py-20 sm:py-24' +
          (props.className ? ' ' + props.className : '')
        }
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <PricingGrid
            heading={heading}
            subheading={subheading}
            tiers={tiers}
          />
        </div>
      </section>
    )
  },
})
