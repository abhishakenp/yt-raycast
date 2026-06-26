import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { CtaBand } from '#/section-kit/CtaBand.tsx'

/**
 * EcommerceCta — high-contrast sale / newsletter band for a general online
 * store. Thin configuration over the shared `CtaBand` composite at
 * tone="primary": a bold headline + sub paragraph over a primary surface, a
 * contrasting "Claim My 15% Off" pill (auto-inverted on the primary band), and
 * a small disclaimer carried in the eyebrow. The CTA routes through
 * useNavigate. Use as a prominent storewide conversion band to capture
 * subscribers, advertise a first-order discount, or push a sale for any
 * ecommerce / online retail site. Renders fully with no props via baked-in
 * defaults.
 */
export const EcommerceCta = defineComponent({
  name: 'EcommerceCta',
  description:
    "High-contrast sale / newsletter band for a general online store built on the shared CtaBand composite at tone='primary': a bold headline + sub paragraph over a primary surface, a contrasting 'Claim My 15% Off' pill (auto-inverted on the primary band), and a small disclaimer in the eyebrow. The CTA routes through useNavigate. Use as a prominent storewide conversion band to capture subscribers, advertise a first-order discount, or push a sale for any ecommerce or online retail site.",
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    submit: z.string().optional(),
    disclaimer: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Join & Save 15% On Your First Order'
    const subheading =
      props.subheading ??
      'Sign up for our newsletter to unlock an exclusive welcome discount, early access to sales, and the latest arrivals straight to your inbox.'
    const submit = props.submit ?? 'Claim My 15% Off'
    const disclaimer =
      props.disclaimer ??
      'No spam, just deals. Unsubscribe anytime. By subscribing you agree to our Terms.'

    return (
      <CtaBand
        tone="primary"
        eyebrow={disclaimer}
        title={heading}
        subtitle={subheading}
        actions={[{ label: submit, target: submit, variant: 'primary' }]}
        className={props.className}
      />
    )
  },
})
