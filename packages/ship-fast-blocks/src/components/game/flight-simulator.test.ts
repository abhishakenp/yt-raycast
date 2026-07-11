import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import FlightSimulator, { getFlightHudReadout } from './flight-simulator'

describe('getFlightHudReadout', () => {
  it('formats live flight telemetry for the HUD', () => {
    expect(
      getFlightHudReadout({
        altitude: 812.34,
        headingRadians: -Math.PI / 2,
        speedUnits: 50,
        thrusting: true,
        boosting: false,
      }),
    ).toEqual({
      altitude: '812.3',
      heading: '270',
      speed: '180',
      throttle: '100',
    })
  })

  it('normalizes headings and reports afterburner throttle', () => {
    expect(
      getFlightHudReadout({
        altitude: 20,
        headingRadians: Math.PI * 3,
        speedUnits: 0,
        thrusting: true,
        boosting: true,
      }),
    ).toMatchObject({ heading: '180', throttle: '300' })
  })

  it('renders a full-screen game surface with all flight instruments', () => {
    const html = renderToStaticMarkup(createElement(FlightSimulator, {}))

    expect(html).toContain('h-screen')
    expect(html).toContain('fs-speed')
    expect(html).toContain('fs-altitude')
    expect(html).toContain('fs-heading')
    expect(html).toContain('fs-throttle')
  })

  it('honors the HUD visibility setting', () => {
    const html = renderToStaticMarkup(
      createElement(FlightSimulator, { hud: false }),
    )

    expect(html).not.toContain('fs-speed')
  })
})
