// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'

import { initRocketExhaust } from './odysseus-animated-backgrounds'

describe('rocket exhaust background activation', () => {
  afterEach(() => {
    document.body.className = ''
    document.body.replaceChildren()
  })

  it('does nothing when no launch flow is mounted', () => {
    initRocketExhaust()

    expect(document.body.classList.contains('sf-rocket-exhaust-active')).toBe(
      false,
    )
  })

  it('activates the body class when a launch flow exists inside the visual', () => {
    document.body.innerHTML = `
      <section class="launch-visual">
        <div class="launch-flow"></div>
      </section>
    `

    initRocketExhaust()

    expect(document.body.classList.contains('sf-rocket-exhaust-active')).toBe(
      true,
    )
  })

  it('also activates for standalone launch flow elements', () => {
    const flow = document.createElement('div')
    flow.className = 'launch-flow'
    document.body.append(flow)

    initRocketExhaust()

    expect(document.body.classList.contains('sf-rocket-exhaust-active')).toBe(
      true,
    )
  })
})
