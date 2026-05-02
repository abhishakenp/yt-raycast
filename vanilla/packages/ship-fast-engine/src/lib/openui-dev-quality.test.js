import { describe, expect, it } from 'vitest'
import { openUIDevQualityHints } from './openui-dev-quality.js'

describe('openUIDevQualityHints', () => {
  it('flags empty source', () => {
    expect(openUIDevQualityHints('').some((h) => h.includes('Empty'))).toBe(true)
  })

  it('is quiet for a rich dashboard-like stub', () => {
    const body = `root = PageShell([app], "Acme", "Operations", "light")
app = DashboardShell("Acme", "Alex", [{label: "Core", items: ["Overview", "Reports"]}, {label: "Settings", items: ["Team"]}], "Overview", "Daily operations snapshot with enough surface area for quality heuristics.", [m, t, f, c], "Export")
m = MetricGrid([{label: "Requests", value: "120", detail: "24h", tone: "success"}, {label: "Errors", value: "2", detail: "24h", tone: "warning"}, {label: "Latency", value: "120ms", detail: "p95"}])
t = ActivityTable("Recent activity", [{status: "Delivered", title: "Invoice #4401", detail: "Batch A", meta: "2m ago"}, {status: "Queued", title: "Invoice #4402", detail: "Batch B", meta: "5m ago"}, {status: "Failed", title: "Invoice #4390", detail: "Batch Z", meta: "1h ago"}])
f = FeatureBento("Highlights", "What changed this week across regions and product lines.", [{title: "Throughput", description: "Up 12% WoW with stable error budget.", meta: "Ops"}, {title: "Latency", description: "P95 stable under load tests.", meta: "Perf"}, {title: "Cost", description: "Infra spend down 3% after cache tuning.", meta: "Fin"}])
c = CampaignList("Rollouts", [{status: "Live", title: "Canary 5%", subtitle: "EU region only", metrics: ["OK", "0 rollbacks"]}, {status: "Planned", title: "Canary 25%", subtitle: "US next", metrics: ["Pending"]}])
`
    const src = `${body}\n${' '.repeat(120)}\n`
    const hints = openUIDevQualityHints(src)
    expect(hints.filter((h) => h.includes('primary layout'))).toHaveLength(0)
    expect(hints.filter((h) => h.includes('Few named'))).toHaveLength(0)
    expect(hints.filter((h) => h.includes('Short program'))).toHaveLength(0)
  })
})
