import { describe, expect, it } from 'vitest'

import { auditOpenUIProgram } from './openui-program-audit.ts'

const validPageSwitch = `root = PageSwitch(["Home", "Admin"], [home, admin])
home = BlogHero("Field Notes", ["Home", "Admin"], { title: "Field Notes" })
admin = SaasFeatures({ heading: "Field Notes Admin", subheading: "Manage Field Notes", features: [] })`

describe('auditOpenUIProgram', () => {
  it('accepts a complete PageSwitch program backed by known runtime components', async () => {
    await expect(
      auditOpenUIProgram(validPageSwitch, {
        expectedRoot: 'PageSwitch',
        expectedPageIds: ['home', 'admin'],
      }),
    ).resolves.toBeUndefined()
  })

  it('rejects unresolved references that regex guards cannot prove safe', async () => {
    await expect(
      auditOpenUIProgram(
        `root = PageSwitch(["Home"], [home])
home = BlogHero("Field Notes", ["Home"], { title: missingTitle })`,
        {
          expectedRoot: 'PageSwitch',
          expectedPageIds: ['home'],
        },
      ),
    ).rejects.toThrow(/unresolved references/)
  })

  it('rejects PageSwitch route/page count mismatches', async () => {
    await expect(
      auditOpenUIProgram(
        `root = PageSwitch(["Home", "Admin"], [home])
home = BlogHero("Field Notes", ["Home"], { title: "Field Notes" })`,
        {
          expectedRoot: 'PageSwitch',
          expectedPageIds: ['home', 'admin'],
        },
      ),
    ).rejects.toThrow(/expected 2 pages/)
  })
})
