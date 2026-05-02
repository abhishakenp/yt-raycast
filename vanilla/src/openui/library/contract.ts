import {
  createLibrary,
  defineComponent,
  type ComponentGroup,
  type PromptOptions,
} from '@openuidev/react-lang'
import { z } from 'zod/v4'

const none = () => null

function contractComponent(name: string, description: string, props: z.ZodObject) {
  return defineComponent({ name, description, props, component: none })
}

export const contractComponents = [
  contractComponent(
    'PageShell',
    'Full-page shell for generated websites or app screens.',
    z.object({
      children: z.array(z.any()),
      title: z.string().optional(),
      eyebrow: z.string().optional(),
      mode: z.enum(['light', 'dark', 'editorial']).optional(),
      visualRhythm: z.enum(['default', 'airy', 'dense', 'bold']).optional(),
    }),
  ),
  contractComponent(
    'TopNav',
    'Brand navigation row with optional links and primary action.',
    z.object({
      brand: z.string(),
      links: z.array(z.string()).optional(),
      actionLabel: z.string().optional(),
    }),
  ),
  contractComponent(
    'Section',
    'Titled content section that wraps related child components.',
    z.object({
      title: z.string(),
      subtitle: z.string().optional(),
      children: z.array(z.any()).optional(),
    }),
  ),
  contractComponent(
    'SplitHero',
    'Hero band with copy, actions, and optional supporting children.',
    z.object({
      eyebrow: z.string().optional(),
      title: z.string(),
      subtitle: z.string(),
      primaryAction: z.string().optional(),
      secondaryAction: z.string().optional(),
      children: z.array(z.any()).optional(),
      layoutVariant: z.enum(['split', 'stacked']).optional(),
    }),
  ),
  contractComponent(
    'EditorialHero',
    'Professional landing hero with nav, centered editorial headline, prompt/action bar, and proof metrics. metrics items use { label, value, detail?, tone? }.',
    z.object({
      brand: z.string(),
      navLinks: z.array(z.string()).optional(),
      eyebrow: z.string().optional(),
      title: z.string(),
      subtitle: z.string(),
      primaryAction: z.string().optional(),
      promptPlaceholder: z.string().optional(),
      metrics: z.array(z.any()).optional(),
      imageUrl: z.string().optional(),
      layoutVariant: z.enum(['editorial', 'compact', 'spotlight']).optional(),
    }),
  ),
  contractComponent(
    'DashboardShell',
    'Full application dashboard shell with sidebar navigation and structured main content. navGroups items use { label, items }.',
    z.object({
      brand: z.string(),
      user: z.string().optional(),
      navGroups: z.array(z.any()),
      title: z.string(),
      subtitle: z.string().optional(),
      children: z.array(z.any()),
      actionLabel: z.string().optional(),
      chrome: z.enum(['default', 'minimal']).optional(),
    }),
  ),
  contractComponent(
    'MetricGrid',
    'Dense metric grid with consistent labels, values, details, and semantic tones. metrics items use { label, value, detail?, tone? }.',
    z.object({
      metrics: z.array(z.any()),
      columns: z.number().optional(),
      density: z.enum(['default', 'compact']).optional(),
    }),
  ),
  contractComponent(
    'CampaignList',
    'Stacked activity or campaign cards with status, title, subtitle, and compact metric rows. items use { status, title, subtitle?, metrics? }.',
    z.object({
      title: z.string(),
      items: z.array(z.any()),
    }),
  ),
  contractComponent(
    'ActivityTable',
    'Professional activity table with status, primary text, detail, and right-side metadata. rows use { status, title, detail?, meta? }.',
    z.object({
      title: z.string(),
      rows: z.array(z.any()),
    }),
  ),
  contractComponent(
    'FeatureBento',
    'Curated feature bento section from structured feature objects. features use { title, description, meta? }.',
    z.object({
      title: z.string(),
      subtitle: z.string().optional(),
      features: z.array(z.any()),
      gridMood: z.enum(['even', 'spotlight-first']).optional(),
    }),
  ),
  contractComponent(
    'AuthSplitPanel',
    'Two-column onboarding or sign-up panel with form fields and a visual story panel.',
    z.object({
      title: z.string(),
      subtitle: z.string(),
      fields: z.array(z.string()),
      primaryAction: z.string(),
      visualTitle: z.string(),
      visualDescription: z.string().optional(),
      imageUrl: z.string().optional(),
      panelLayout: z.enum(['split', 'stacked']).optional(),
    }),
  ),
  contractComponent(
    'BentoGrid',
    'Responsive grid for cards, tiles, metrics, and panels.',
    z.object({
      children: z.array(z.any()),
      minColumnWidth: z.number().optional(),
    }),
  ),
  contractComponent(
    'SidebarShell',
    'Application shell with a left navigation rail and main content.',
    z.object({
      navItems: z.array(z.string()),
      children: z.array(z.any()),
      title: z.string().optional(),
    }),
  ),
  contractComponent(
    'FeatureCard',
    'Feature or benefit card with title, description, and optional meta text.',
    z.object({
      title: z.string(),
      description: z.string(),
      meta: z.string().optional(),
      visualWeight: z.enum(['default', 'emphasis']).optional(),
    }),
  ),
  contractComponent(
    'MetricCard',
    'Metric card with label, value, and optional trend text.',
    z.object({
      label: z.string(),
      value: z.string(),
      trend: z.string().optional(),
    }),
  ),
  contractComponent(
    'TestimonialCard',
    'Customer quote card with attribution.',
    z.object({
      quote: z.string(),
      name: z.string(),
      role: z.string().optional(),
    }),
  ),
  contractComponent(
    'PricingTier',
    'Pricing plan card with plan name, price, features, and action.',
    z.object({
      name: z.string(),
      price: z.string(),
      features: z.array(z.string()),
      actionLabel: z.string().optional(),
      highlighted: z.boolean().optional(),
    }),
  ),
  contractComponent(
    'FAQBlock',
    'Compact FAQ list. Use paired question and answer arrays with matching order.',
    z.object({
      questions: z.array(z.string()),
      answers: z.array(z.string()),
    }),
  ),
  contractComponent(
    'ProductCard',
    'Commerce product card with name, price, description, and optional image.',
    z.object({
      name: z.string(),
      price: z.string(),
      description: z.string().optional(),
      imageUrl: z.string().optional(),
      badge: z.string().optional(),
      cardStyle: z.enum(['default', 'minimal', 'showcase']).optional(),
    }),
  ),
  contractComponent(
    'CategoryTile',
    'Commerce category tile with title, description, and optional image.',
    z.object({
      title: z.string(),
      description: z.string().optional(),
      imageUrl: z.string().optional(),
      tileVariant: z.enum(['hero', 'flat']).optional(),
    }),
  ),
  contractComponent(
    'CartSummary',
    'Commerce cart/order summary block.',
    z.object({
      title: z.string(),
      items: z.array(z.string()),
      total: z.string(),
      actionLabel: z.string().optional(),
    }),
  ),
  contractComponent(
    'PromoBand',
    'Promotional message band with optional action label.',
    z.object({
      title: z.string(),
      description: z.string(),
      actionLabel: z.string().optional(),
    }),
  ),
  contractComponent(
    'DataPanel',
    'Dashboard panel with title, optional summary, and child data components.',
    z.object({
      title: z.string(),
      summary: z.string().optional(),
      children: z.array(z.any()).optional(),
    }),
  ),
  contractComponent(
    'FilterBar',
    'Horizontal filter/action bar with chips and optional primary action.',
    z.object({
      filters: z.array(z.string()),
      actionLabel: z.string().optional(),
    }),
  ),
  contractComponent(
    'CommandBar',
    'Primary command row with title, actions, and optional search placeholder.',
    z.object({
      title: z.string(),
      actions: z.array(z.string()).optional(),
      searchPlaceholder: z.string().optional(),
    }),
  ),
  contractComponent(
    'ActivityFeed',
    'Recent activity list with timestamp-like detail strings.',
    z.object({
      title: z.string(),
      items: z.array(z.string()),
    }),
  ),
  contractComponent(
    'StatusPill',
    'Small status badge. Tone controls semantic color.',
    z.object({
      label: z.string(),
      tone: z.enum(['neutral', 'success', 'warning', 'danger']).optional(),
    }),
  ),
  contractComponent(
    'PreviewArtifact',
    'Inline preview card for content that can later become a side-panel artifact.',
    z.object({
      title: z.string(),
      description: z.string(),
      kind: z.string().optional(),
    }),
  ),
  contractComponent(
    'CodeArtifact',
    'Code preview artifact with language label and code string.',
    z.object({
      title: z.string(),
      language: z.string(),
      codeString: z.string(),
    }),
  ),
  contractComponent(
    'SpecArtifact',
    'Structured specification preview with title and bullet points.',
    z.object({
      title: z.string(),
      points: z.array(z.string()),
    }),
  ),
  contractComponent(
    'EvilBar',
    'Animated bar chart with shadcn-token-driven colors. Use when comparing categorical values across multiple series.',
    z.object({
      data: z.array(z.record(z.string(), z.any())),
      xKey: z.string(),
      series: z.array(
        z.object({
          key: z.string(),
          label: z.string().optional(),
          color: z.string().optional(),
        }),
      ),
      height: z.number().optional(),
      stacked: z.boolean().optional(),
      chartFrame: z.enum(['default', 'flush', 'emphasis']).optional(),
    }),
  ),
  contractComponent(
    'EvilLine',
    'Animated line chart with shadcn-token-driven colors. Use for time-series trends across one or multiple series.',
    z.object({
      data: z.array(z.record(z.string(), z.any())),
      xKey: z.string(),
      series: z.array(
        z.object({
          key: z.string(),
          label: z.string().optional(),
          color: z.string().optional(),
        }),
      ),
      height: z.number().optional(),
      chartFrame: z.enum(['default', 'flush', 'emphasis']).optional(),
    }),
  ),
  contractComponent(
    'EvilArea',
    'Animated area chart with gradient fills and shadcn-token colors. Use for cumulative trends or volume-style time-series data.',
    z.object({
      data: z.array(z.record(z.string(), z.any())),
      xKey: z.string(),
      series: z.array(
        z.object({
          key: z.string(),
          label: z.string().optional(),
          color: z.string().optional(),
        }),
      ),
      height: z.number().optional(),
      chartFrame: z.enum(['default', 'flush', 'emphasis']).optional(),
    }),
  ),
  contractComponent(
    'EvilPie',
    'Animated pie or donut chart with shadcn-token-driven colors. Use for share/breakdown visualizations across a small set of categories.',
    z.object({
      data: z.array(
        z.object({
          label: z.string(),
          value: z.number(),
          color: z.string().optional(),
        }),
      ),
      height: z.number().optional(),
      donut: z.boolean().optional(),
      chartFrame: z.enum(['default', 'flush', 'emphasis']).optional(),
    }),
  ),
  contractComponent(
    'EvilRadar',
    'Animated radar chart with polar grid and shadcn-token colors. Use for multi-dimensional comparisons across a fixed set of axes.',
    z.object({
      data: z.array(z.record(z.string(), z.any())),
      axisKey: z.string(),
      series: z.array(
        z.object({
          key: z.string(),
          label: z.string().optional(),
          color: z.string().optional(),
        }),
      ),
      height: z.number().optional(),
      chartFrame: z.enum(['default', 'flush', 'emphasis']).optional(),
    }),
  ),
]

