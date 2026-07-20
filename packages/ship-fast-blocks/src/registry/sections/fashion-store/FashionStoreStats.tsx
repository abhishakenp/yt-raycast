import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import {} from '#/section-kit/index.ts'

/**
 * FashionStoreStats — slim brand stats ledger for a luxury fashion store. A
 * hairline top-and-bottom bordered band with a 2-to-4 column collapsed-border
 * grid of stat cells divided by thin vertical rules, each pairing a large
 * tabular-nums serif value with a small mono uppercase label. Use to surface
 * headline metrics — customers, markets, ratings, sustainability — for clothing
 * brands, boutiques, or any premium retail storefront.
 */
import { Container } from '#/section-kit/Container.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
export const FashionStoreStats = defineCapsule({
  name: 'FashionStoreStats',
  description:
    'Slim brand stats ledger for a luxury fashion store: a hairline top-and-bottom bordered band with a 2-to-4 column collapsed-border grid of stat cells divided by thin vertical rules, each pairing a large tabular-nums serif value with a small mono uppercase label. Use to surface headline metrics — happy customers, global markets, average rating, carbon neutrality — for clothing brands, boutiques, or any premium retail storefront.',
  props: z.object({
    items: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const statsItems = props.items?.length
      ? props.items
      : [
          {
            value: '50K+',
            label: 'Happy Customers',
          },
          {
            value: '12',
            label: 'Global Markets',
          },
          {
            value: '100%',
            label: 'Carbon Neutral',
          },
          {
            value: '4.9',
            label: 'Average Rating',
          },
        ]
    return (
      <section
        aria-label="Brand statistics"
        className={cn(
          'border-y border-border pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container>
          <StatGrid columns={4} className={'gap-0 divide-x divide-border'}>
            {statsItems.map((s) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem
                  key={__iv__.label}
                  align={'center'}
                  className="px-4 py-2"
                >
                  <StatValue
                    weight={'medium'}
                    size={'xl'}
                    fontFamily={'serif'}
                    className="font-normal"
                  >
                    {__iv__.value}
                  </StatValue>
                  <StatLabel className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em]">
                    {__iv__.label}
                  </StatLabel>
                </StatItem>
              )
            })}
          </StatGrid>
        </Container>
      </section>
    )
  },
})
