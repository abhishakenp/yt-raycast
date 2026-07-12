import { expect, test } from 'vitest'
import { z } from 'zod/v4'
import { string, table } from '@ship-fast/lakebed/server'
import { createGoogleAuthFromToken } from '../../../packages/ship-fast-lakebed/src/auth-shared.ts'
import { defineCapsule } from '../../../packages/ship-fast-blocks/src/capsules/openui.ts'

function encodeTokenPayload(payload: Record<string, unknown>) {
  const encoded = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')

  return `header.${encoded}.signature`
}

test('lakebed auth creates user alias from Shoo identity claims', () => {
  const auth = createGoogleAuthFromToken(
    encodeTokenPayload({
      email: 'abhi@example.com',
      email_verified: true,
      name: 'Abhi',
      pairwise_sub: 'pairwise-user',
      picture: 'https://example.com/avatar.png',
    }),
  )

  expect(auth).toMatchObject({
    email: 'abhi@example.com',
    isAuthenticated: true,
    provider: 'google',
    user: {
      displayName: 'Abhi',
      email: 'abhi@example.com',
      id: 'google:pairwise-user',
      userId: 'google:pairwise-user',
    },
    userId: 'google:pairwise-user',
  })
})

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
        favoriteProductNames: ({ auth, data }) => {
          const userId: string = auth.user.id
          // @ts-expect-error ctx.auth.user.id is a string.
          const numericUserId: number = auth.user.id
          const productName: string = data.favorites[0]!.productName
          // @ts-expect-error productName is schema-derived as string, not number.
          const numericProductName: number = data.favorites[0]!.productName

          void userId
          void numericUserId
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
