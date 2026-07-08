import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { ResponsiveGrid } from '#/section-kit/index.ts'

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
      <section
        className={cn('border-y border-border bg-card', props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="mb-8 text-center text-sm text-muted-foreground">
            {heading}
          </p>
          <ResponsiveGrid cols="2-3-6" gap="lg" className="items-center">
            {items.map((logo) => (
              <button
                key={logo}
                type="button"
                onClick={() => go(logo)}
                className="flex h-12 items-center justify-center text-xl font-bold text-muted-foreground transition-colors hover:text-foreground"
              >
                {logo}
              </button>
            ))}
          </ResponsiveGrid>
        </div>
      </section>
    )
  },
})
