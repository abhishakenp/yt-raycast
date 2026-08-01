/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'

import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

const adminIdentity = {
  tokenIdentifier: 'admin|maintenance',
  subject: 'maintenance-admin',
  system_role: 'admin',
}

describe('maintenance mode', () => {
  it('is disabled by default and can be toggled only by an admin', async () => {
    const t = convexTest(schema, modules)

    await expect(t.query(api.maintenance.getStatus, {})).resolves.toEqual({
      enabled: false,
    })
    await expect(
      t.mutation(api.maintenance.setEnabled, { enabled: true }),
    ).rejects.toThrow('Only administrators can change maintenance mode.')

    await expect(
      t.withIdentity(adminIdentity).mutation(api.maintenance.setEnabled, {
        enabled: true,
      }),
    ).resolves.toEqual({ enabled: true })
    await expect(t.query(api.maintenance.getStatus, {})).resolves.toEqual({
      enabled: true,
    })
  })

  it('keeps one maintenance record when an admin changes the setting', async () => {
    const t = convexTest(schema, modules)
    const admin = t.withIdentity(adminIdentity)

    await admin.mutation(api.maintenance.setEnabled, { enabled: true })
    await admin.mutation(api.maintenance.setEnabled, { enabled: false })

    const rows = await t.run((ctx) => ctx.db.query('appSettings').take(10))
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ key: 'maintenance', enabled: false })
  })
})
