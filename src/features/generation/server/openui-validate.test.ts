import { describe, expect, it } from 'vitest'

import { validateOpenUISource } from '../../../../packages/ship-fast-engine/src/pipeline/openui-validate.js'

describe('validateOpenUISource', () => {
  it('rejects component calls that start with object literal arguments', () => {
    const result = validateOpenUISource(`root = Stack([home])
home = FaqHero({"SkillSetu", ["Home"], {"heading":"Bad"}})`)

    expect(result.ok).toBe(false)
    expect(result.errors.map((error) => error.message)).toContain(
      'Component calls must not start with an object literal argument',
    )
  })

  it('allows normal component calls with string first arguments', () => {
    const result = validateOpenUISource(`root = Stack([home])
home = FaqHero("SkillSetu", ["Home"], {"heading":"Good"})`)

    expect(result.ok).toBe(true)
  })
})
