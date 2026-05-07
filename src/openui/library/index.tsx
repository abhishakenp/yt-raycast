import {
  createLibrary,
  defineComponent,
  type ComponentGroup,
  type PromptOptions,
} from '@openuidev/react-lang'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

import { evilChartComponents } from './charts'

const metricItemSchema = z.object({
  label: z.string(),
  value: z.string(),
  detail: z.string().optional(),
  tone: z.enum(['neutral', 'success', 'warning', 'danger', 'accent']).optional(),
})

const navGroupSchema = z.object({
  label: z.string(),
  items: z.array(z.string()),
})

const campaignSchema = z.object({
  status: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  metrics: z.array(z.string()).optional(),
})

const tableRowSchema = z.object({
  status: z.string(),
  title: z.string(),
  detail: z.string().optional(),
  meta: z.string().optional(),
})

const featureSchema = z.object({
  title: z.string(),
  description: z.string(),
  meta: z.string().optional(),
})

function normalizeCopy(value?: string | null): string {
  return String(value || '')
    .replace(/\|/g, ' · ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Za-z])(\d)/g, '$1 $2')
    .replace(/(\d)([A-Za-z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
}

function renderList(items?: string[] | null): ReactNode {
  if (!items?.length) return null
  return (
    <>
      {items.map((item) => (
        <span key={item}>{normalizeCopy(item)}</span>
      ))}
    </>
  )
}

function asArray<T = any>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : []
}

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'accent' | undefined

function toneBadgeClasses(tone: Tone): string {
  switch (tone) {
    case 'success':
      return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
    case 'warning':
      return 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400'
    case 'danger':
      return 'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400'
    case 'accent':
      return 'border-primary/40 bg-primary/10 text-primary'
    case 'neutral':
      return 'border-border bg-muted text-muted-foreground'
    default:
      return 'border-primary/40 bg-primary/10 text-primary'
  }
}

function toneDotClasses(tone: Tone): string {
  switch (tone) {
    case 'success':
      return 'bg-emerald-500 shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-emerald-500)_18%,transparent)]'
    case 'warning':
      return 'bg-amber-500 shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-amber-500)_18%,transparent)]'
    case 'danger':
      return 'bg-rose-500 shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-rose-500)_18%,transparent)]'
    case 'accent':
      return 'bg-primary shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]'
    default:
      return 'bg-muted-foreground/60 shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-muted-foreground)_18%,transparent)]'
  }
}

function metricToneFromStatus(status: string): 'neutral' | 'success' | 'warning' | 'danger' | 'accent' {
  const s = status.toLowerCase()
  if (s.includes('deliver') || s.includes('sent') || s.includes('active')) return 'success'
  if (s.includes('open') || s.includes('click')) return 'accent'
  if (s.includes('bounce') || s.includes('warning')) return 'warning'
  if (s.includes('spam') || s.includes('fail') || s.includes('complaint')) return 'danger'
  return 'neutral'
}

export const PageShell = defineComponent({
  name: 'PageShell',
  description: 'Full-page shell for generated websites or app screens.',
  props: z.object({
    children: z.array(z.any()),
    title: z.string().optional(),
    eyebrow: z.string().optional(),
    mode: z.enum(['light', 'dark', 'editorial']).optional(),
    visualRhythm: z.enum(['default', 'airy', 'dense', 'bold']).optional(),
  }),
  component: ({ props, renderNode }) => {
    const mode = props.mode || 'dark'
    const isDark = mode === 'dark' || mode === 'editorial'
    const rhythm = props.visualRhythm || 'default'
    const yPad =
      rhythm === 'airy'
        ? 'py-[clamp(28px,5vw,72px)]'
        : rhythm === 'dense'
          ? 'py-[clamp(14px,3vw,40px)]'
          : 'py-[clamp(20px,4vw,56px)]'
    const gap = rhythm === 'airy' ? 'gap-8' : rhythm === 'dense' ? 'gap-4' : 'gap-6'
    const shellRing = rhythm === 'bold' ? 'ring-1 ring-border/70 shadow-sm' : ''
    return (
      <div className={cn(isDark && 'dark', 'min-h-full bg-background text-foreground')}>
        <main
          className={cn(
            'min-h-full px-[clamp(20px,4vw,56px)]',
            yPad,
            shellRing,
            'rounded-none md:rounded-lg',
          )}
        >
          <div
            className={cn(
              'mx-auto grid',
              gap,
              mode === 'light' ? 'max-w-[1120px]' : 'max-w-[1180px]',
            )}
          >
            {mode !== 'light' && (props.eyebrow || props.title) ? (
              <header className="grid max-w-[760px] gap-1.5 overflow-hidden">
                {props.eyebrow ? (
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {normalizeCopy(props.eyebrow)}
                  </div>
                ) : null}
                {props.title ? (
                  <h1 className="m-0 text-[clamp(28px,4vw,52px)] leading-[1.05] tracking-[-0.05em] [overflow-wrap:anywhere] [word-spacing:0.08em]">
                    {normalizeCopy(props.title)}
                  </h1>
                ) : null}
              </header>
            ) : null}
            {renderNode(props.children)}
          </div>
        </main>
      </div>
    )
  },
})

export const TopNav = defineComponent({
  name: 'TopNav',
  description: 'Brand navigation row with optional links and primary action.',
  props: z.object({
    brand: z.string(),
    links: z.array(z.string()).optional(),
    actionLabel: z.string().optional(),
  }),
  component: ({ props }) => (
    <nav className="flex items-center justify-between gap-4 rounded-xl border bg-card px-[18px] py-[14px] text-card-foreground shadow-sm">
      <strong>{props.brand}</strong>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        {renderList(props.links)}
      </div>
      {props.actionLabel ? (
        <Badge variant="default">{props.actionLabel}</Badge>
      ) : null}
    </nav>
  ),
})

export const Section = defineComponent({
  name: 'Section',
  description: 'Titled content section that wraps related child components.',
  props: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    children: z.array(z.any()).optional(),
  }),
  component: ({ props, renderNode }) => (
    <section className="mt-2 grid gap-[18px]">
      <div className="grid gap-1.5">
        <h2 className="m-0 text-[clamp(26px,4vw,44px)]">{props.title}</h2>
        {props.subtitle ? (
          <p className="m-0 max-w-[720px] text-muted-foreground">{props.subtitle}</p>
        ) : null}
      </div>
      {props.children?.length ? renderNode(props.children) : null}
    </section>
  ),
})

export const SplitHero = defineComponent({
  name: 'SplitHero',
  description: 'Hero band with copy, actions, and optional supporting children.',
  props: z.object({
    eyebrow: z.string().optional(),
    title: z.string(),
    subtitle: z.string(),
    primaryAction: z.string().optional(),
    secondaryAction: z.string().optional(),
    children: z.array(z.any()).optional(),
    layoutVariant: z.enum(['split', 'stacked']).optional(),
  }),
  component: ({ props, renderNode }) => {
    const stacked = props.layoutVariant === 'stacked'
    return (
      <Card
        className={cn(
          'grid items-center gap-6 px-[clamp(24px,5vw,56px)] py-[clamp(24px,5vw,56px)]',
          stacked
            ? '[grid-template-columns:1fr]'
            : '[grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]',
        )}
      >
        <div className="grid gap-4">
          {props.eyebrow ? <Badge variant="default" className="w-fit">{props.eyebrow}</Badge> : null}
          <h1 className="m-0 text-[clamp(36px,7vw,76px)] leading-[0.95]">{props.title}</h1>
          <p className="m-0 text-lg leading-relaxed text-muted-foreground">{props.subtitle}</p>
          <div className="flex flex-wrap gap-2.5">
            {props.primaryAction ? (
              <Button variant="default" size="default">{props.primaryAction}</Button>
            ) : null}
            {props.secondaryAction ? (
              <Button variant="outline" size="default">{props.secondaryAction}</Button>
            ) : null}
          </div>
        </div>
        {props.children?.length ? <div className="grid gap-3">{renderNode(props.children)}</div> : null}
      </Card>
    )
  },
})

export const EditorialHero = defineComponent({
  name: 'EditorialHero',
  description: 'Professional landing hero with nav, centered editorial headline, prompt/action bar, and proof metrics.',
  props: z.object({
    brand: z.string(),
    navLinks: z.array(z.string()).optional(),
    eyebrow: z.string().optional(),
    title: z.string(),
    subtitle: z.string(),
    primaryAction: z.string().optional(),
    promptPlaceholder: z.string().optional(),
    metrics: z.array(metricItemSchema).optional(),
    imageUrl: z.string().optional(),
    layoutVariant: z.enum(['editorial', 'compact', 'spotlight']).optional(),
  }),
  component: ({ props }) => {
    const lv = props.layoutVariant || 'editorial'
    const minH = lv === 'compact' ? 'min-h-[480px]' : 'min-h-[660px]'
    const titleClamp =
      lv === 'compact'
        ? 'text-[clamp(44px,7vw,92px)]'
        : lv === 'spotlight'
          ? 'text-[clamp(62px,10vw,128px)]'
          : 'text-[clamp(58px,9vw,118px)]'
    const sectionShadow =
      lv === 'spotlight'
        ? 'shadow-[inset_0_0_0_1px_rgba(255,255,255,.18),0_48px_140px_rgba(0,0,0,.45)]'
        : 'shadow-[inset_0_0_0_1px_rgba(255,255,255,.12),0_40px_120px_rgba(0,0,0,.32)]'
    const gapY = lv === 'compact' ? 'gap-16' : 'gap-24'
    return (
    <section
      className={cn(
        'dark relative isolate grid content-start overflow-hidden rounded-[30px] px-[clamp(18px,4vw,54px)] pt-[22px] pb-16 text-foreground',
        minH,
        gapY,
        sectionShadow,
      )}
      style={{
        background: props.imageUrl
          ? `linear-gradient(rgba(3,7,18,.15), rgba(3,7,18,.78)), url(${props.imageUrl})`
          : lv === 'spotlight'
            ? 'linear-gradient(180deg, rgba(72,120,180,.85), rgba(3,7,18,.94)), radial-gradient(circle at 50% 12%, rgba(255,255,255,.22), transparent 36%)'
            : 'linear-gradient(180deg, rgba(58,102,145,.78), rgba(3,7,18,.92)), radial-gradient(circle at 50% 18%, rgba(255,255,255,.18), transparent 32%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <nav className="grid items-center [grid-template-columns:1fr_auto_1fr]">
        <strong className="uppercase tracking-[0.08em] text-white">{normalizeCopy(props.brand)}</strong>
        <div className="flex gap-7 text-xs uppercase text-white/80">
          {renderList(props.navLinks)}
        </div>
        {props.primaryAction ? (
          <span className="justify-self-end">
            <Button variant="secondary" size="sm" className="bg-white text-neutral-950 hover:bg-white/90">
              {normalizeCopy(props.primaryAction)}
            </Button>
          </span>
        ) : null}
      </nav>
      <div className="mx-auto grid max-w-[760px] justify-items-center gap-[18px] text-center">
        {props.eyebrow ? (
          <Badge className="bg-cyan-50/90 text-teal-700 border-transparent">
            {normalizeCopy(props.eyebrow)}
          </Badge>
        ) : null}
        <h1
          className={cn(
            'm-0 [font-family:Georgia,\'Times_New_Roman\',serif] font-normal leading-[0.9] tracking-[-0.065em] [word-spacing:0.12em] [text-wrap:balance] text-white',
            titleClamp,
          )}
        >
          {normalizeCopy(props.title)}
        </h1>
        <p className="m-0 max-w-[520px] leading-[1.55] text-white/80">
          {normalizeCopy(props.subtitle)}
        </p>
        {props.promptPlaceholder ? (
          <div className="mt-7 flex min-h-[68px] w-[min(620px,100%)] items-center justify-between rounded-full border border-white/20 bg-white/15 pl-7 pr-3 text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,.18)]">
            <span>{normalizeCopy(props.promptPlaceholder)}</span>
            <span className="grid size-[52px] place-items-center rounded-full bg-white/30 text-2xl">↑</span>
          </div>
        ) : null}
        {asArray(props.metrics).length ? (
          <div className="mt-2.5 flex flex-wrap justify-center gap-7">
            {asArray(props.metrics).map((metric) => (
              <div key={metric.label} className="grid justify-items-center gap-[3px] text-white/85">
                <strong className="text-base">{normalizeCopy(metric.value)}</strong>
                <span className="text-[11px] uppercase tracking-[0.12em] text-white/60">{normalizeCopy(metric.label)}</span>
                {metric.detail ? (
                  <span className="text-[11px] text-white/60">{normalizeCopy(metric.detail)}</span>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
    )
  },
})

export const DashboardShell = defineComponent({
  name: 'DashboardShell',
  description: 'Full application dashboard shell with sidebar navigation and structured main content.',
  props: z.object({
    brand: z.string(),
    user: z.string().optional(),
    navGroups: z.array(navGroupSchema),
    title: z.string(),
    subtitle: z.string().optional(),
    children: z.array(z.any()),
    actionLabel: z.string().optional(),
    chrome: z.enum(['default', 'minimal']).optional(),
  }),
  component: ({ props, renderNode }) => {
    const minimal = props.chrome === 'minimal'
    const sidebarW = minimal ? 'minmax(200px,220px)' : '240px'
    const gapMain = minimal ? 'gap-5' : 'gap-7'
    return (
    <section
      className={cn('grid min-h-[760px]', gapMain)}
      style={{ gridTemplateColumns: `${sidebarW} minmax(0,1fr)` }}
    >
      <aside className={cn('grid min-h-[720px] content-between', minimal && 'text-[13px]')}>
        <div className={cn('grid', minimal ? 'gap-4' : 'gap-[22px]')}>
          <div
            className={cn(
              'font-extrabold uppercase tracking-[0.08em]',
              minimal ? 'text-[15px]' : 'text-[19px]',
            )}
          >
            {normalizeCopy(props.brand)}
          </div>
          {props.user ? (
            <Card className="px-3 py-[9px] text-[13px] shadow-none">
              {normalizeCopy(props.user)}
            </Card>
          ) : null}
          {asArray(props.navGroups).map((group) => (
            <div key={group.label} className="grid gap-2.5">
              <div className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                {normalizeCopy(group.label)}
              </div>
              <div className="grid gap-2">
                {asArray(group.items).map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-foreground/80">
                    <span className="size-3.5 rounded-[4px] border border-border" />
                    <span>{normalizeCopy(item)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {props.user ? <div className="text-[13px] text-muted-foreground">{normalizeCopy(props.user)}</div> : null}
      </aside>
      <main className="grid min-w-0 content-start gap-[22px]">
        <header className="flex items-start justify-between gap-[18px]">
          <div>
            <h1 className="m-0 text-2xl tracking-[-0.02em]">{normalizeCopy(props.title)}</h1>
            {props.subtitle ? (
              <p className="mt-2 mb-0 text-muted-foreground">{normalizeCopy(props.subtitle)}</p>
            ) : null}
          </div>
          {props.actionLabel ? (
            <Button variant="default" size="default" className="uppercase tracking-wide">
              {normalizeCopy(props.actionLabel)}
            </Button>
          ) : null}
        </header>
        {renderNode(props.children)}
      </main>
    </section>
    )
  },
})

export const MetricGrid = defineComponent({
  name: 'MetricGrid',
  description: 'Dense metric grid with consistent labels, values, details, and semantic tones.',
  props: z.object({
    metrics: z.array(metricItemSchema),
    columns: z.number().optional(),
    density: z.enum(['default', 'compact']).optional(),
  }),
  component: ({ props }) => {
    const compact = props.density === 'compact'
    return (
    <Card
      className="overflow-hidden gap-0 py-0"
      style={{
        gridTemplateColumns: `repeat(${props.columns || Math.min(Math.max(asArray(props.metrics).length, 1), 6)}, minmax(0, 1fr))`,
        display: 'grid',
      }}
    >
      {asArray(props.metrics).map((metric, index) => (
        <div
          key={`${metric.label}-${metric.value}`}
          className={cn(
            compact ? 'grid gap-1 p-3' : 'grid gap-[7px] p-4',
            index !== asArray(props.metrics).length - 1 && 'border-r border-border',
          )}
        >
          <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.11em] text-muted-foreground">
            <span className={cn('size-2 rounded-full', toneDotClasses(metric.tone))} />
            {normalizeCopy(metric.label)}
          </div>
          <strong className={cn('tracking-[-0.03em]', compact ? 'text-lg' : 'text-[21px]')}>
            {normalizeCopy(metric.value)}
          </strong>
          {metric.detail ? (
            <span className="text-xs text-muted-foreground">{normalizeCopy(metric.detail)}</span>
          ) : null}
        </div>
      ))}
    </Card>
    )
  },
})

export const CampaignList = defineComponent({
  name: 'CampaignList',
  description: 'Stacked activity or campaign cards with status, title, subtitle, and compact metric rows.',
  props: z.object({
    title: z.string(),
    items: z.array(campaignSchema),
  }),
  component: ({ props }) => (
    <section className="grid gap-3">
      <div className="flex items-center gap-2.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
        {normalizeCopy(props.title)}
        <Separator className="flex-1" />
      </div>
      {asArray(props.items).map((item) => (
        <Card key={item.title} className="overflow-hidden gap-0 py-0">
          <div className="flex justify-between gap-4 p-[18px]">
            <div className="grid gap-1.5">
              <span className="text-[11px] font-black uppercase text-primary">{normalizeCopy(item.status)}</span>
              <strong>{normalizeCopy(item.title)}</strong>
              {item.subtitle ? (
                <span className="text-[13px] text-muted-foreground">{normalizeCopy(item.subtitle)}</span>
              ) : null}
            </div>
            <span className="text-muted-foreground">⋮</span>
          </div>
          {asArray(item.metrics).length ? (
            <div
              className="grid border-t border-border bg-muted/30"
              style={{ gridTemplateColumns: `repeat(${asArray(item.metrics).length}, minmax(0, 1fr))` }}
            >
              {asArray(item.metrics).map((metric) => (
                <span key={metric} className="px-4 py-3.5 text-xs uppercase tracking-[0.08em] text-muted-foreground">
                  {normalizeCopy(metric)}
                </span>
              ))}
            </div>
          ) : null}
        </Card>
      ))}
    </section>
  ),
})

export const ActivityTable = defineComponent({
  name: 'ActivityTable',
  description: 'Professional activity table with status, primary text, detail, and right-side metadata.',
  props: z.object({
    title: z.string(),
    rows: z.array(tableRowSchema),
  }),
  component: ({ props }) => (
    <Card className="overflow-hidden gap-0 py-0">
      <CardHeader className="border-b border-border px-[18px] py-3.5">
        <CardTitle className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
          {normalizeCopy(props.title)}
        </CardTitle>
      </CardHeader>
      <Table>
        <TableHeader className="sr-only">
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Meta</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {asArray(props.rows).map((row) => (
            <TableRow key={`${row.status}-${row.title}-${row.meta}`}>
              <TableCell className="w-[120px] align-middle">
                <div className="flex items-center gap-2 text-[11px] font-black uppercase">
                  <span className={cn('size-2 rounded-full', toneDotClasses(metricToneFromStatus(row.status)))} />
                  {normalizeCopy(row.status)}
                </div>
              </TableCell>
              <TableCell className="min-w-0 align-middle">
                <div className="grid min-w-0 gap-1">
                  <strong className="min-w-0 truncate">{normalizeCopy(row.title)}</strong>
                  {row.detail ? (
                    <span className="text-[13px] text-muted-foreground">{normalizeCopy(row.detail)}</span>
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="w-[136px] whitespace-nowrap text-right align-middle text-xs text-muted-foreground">
                {row.meta ? normalizeCopy(row.meta) : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  ),
})

export const FeatureBento = defineComponent({
  name: 'FeatureBento',
  description: 'Curated feature bento section from structured feature objects.',
  props: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    features: z.array(featureSchema),
    gridMood: z.enum(['even', 'spotlight-first']).optional(),
  }),
  component: ({ props }) => {
    const spotlight = props.gridMood === 'spotlight-first'
    return (
    <section className="grid gap-[18px]">
      <div className="max-w-[720px]">
        <h2 className="m-0 text-[clamp(30px,5vw,56px)] leading-[0.98] tracking-[-0.055em] [word-spacing:0.1em]">
          {normalizeCopy(props.title)}
        </h2>
        {props.subtitle ? (
          <p className="text-[17px] leading-relaxed text-muted-foreground">{normalizeCopy(props.subtitle)}</p>
        ) : null}
      </div>
      <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(230px,1fr))]">
        {asArray(props.features).map((feature, index) => (
          <Card
            key={feature.title}
            className={cn(
              'grid content-between p-[22px] gap-3',
              index === 0 ? 'min-h-[230px]' : 'min-h-[180px]',
              spotlight && index === 0 && 'md:col-span-2',
            )}
          >
            {feature.meta ? (
              <Badge className={cn('w-fit', toneBadgeClasses('accent'))}>
                {normalizeCopy(feature.meta)}
              </Badge>
            ) : null}
            <div>
              <h3 className="mb-2 text-[22px]">{normalizeCopy(feature.title)}</h3>
              <p className="m-0 leading-[1.55] text-muted-foreground">{normalizeCopy(feature.description)}</p>
            </div>
          </Card>
        ))}
      </div>
    </section>
    )
  },
})

export const AuthSplitPanel = defineComponent({
  name: 'AuthSplitPanel',
  description: 'Two-column onboarding or sign-up panel with form fields and a visual story panel.',
  props: z.object({
    title: z.string(),
    subtitle: z.string(),
    fields: z.array(z.string()),
    primaryAction: z.string(),
    visualTitle: z.string(),
    visualDescription: z.string().optional(),
    imageUrl: z.string().optional(),
    panelLayout: z.enum(['split', 'stacked']).optional(),
  }),
  component: ({ props }) => (
    <section
      className={cn(
        'grid min-h-[640px] gap-[22px]',
        props.panelLayout === 'stacked'
          ? '[grid-template-columns:1fr]'
          : '[grid-template-columns:minmax(320px,560px)_1fr]',
      )}
    >
      <Card className="grid content-center gap-[18px] px-[clamp(34px,6vw,86px)] py-[clamp(34px,6vw,86px)]">
        <h1 className="m-0 [font-family:Georgia,'Times_New_Roman',serif] font-normal text-[clamp(34px,5vw,58px)] leading-none">
          {props.title}
        </h1>
        <p className="max-w-[420px] leading-relaxed text-muted-foreground">{props.subtitle}</p>
        <div className="grid max-w-[360px] gap-3">
          {asArray(props.fields).map((field) => (
            <Input key={field} readOnly placeholder={field} className="cursor-default" />
          ))}
          <Button variant="default" size="lg" className="mt-2 w-full">
            {props.primaryAction}
          </Button>
        </div>
      </Card>
      <Card
        className="dark grid content-center justify-items-center gap-3 overflow-hidden p-8 text-center text-white"
        style={{
          background: props.imageUrl
            ? `linear-gradient(rgba(0,0,0,.12), rgba(0,0,0,.38)), url(${props.imageUrl})`
            : 'radial-gradient(circle at 50% 28%, rgba(255,255,255,.25), transparent 28%), linear-gradient(160deg, #15233b, #05070a)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <h2 className="[font-family:Georgia,'Times_New_Roman',serif] font-normal text-[clamp(32px,4vw,58px)] leading-none">
          {props.visualTitle}
        </h2>
        {props.visualDescription ? (
          <p className="max-w-[380px] text-white/75">{props.visualDescription}</p>
        ) : null}
      </Card>
    </section>
  ),
})

export const BentoGrid = defineComponent({
  name: 'BentoGrid',
  description: 'Responsive grid for cards, tiles, metrics, and panels.',
  props: z.object({
    children: z.array(z.any()),
    minColumnWidth: z.number().optional(),
  }),
  component: ({ props, renderNode }) => (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(${props.minColumnWidth || 240}px, 1fr))`,
      }}
    >
      {renderNode(props.children)}
    </div>
  ),
})

export const SidebarShell = defineComponent({
  name: 'SidebarShell',
  description: 'Application shell with a left navigation rail and main content.',
  props: z.object({
    navItems: z.array(z.string()),
    children: z.array(z.any()),
    title: z.string().optional(),
  }),
  component: ({ props, renderNode }) => (
    <div className="grid gap-[18px] [grid-template-columns:minmax(190px,240px)_1fr]">
      <Card className="grid content-start gap-3 p-4">
        {props.title ? <strong>{props.title}</strong> : null}
        <div className="grid gap-2 text-muted-foreground">{renderList(props.navItems)}</div>
      </Card>
      <div className="grid min-w-0 gap-4">{renderNode(props.children)}</div>
    </div>
  ),
})

export const FeatureCard = defineComponent({
  name: 'FeatureCard',
  description: 'Feature or benefit card with title, description, and optional meta text.',
  props: z.object({
    title: z.string(),
    description: z.string(),
    meta: z.string().optional(),
    visualWeight: z.enum(['default', 'emphasis']).optional(),
  }),
  component: ({ props }) => (
    <Card
      className={cn(
        'gap-2.5 p-5',
        props.visualWeight === 'emphasis' && 'ring-1 ring-primary/25 shadow-sm',
      )}
    >
      {props.meta ? <Badge className="w-fit">{props.meta}</Badge> : null}
      <CardTitle className={cn('text-xl', props.visualWeight === 'emphasis' && 'text-[1.35rem]')}>
        {props.title}
      </CardTitle>
      <CardDescription className="leading-[1.55]">{props.description}</CardDescription>
    </Card>
  ),
})

export const MetricCard = defineComponent({
  name: 'MetricCard',
  description: 'Metric card with label, value, and optional trend text.',
  props: z.object({
    label: z.string(),
    value: z.string(),
    trend: z.string().optional(),
  }),
  component: ({ props }) => (
    <Card className="gap-2 p-5">
      <span className="text-[13px] text-muted-foreground">{props.label}</span>
      <strong className="text-[36px] leading-none">{props.value}</strong>
      {props.trend ? (
        <Badge className={cn('w-fit', toneBadgeClasses('success'))}>{props.trend}</Badge>
      ) : null}
    </Card>
  ),
})

export const TestimonialCard = defineComponent({
  name: 'TestimonialCard',
  description: 'Customer quote card with attribution.',
  props: z.object({
    quote: z.string(),
    name: z.string(),
    role: z.string().optional(),
  }),
  component: ({ props }) => (
    <Card className="m-0 gap-3.5 p-[22px]">
      <blockquote className="m-0 leading-[1.65]">&ldquo;{props.quote}&rdquo;</blockquote>
      <div className="text-muted-foreground">
        {props.name}
        {props.role ? `, ${props.role}` : ''}
      </div>
    </Card>
  ),
})

export const PricingTier = defineComponent({
  name: 'PricingTier',
  description: 'Pricing plan card with plan name, price, features, and action.',
  props: z.object({
    name: z.string(),
    price: z.string(),
    features: z.array(z.string()),
    actionLabel: z.string().optional(),
    highlighted: z.boolean().optional(),
  }),
  component: ({ props }) => (
    <Card
      className={cn(
        'gap-3.5 p-[22px]',
        props.highlighted && 'outline outline-2 outline-primary',
      )}
    >
      <div>
        <h3 className="m-0">{props.name}</h3>
        <strong className="text-[34px]">{props.price}</strong>
      </div>
      <div className="grid gap-2 text-muted-foreground">{renderList(props.features)}</div>
      {props.actionLabel ? (
        <Button variant="default" size="default" className="w-fit">
          {props.actionLabel}
        </Button>
      ) : null}
    </Card>
  ),
})

export const FAQBlock = defineComponent({
  name: 'FAQBlock',
  description: 'Compact FAQ list. Use paired question and answer arrays with matching order.',
  props: z.object({
    questions: z.array(z.string()),
    answers: z.array(z.string()),
  }),
  component: ({ props }) => (
    <div className="grid gap-3">
      {props.questions.map((question, index) => (
        <Card key={question} className="p-[18px]">
          <details>
            <summary className="cursor-pointer font-bold">{question}</summary>
            <p className="mb-0 text-muted-foreground">{props.answers[index] || ''}</p>
          </details>
        </Card>
      ))}
    </div>
  ),
})

export const ProductCard = defineComponent({
  name: 'ProductCard',
  description: 'Commerce product card with name, price, description, and optional image.',
  props: z.object({
    name: z.string(),
    price: z.string(),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
    badge: z.string().optional(),
    cardStyle: z.enum(['default', 'minimal', 'showcase']).optional(),
  }),
  component: ({ props }) => {
    const style = props.cardStyle || 'default'
    const pad = style === 'minimal' ? 'p-4' : 'p-[18px]'
    return (
    <Card
      className={cn(
        'grid gap-0 overflow-hidden p-0',
        style === 'showcase' && 'ring-1 ring-border/80 shadow-md',
        style === 'minimal' && 'border-dashed',
      )}
    >
      {props.imageUrl && style !== 'minimal' ? (
        <img
          src={props.imageUrl}
          alt={props.name}
          className={cn('w-full object-cover', style === 'showcase' ? 'aspect-video' : 'aspect-[4/3]')}
        />
      ) : null}
      <div className={cn('grid gap-2', pad)}>
        {props.badge ? <Badge className="w-fit">{props.badge}</Badge> : null}
        <h3 className="m-0">{props.name}</h3>
        {props.description ? (
          <p className="m-0 text-muted-foreground">{props.description}</p>
        ) : null}
        <strong>{props.price}</strong>
      </div>
    </Card>
    )
  },
})

export const CategoryTile = defineComponent({
  name: 'CategoryTile',
  description: 'Commerce category tile with title, description, and optional image.',
  props: z.object({
    title: z.string(),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
    tileVariant: z.enum(['hero', 'flat']).optional(),
  }),
  component: ({ props }) => {
    const hero = (props.tileVariant || 'hero') === 'hero' && props.imageUrl
    return (
    <Card
      className={cn(
        'min-h-[180px] flex-col justify-end gap-1.5 overflow-hidden p-[22px]',
        !hero && 'border-border/80 bg-muted/20',
      )}
      style={
        hero
          ? {
              background: `linear-gradient(rgba(2,6,23,.1), rgba(2,6,23,.78)), url(${props.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              color: '#fff',
            }
          : undefined
      }
    >
      <h3 className="m-0">{props.title}</h3>
      {props.description ? (
        <p className={cn('mb-0', hero ? 'text-white/80' : 'text-muted-foreground')}>
          {props.description}
        </p>
      ) : null}
    </Card>
    )
  },
})

export const CartSummary = defineComponent({
  name: 'CartSummary',
  description: 'Commerce cart/order summary block.',
  props: z.object({
    title: z.string(),
    items: z.array(z.string()),
    total: z.string(),
    actionLabel: z.string().optional(),
  }),
  component: ({ props }) => (
    <Card className="gap-3 p-5">
      <h3 className="m-0">{props.title}</h3>
      <div className="grid gap-2 text-muted-foreground">{renderList(props.items)}</div>
      <strong>{props.total}</strong>
      {props.actionLabel ? (
        <Button variant="default" size="default" className="w-fit">
          {props.actionLabel}
        </Button>
      ) : null}
    </Card>
  ),
})

export const PromoBand = defineComponent({
  name: 'PromoBand',
  description: 'Promotional message band with optional action label.',
  props: z.object({
    title: z.string(),
    description: z.string(),
    actionLabel: z.string().optional(),
  }),
  component: ({ props }) => (
    <Card className="flex flex-row flex-wrap justify-between gap-[18px] p-6">
      <div>
        <h3 className="m-0">{props.title}</h3>
        <p className="mb-0 text-muted-foreground">{props.description}</p>
      </div>
      {props.actionLabel ? (
        <Button variant="default" size="default" className="self-center">
          {props.actionLabel}
        </Button>
      ) : null}
    </Card>
  ),
})

export const DataPanel = defineComponent({
  name: 'DataPanel',
  description: 'Dashboard panel with title, optional summary, and child data components.',
  props: z.object({
    title: z.string(),
    summary: z.string().optional(),
    children: z.array(z.any()).optional(),
  }),
  component: ({ props, renderNode }) => (
    <Card className="grid min-w-0 gap-3.5 p-5">
      <div>
        <h3 className="m-0">{props.title}</h3>
        {props.summary ? <p className="mb-0 text-muted-foreground">{props.summary}</p> : null}
      </div>
      {props.children?.length ? renderNode(props.children) : null}
    </Card>
  ),
})

export const FilterBar = defineComponent({
  name: 'FilterBar',
  description: 'Horizontal filter/action bar with chips and optional primary action.',
  props: z.object({
    filters: z.array(z.string()),
    actionLabel: z.string().optional(),
  }),
  component: ({ props }) => (
    <Card className="flex flex-row flex-wrap items-center gap-2.5 p-3">
      {props.filters.map((filter) => (
        <Badge key={filter} variant="secondary">
          {filter}
        </Badge>
      ))}
      {props.actionLabel ? (
        <Button variant="default" size="sm" className="ml-auto">
          {props.actionLabel}
        </Button>
      ) : null}
    </Card>
  ),
})

export const CommandBar = defineComponent({
  name: 'CommandBar',
  description: 'Primary command row with title, actions, and optional search placeholder.',
  props: z.object({
    title: z.string(),
    actions: z.array(z.string()).optional(),
    searchPlaceholder: z.string().optional(),
  }),
  component: ({ props }) => (
    <Card className="flex flex-row flex-wrap items-center justify-between gap-3 p-4">
      <strong>{props.title}</strong>
      {props.searchPlaceholder ? (
        <Input
          readOnly
          placeholder={props.searchPlaceholder}
          className="max-w-[280px] cursor-default"
        />
      ) : null}
      <div className="flex gap-2">
        {props.actions?.map((action) => (
          <Button key={action} variant="default" size="sm">
            {action}
          </Button>
        ))}
      </div>
    </Card>
  ),
})

export const ActivityFeed = defineComponent({
  name: 'ActivityFeed',
  description: 'Recent activity list with timestamp-like detail strings.',
  props: z.object({
    title: z.string(),
    items: z.array(z.string()),
  }),
  component: ({ props }) => (
    <Card className="grid gap-3 p-5">
      <h3 className="m-0">{props.title}</h3>
      <div className="grid gap-2.5">
        {props.items.map((item) => (
          <div key={item} className="text-muted-foreground">
            {item}
          </div>
        ))}
      </div>
    </Card>
  ),
})

export const StatusPill = defineComponent({
  name: 'StatusPill',
  description: 'Small status badge. Tone controls semantic color.',
  props: z.object({
    label: z.string(),
    tone: z.enum(['neutral', 'success', 'warning', 'danger']).optional(),
  }),
  component: ({ props }) => (
    <Badge variant="outline" className={cn(toneBadgeClasses(props.tone))}>
      {props.label}
    </Badge>
  ),
})

export const PreviewArtifact = defineComponent({
  name: 'PreviewArtifact',
  description: 'Inline preview card for content that can later become a side-panel artifact.',
  props: z.object({
    title: z.string(),
    description: z.string(),
    kind: z.string().optional(),
  }),
  component: ({ props }) => (
    <Card className="grid gap-2 p-[18px]">
      {props.kind ? <Badge className="w-fit">{props.kind}</Badge> : null}
      <strong>{props.title}</strong>
      <span className="text-muted-foreground">{props.description}</span>
    </Card>
  ),
})

export const CodeArtifact = defineComponent({
  name: 'CodeArtifact',
  description: 'Code preview artifact with language label and code string.',
  props: z.object({
    title: z.string(),
    language: z.string(),
    codeString: z.string(),
  }),
  component: ({ props }) => (
    <Card className="overflow-hidden gap-0 py-0">
      <CardHeader className="border-b border-border px-4 py-3">
        <CardTitle className="font-bold">
          {props.title}{' '}
          <span className="font-normal text-muted-foreground">{props.language}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 py-0">
        <pre className="m-0 overflow-auto bg-muted/30 p-4 text-sm">
          <code>{props.codeString}</code>
        </pre>
      </CardContent>
    </Card>
  ),
})

export const SpecArtifact = defineComponent({
  name: 'SpecArtifact',
  description: 'Structured specification preview with title and bullet points.',
  props: z.object({
    title: z.string(),
    points: z.array(z.string()),
  }),
  component: ({ props }) => (
    <Card className="p-[18px]">
      <h3 className="mt-0">{props.title}</h3>
      <ul className="mb-0 list-disc pl-5 text-muted-foreground">
        {props.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </Card>
  ),
})

export const shipFastOpenUIComponents = [
  PageShell,
  TopNav,
  Section,
  SplitHero,
  EditorialHero,
  DashboardShell,
  MetricGrid,
  CampaignList,
  ActivityTable,
  FeatureBento,
  AuthSplitPanel,
  BentoGrid,
  SidebarShell,
  FeatureCard,
  MetricCard,
  TestimonialCard,
  PricingTier,
  FAQBlock,
  ProductCard,
  CategoryTile,
  CartSummary,
  PromoBand,
  DataPanel,
  FilterBar,
  CommandBar,
  ActivityFeed,
  StatusPill,
  PreviewArtifact,
  CodeArtifact,
  SpecArtifact,
  ...evilChartComponents,
]

export const shipFastOpenUIComponentNames = shipFastOpenUIComponents.map((component) => component.name)

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
      '- Optional PageShell visualRhythm: "default" | "airy" | "dense" | "bold" when the VARIATION block suggests it.',
      '- Prefer EditorialHero for polished marketing pages and DashboardShell for application/dashboard prompts. VARY hero family when VARIATION nudges — avoid defaulting to the same hero every run.',
      '- EditorialHero layoutVariant "editorial" | "compact" | "spotlight"; SplitHero layoutVariant "split" | "stacked".',
      '- Put root first and reference named sections for progressive streaming.',
      '- Avoid placing raw MetricCard children inside SplitHero when a structured EditorialHero can own the hierarchy.',
      '- Compose pages from abstract intents and category blocks — no template SKU.',
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
      '- FeatureBento gridMood "spotlight-first" widens the first tile on medium+ viewports.',
      '- FeatureCard visualWeight "emphasis" vs "default" for mixed card hierarchy.',
      '- When VARIATION compositionHint suggests omitting a block, vary FAQ vs testimonials vs pricing — same brief, different subgraph.',
    ],
  },
  {
    name: 'Ship Fast Commerce',
    components: ['ProductCard', 'CategoryTile', 'CartSummary', 'PromoBand'],
    notes: [
      '- Use ProductCard for product grids and CategoryTile for collection navigation.',
      '- ProductCard cardStyle "minimal" | "showcase" | "default"; CategoryTile tileVariant "hero" vs "flat" for different collection rhythm.',
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
      '- DashboardShell chrome "minimal" for a tighter sidebar treatment.',
      '- MetricGrid density "compact" for tighter KPI rows when the brief is data-heavy.',
    ],
  },
  {
    name: 'Ship Fast Forms',
    components: ['AuthSplitPanel'],
    notes: [
      '- AuthSplitPanel for sign-up and onboarding flows.',
      '- panelLayout "stacked" for vertical form+story layout instead of split columns.',
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
      '- Optional chartFrame "default" | "flush" | "emphasis" on Evil* charts for container variety.',
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
    'Prefer different enum values (visualRhythm, layoutVariant, gridMood, cardStyle, chartFrame, density, chrome, panelLayout) when the session fingerprint changes — pick among allowed options, never invent CSS.',
  ],
}

export const shipFastOpenUILibrary = createLibrary({
  root: 'PageShell',
  componentGroups: shipFastOpenUIComponentGroups,
  components: shipFastOpenUIComponents,
})

export const openUIComponentOpenPatternSource = [...shipFastOpenUIComponentNames]
  .sort()
  .join('|')

export function getShipFastOpenUISystemPrompt(): string {
  return shipFastOpenUILibrary.prompt(shipFastOpenUIPromptOptions)
}
