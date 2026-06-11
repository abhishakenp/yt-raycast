import { test } from 'vitest'
import { z } from 'zod/v4'
import { string, table } from '@ship-fast/lakebed/server'
import { defineCapsule } from '../../../packages/ship-fast-blocks/src/capsules/openui.ts'

test('capsule lakebed query data is inferred from schema tables', () => {
  defineCapsule({
    name: 'LakebedTypeProbe',
    description: 'Type-only probe for lakebed schema inference.',
    props: z.object({}),
    lakebed: {
      schema: {
        favorites: table({
          productName: string(),
        }),
      },
      queries: {
        favoriteProductNames: ({ data }) => {
          const productName: string = data.favorites[0]!.productName
          // @ts-expect-error productName is schema-derived as string, not number.
          const numericProductName: number = data.favorites[0]!.productName

          void productName
          void numericProductName

          return new Set(
            (data.favorites ?? []).map((favorite) => favorite.productName),
          )
        },
      },
    },
    component: () => null,
  })
})
