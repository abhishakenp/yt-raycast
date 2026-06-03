import { describe, expect, it } from 'vitest'
import { openUIDevQualityHints } from './openui-dev-quality.js'

describe('openUIDevQualityHints', () => {
  it('flags empty source', () => {
    expect(openUIDevQualityHints('').some((h) => h.includes('Empty'))).toBe(true)
  })

  it('is quiet for a rich registry-module stub', () => {
    const body = `root = Stack([header, main, footer], "col", "none")
header = AnalyticsHeader("Acme Ops", "Robotics fleet control", "Search robot ID", "Export", "/")
main = Stack([hero, kpis, table, features], "col", "lg")
hero = ManufacturingHero("Live", "Warehouse robotics command", "Track incidents, battery telemetry, pick rates, and dispatch queues from one operational surface.", "Open fleet", "Review incidents", "Robotics dashboard", "Fleet Health", "All shifts online", [{value: "128", label: "Active robots"}, {value: "96%", label: "Battery average"}])
kpis = DashboardKpis([{label: "Pick rate", value: "12,420/hr", delta: "+8%", trendUp: true}, {label: "Incidents", value: "4", delta: "-2", trendUp: true}, {label: "Queue", value: "22", delta: "+1", trendUp: false}])
table = DashboardOrdersTable("Active dispatch queue", [{id: "R-104", customer: "Forklift 104", status: "Paused", total: "Aisle 7", date: "2m ago"}, {id: "R-222", customer: "Forklift 222", status: "Charging", total: "Bay 3", date: "8m ago"}])
features = ManufacturingFeatures("Operational controls", "Every module is tuned for warehouse teams, not a generic SaaS shell.", [{title: "Incident routing", description: "Escalate blocked paths before they stop pick flow."}, {title: "Battery telemetry", description: "Balance charging windows by shift demand."}, {title: "Dispatch queues", description: "Prioritize urgent replenishment tasks."}])
footer = ManufacturingFooter("Acme Ops", ["Fleet", "Incidents", "Telemetry"])
`
    const src = `${body}\n${' '.repeat(120)}\n`
    const hints = openUIDevQualityHints(src)
    expect(hints.filter((h) => h.includes('primary registry'))).toHaveLength(0)
    expect(hints.filter((h) => h.includes('Few named'))).toHaveLength(0)
    expect(hints.filter((h) => h.includes('Short program'))).toHaveLength(0)
  })
})
