import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { LogoStrip } from '#/section-kit/LogoStrip.tsx'

/**
 * CryptoLogos — trusted-by protocol logo strip for a crypto / DeFi landing
 * page. A bordered card band with a centered heading and a responsive grid
 * of text-based logo buttons (2-up mobile, 3-up tablet, 6-up desktop). Each
 * logo button routes through useNavigate. Use to display protocol partners,
 * institutional backers, integrated chains, or ecosystem partners.
 */
export const CryptoLogos = defineCapsule({
  name: 'CryptoLogos',
  description:
    'Trusted-by protocol logo strip for a crypto / DeFi landing page: a bordered card band with centered heading and responsive grid of text-based logo buttons (2-up mobile, 3-up tablet, 6-up desktop). Each logo routes through useNavigate. Use to display protocol partners, institutional backers, integrated chains, or ecosystem partners.',
  props: z.object({
    /** Heading above the logo grid. */
    heading: z.string().optional(),
    /** Logo / partner names rendered as buttons. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading =
      props.heading ?? 'Trusted by leading protocols and institutions'
    const items = props.items?.length
      ? props.items
      : ['Aave', 'Compound', 'Uniswap', 'Chainlink', 'Polygon', 'Arbitrum']

    return (
      <LogoStrip
        lead={heading}
        logos={items}
        logoStyle="text-bold"
        onClickLogo={go}
        className={cn('border-y border-border bg-card', props.className)}
      />
    )
  },
})