export const shipFastOpenUIComponentNames = contractComponents.map((component) => component.name)

export const shipFastOpenUIComponentGroups: ComponentGroup[] = [
  {
    name: 'Ship Fast Layout',
    components: [
      'PageShell',
      'TopNav',
      'Section',
      'SplitHero',
      'EditorialHero',
      'DashboardShell',
      'BentoGrid',
      'SidebarShell',
    ],
    notes: [
      '- Use PageShell as the outer root when generating complete pages; pass mode "light" for clean dashboard/product surfaces, "dark" for media apps, and "editorial" for image-led landing pages.',
      '- Optional visualRhythm on PageShell: "default" | "airy" | "dense" | "bold" — use when the VARIATION block suggests it; changes spacing and emphasis without new components.',
      '- PageShell title and eyebrow are optional metadata labels, not hero copy. For dashboard pages, pass short values like "AutoSend" and "Dashboard" only.',
      '- Prefer EditorialHero for polished marketing pages and DashboardShell for application/dashboard prompts. VARY hero family (EditorialHero vs SplitHero) when the VARIATION block nudges — do not default to the same hero every run.',
      '- Put root first and reference named sections for progressive streaming.',
      '- Avoid placing raw MetricCard children inside SplitHero when a structured EditorialHero can own the hierarchy.',
      '- SplitHero layoutVariant "stacked" vs "split" changes hero layout; EditorialHero layoutVariant "editorial" | "compact" | "spotlight" changes density and emphasis.',
      '- Abstract intents (marketing, dashboard, commerce) compose from these blocks — no template SKU or fixed section checklist.',
    ],
  },
  {
    name: 'Ship Fast Marketing',
    components: [
      'FeatureBento',
      'FeatureCard',
      'MetricGrid',
      'MetricCard',
      'TestimonialCard',
      'PricingTier',
      'FAQBlock',
    ],
    notes: [
      '- Use these components for common marketing content instead of assembling every card from primitive text.',
      '- FeatureBento gridMood "spotlight-first" makes the first feature tile wider on large screens for visual variety.',
      '- FeatureCard visualWeight "emphasis" for a stronger card treatment vs "default"; mix weights in a grid for non-clone layouts.',
      '- Rotate which blocks appear (FAQ vs testimonials vs pricing) when VARIATION compositionHint suggests omitting a section — same brief, different subgraph.',
    ],
  },
  {
    name: 'Ship Fast Commerce',
    components: ['ProductCard', 'CategoryTile', 'CartSummary', 'PromoBand'],
    notes: [
      '- Use ProductCard for product grids and CategoryTile for collection navigation.',
      '- ProductCard cardStyle "minimal" | "showcase" | "default" changes chrome density; CategoryTile tileVariant "hero" (image-led) vs "flat" (text-first) for parallel commerce rhythms.',
    ],
  },
  {
    name: 'Ship Fast Dashboard',
    components: [
      'DashboardShell',
      'MetricGrid',
      'CampaignList',
      'ActivityTable',
      'DataPanel',
      'FilterBar',
      'CommandBar',
      'ActivityFeed',
      'StatusPill',
    ],
    notes: [
      '- Use DashboardShell + MetricGrid + CampaignList or ActivityTable for app screens; this creates the professional sidebar/content rhythm seen in production dashboards.',
      '- DashboardShell chrome "minimal" tightens sidebar chrome when the variation block calls for a lighter shell.',
      '- MetricGrid density "compact" tightens cells for data-heavy screens; pair with chrome "minimal" when VARIATION suggests dense product rhythm.',
    ],
  },
  {
    name: 'Ship Fast Forms',
    components: ['AuthSplitPanel'],
    notes: [
      '- Use AuthSplitPanel for sign-up, onboarding, or auth-adjacent marketing flows.',
      '- panelLayout "stacked" stacks form and story vertically for a different rhythm than the default split.',
    ],
  },
  {
    name: 'Ship Fast Artifacts',
    components: ['PreviewArtifact', 'CodeArtifact', 'SpecArtifact'],
    notes: [
      '- Use artifact components for larger secondary content that should be visually distinct from the main flow.',
    ],
  },
  {
    name: 'Ship Fast Charts',
    components: ['EvilBar', 'EvilLine', 'EvilArea', 'EvilPie', 'EvilRadar'],
    notes: [
      '- Use EvilBar, EvilLine, EvilArea for time-series and categorical metrics; EvilPie for shares/breakdowns; EvilRadar for multi-dimensional comparisons. Do not invoke raw Recharts components — only these wrappers.',
      '- Optional chartFrame "default" | "flush" | "emphasis" on any Evil* chart to vary container chrome without new components.',
    ],
  },
]

