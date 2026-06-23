import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { renderOpenUIToHTML } from './openui-ssr.js'

describe('renderOpenUIToHTML', () => {
  it('renders simple text OpenUI source without an error shell', async () => {
    const html = await renderOpenUIToHTML(`$page = "Home"
root = Text("Dashboard browser verifier")`)

    expect(html).not.toContain('openui-error')
    expect(html).toContain('Dashboard browser verifier')
  })

  it('renders a fitness schedule page when generated rows omit slots', async () => {
    const html = await renderOpenUIToHTML(`$page = "Home"
home = FitnessSchedule("Schedule", "Plan your week", ["Mon", "Tue"], [{time: "6:00 AM"}])`)

    expect(html).not.toContain('openui-error')
    expect(html).toContain('Schedule')
    expect(html).toContain('6:00 AM')
  })

  it('uses the response-scoped runtime entry instead of the eager blocks barrel', () => {
    const source = readFileSync(
      new URL('./openui-ssr.js', import.meta.url),
      'utf8',
    )

    expect(source).toContain('@ship-fast/blocks/runtime')
    expect(source).not.toContain("from '@ship-fast/blocks'")
    expect(source).toContain('loadOpenUIRuntimeLibrary(preprocessed)')
  })
})

// Behavioral guard: a model can emit an outer-array item that OMITS its nested
// inner array. Each section below renders such an item and must NOT crash
// (the unguarded `inner.map` regression) — it must produce real markup, not an
// `openui-error` shell. Replaces the brittle readFileSync/.includes source grep.
describe('section inner-array rendering safety', () => {
  it('FitnessSchedule renders when a row omits slots', async () => {
    const html = await renderOpenUIToHTML(`$page = "Home"
home = FitnessSchedule("Sched", "", ["Mon"], [{time: "6 AM"}])`)

    expect(html).not.toContain('openui-error')
    expect(html).toContain('Sched')
    expect(html).toContain('6 AM')
  })

  it('RestaurantMenu renders when a category omits items', async () => {
    const html = await renderOpenUIToHTML(`$page = "Home"
home = RestaurantMenu("Menu", "", [{name: "Starters"}])`)

    expect(html).not.toContain('openui-error')
    expect(html).toContain('Menu')
    expect(html).toContain('Starters')
  })

  it('WineryBreweryMenu renders when a category omits items', async () => {
    const html = await renderOpenUIToHTML(`$page = "Home"
home = WineryBreweryMenu("Wines", "", [{name: "Reds"}])`)

    expect(html).not.toContain('openui-error')
    expect(html).toContain('Wines')
    expect(html).toContain('Reds')
  })

  it('DocsSidebar renders when a group omits items', async () => {
    const html = await renderOpenUIToHTML(`$page = "Home"
home = DocsSidebar("Search", [{title: "Guide"}])`)

    expect(html).not.toContain('openui-error')
    expect(html).toContain('Guide')
  })

  it('MusicFestivalSchedule renders when a day omits items', async () => {
    const html = await renderOpenUIToHTML(`$page = "Home"
home = MusicFestivalSchedule("", "Lineup", "", [{label: "Fri", name: "Day 1", date: "Jun 1", cta: "Tickets"}])`)

    expect(html).not.toContain('openui-error')
    expect(html).toContain('Lineup')
    expect(html).toContain('Day 1')
  })

  it('FoodTruckLocations renders when a day omits rows', async () => {
    const html = await renderOpenUIToHTML(`$page = "Home"
home = FoodTruckLocations("", "Find us", "", [{initial: "M", day: "Mon", area: "Downtown"}])`)

    expect(html).not.toContain('openui-error')
    expect(html).toContain('Find us')
    expect(html).toContain('Downtown')
  })

  it('FoodTruckMenu renders when a category omits items', async () => {
    const html = await renderOpenUIToHTML(`$page = "Home"
home = FoodTruckMenu("", "Menu", "", [{title: "Tacos", imageAlt: "tacos"}])`)

    expect(html).not.toContain('openui-error')
    expect(html).toContain('Menu')
    expect(html).toContain('Tacos')
  })

  // CafeMenu builds columns each with `.items` from coffee/food; with empty
  // props those default, but the `(col.items ?? [])` guard is what keeps an
  // items-less column from crashing. Render with minimal props and assert the
  // default heading paints (no error shell).
  it('CafeMenu renders without crashing on minimal props', async () => {
    const html = await renderOpenUIToHTML(`$page = "Home"
home = CafeMenu()`)

    expect(html).not.toContain('openui-error')
    expect(html).toContain('Crafted with intention')
  })

  // GovernmentPortalEvents builds each tab's `rows` from defaults; the
  // `(active.rows ?? [])` guard protects the rows-less tab case. Render with
  // minimal props and assert the default heading paints (no error shell).
  it('GovernmentPortalEvents renders without crashing on minimal props', async () => {
    const html = await renderOpenUIToHTML(`$page = "Home"
home = GovernmentPortalEvents()`)

    expect(html).not.toContain('openui-error')
    expect(html).toContain('Latest Updates')
  })
})
