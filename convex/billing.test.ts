import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const here = dirname(fileURLToPath(import.meta.url))

describe('convex billing source shape', () => {
  it('derives public billing identity from Convex auth instead of client userId args', () => {
    const source = readFileSync(join(here, 'billing.ts'), 'utf8')

    expect(source).toContain('ctx.auth.getUserIdentity()')
    expect(source).toContain('export const getSubscriptionStatus = query')
    expect(source).toContain('export const getCreditBalance = query')
    expect(source).toContain('export const getBillingOverview = query')
    expect(source).toContain('args: {}')
    expect(source).not.toContain('args: { userId: v.string() }')
  })
})