export const shipFastOpenUIPromptOptions: PromptOptions = {
  examples: [
    `root = PageShell([hero, features], "Origin", "AI finance", "editorial")\nhero = EditorialHero("Origin", ["Products", "For employers", "Resources"], "$1 for 1 year", "Own your wealth.", "Track spending, investments, net worth, and financial decisions from one calm command center.", "Get started", "Where am I overspending?", [{label: "Best budgeting app", value: "Forbes", detail: "2024"}, {label: "Members", value: "180K+", detail: "and growing"}])\nfeatures = FeatureBento("Everything in one place", "A premium financial operating system with clear actions and measurable outcomes.", [{title: "Track spending", description: "See every dollar in context.", meta: "Money"}, {title: "Ask anything", description: "Turn complex choices into guided answers.", meta: "AI"}, {title: "Plan ahead", description: "Forecast taxes, goals, and runway.", meta: "Forecast"}])`,
    `root = PageShell([app], "AutoSend", "Dashboard", "light")\napp = DashboardShell("AutoSend", "Alex Smith", [{label: "Transactional emails", items: ["Email Activity", "Templates"]}, {label: "Marketing emails", items: ["Campaigns", "Automations", "Contacts", "Senders"]}, {label: "Other", items: ["Suppressions", "Webhooks", "Settings"]}], "Email Activity", "Track every email sent through your account.", [metrics, campaigns, activity], "New")\nmetrics = MetricGrid([{label: "Requests", value: "9", detail: "last 3 days"}, {label: "Delivered", value: "100%", detail: "5 emails", tone: "success"}, {label: "Clicked", value: "12.50%", detail: "1 click", tone: "accent"}, {label: "Spam reports", value: "0%", detail: "clean"}])\ncampaigns = CampaignList("Active campaigns", [{status: "Sent", title: "Copy of 5.5 Campaign", subtitle: "Subject: 5.5 Campaign", metrics: ["Requests 4", "Sent 3", "Delivered 100%", "Clicks 33.33%"]}, {status: "Sent", title: "Winter Campaign", subtitle: "Subject: Winter Campaign", metrics: ["Requests 4", "Sent 4", "Delivered 100%", "Clicks not tracking"]}])\nactivity = ActivityTable("Recent email activity", [{status: "Delivered", title: "alexsmith.mobbin+3@gmail.com", detail: "5.5 Campaign", meta: "05 Mar, 03:18 PM"}, {status: "Opened", title: "samlee.mobbin+1@gmail.com", detail: "5.5 Campaign", meta: "05 Mar, 03:18 PM"}])`,
    `root = PageShell([app], "Analytics", "Dashboard", "dark")\napp = DashboardShell("Analytics", "Sam Lee", [{label: "Overview", items: ["Performance", "Revenue"]}], "Performance", "Last 30 days at a glance.", [metrics, perfChart, breakdown], "Export")\nmetrics = MetricGrid([{label: "MRR", value: "$48,200", detail: "+12% MoM", tone: "success"}, {label: "Active users", value: "12,840", detail: "+8% MoM", tone: "accent"}, {label: "Churn", value: "1.4%", detail: "-0.2pp"}])\nperfChart = EvilArea([{day: "Mon", revenue: 4200, expenses: 1800}, {day: "Tue", revenue: 4800, expenses: 2100}, {day: "Wed", revenue: 5200, expenses: 1900}, {day: "Thu", revenue: 6100, expenses: 2400}, {day: "Fri", revenue: 6800, expenses: 2200}], "day", [{key: "revenue", label: "Revenue"}, {key: "expenses", label: "Expenses"}], 280)\nbreakdown = EvilPie([{label: "Subscriptions", value: 62}, {label: "One-time", value: 24}, {label: "Add-ons", value: 14}], 240, true)`,
  ],
  additionalRules: [
    'Prefer high-level Ship Fast section components over loose primitive assembly: EditorialHero for marketing, DashboardShell for app screens, FeatureBento for feature sections, MetricGrid for metrics, CampaignList or ActivityTable for dense operational data.',
    'For dashboards, prefer MetricGrid, CampaignList, ActivityTable, and DataPanel for dense operational data so preview rendering stays stable.',
    'For professional quality, generate object-array props with realistic labels, values, and metadata instead of concatenated words or one-word filler.',
    'Preserve natural spaces and casing in all user-visible strings: write "Transactional Emails", "Open Rate", "Alex Smith", and "2 mins ago", not "TransactionalEmails", "OpenRate", "AlexSmith", or "2minsago".',
    'Keep generated programs streaming-friendly: define root first, then named top-level regions, then leaf content.',
    'Use EvilBar / EvilLine / EvilArea for time-series and categorical metrics, EvilPie for breakdowns, EvilRadar for multi-axis comparisons. Pass `data` as an array of objects with consistent keys; `series` references those keys. Never invoke raw Recharts.',
    'When the system prompt includes a VARIATION block, honor its hints (hero family, section order, optional layout props, compositionHint subset, dashboardShellChrome) so repeated user briefs do not produce identical pages. This is not a page template: compose sections freely within those hints.',
    'Map briefs to abstract intents (marketing landing, dashboard app, commerce, editorial) and pick components by category — do not rely on fixed page skeletons.',
    'Prefer different enum values (visualRhythm, layoutVariant, gridMood, cardStyle, chartFrame, density, chrome, panelLayout) when the fingerprint changes — weak models should select among allowed options, not invent CSS.',
  ],
}

export const shipFastOpenUIContractLibrary = createLibrary({
  root: 'PageShell',
  componentGroups: shipFastOpenUIComponentGroups,
  components: contractComponents,
})

export const openUIComponentOpenPatternSource = [...shipFastOpenUIComponentNames]
  .sort()
  .join('|')

export function getShipFastOpenUISystemPrompt(): string {
  return shipFastOpenUIContractLibrary
    .prompt(shipFastOpenUIPromptOptions)
    .replace(/\bStack\(/g, 'Section(')
}
