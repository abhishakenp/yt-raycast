import { defineComponent } from '@openuidev/react-lang'
import { z } from 'zod/v4'

import { EvilArea } from '@/components/charts/evil-area'
import { EvilBar } from '@/components/charts/evil-bar'
import { EvilLine } from '@/components/charts/evil-line'
import { EvilPie } from '@/components/charts/evil-pie'
import { EvilRadar } from '@/components/charts/evil-radar'

const evilSeriesSchema = z.object({
  key: z.string(),
  label: z.string().optional(),
  color: z.string().optional(),
})

const evilPieDatumSchema = z.object({
  label: z.string(),
  value: z.number(),
  color: z.string().optional(),
})

export const EvilBarComponent = defineComponent({
  name: 'EvilBar',
  description:
    'Animated bar chart with shadcn-token-driven colors. Use when comparing categorical values across multiple series.',
  props: z.object({
    data: z.array(z.record(z.string(), z.any())),
    xKey: z.string(),
    series: z.array(evilSeriesSchema),
    height: z.number().optional(),
    stacked: z.boolean().optional(),
    chartFrame: z.enum(['default', 'flush', 'emphasis']).optional(),
  }),
  component: ({ props }) => (
    <EvilBar
      data={props.data as Array<Record<string, string | number>>}
      xKey={props.xKey}
      series={props.series}
      height={props.height}
      stacked={props.stacked}
      chartFrame={props.chartFrame}
    />
  ),
})

export const EvilLineComponent = defineComponent({
  name: 'EvilLine',
  description:
    'Animated line chart with shadcn-token-driven colors. Use for time-series trends across one or multiple series.',
  props: z.object({
    data: z.array(z.record(z.string(), z.any())),
    xKey: z.string(),
    series: z.array(evilSeriesSchema),
    height: z.number().optional(),
    chartFrame: z.enum(['default', 'flush', 'emphasis']).optional(),
  }),
  component: ({ props }) => (
    <EvilLine
      data={props.data as Array<Record<string, string | number>>}
      xKey={props.xKey}
      series={props.series}
      height={props.height}
      chartFrame={props.chartFrame}
    />
  ),
})

export const EvilAreaComponent = defineComponent({
  name: 'EvilArea',
  description:
    'Animated area chart with gradient fills and shadcn-token colors. Use for cumulative trends or volume-style time-series data.',
  props: z.object({
    data: z.array(z.record(z.string(), z.any())),
    xKey: z.string(),
    series: z.array(evilSeriesSchema),
    height: z.number().optional(),
    chartFrame: z.enum(['default', 'flush', 'emphasis']).optional(),
  }),
  component: ({ props }) => (
    <EvilArea
      data={props.data as Array<Record<string, string | number>>}
      xKey={props.xKey}
      series={props.series}
      height={props.height}
      chartFrame={props.chartFrame}
    />
  ),
})

export const EvilPieComponent = defineComponent({
  name: 'EvilPie',
  description:
    'Animated pie or donut chart with shadcn-token-driven colors. Use for share/breakdown visualizations across a small set of categories.',
  props: z.object({
    data: z.array(evilPieDatumSchema),
    height: z.number().optional(),
    donut: z.boolean().optional(),
    chartFrame: z.enum(['default', 'flush', 'emphasis']).optional(),
  }),
  component: ({ props }) => (
    <EvilPie
      data={props.data}
      height={props.height}
      donut={props.donut}
      chartFrame={props.chartFrame}
    />
  ),
})

export const EvilRadarComponent = defineComponent({
  name: 'EvilRadar',
  description:
    'Animated radar chart with polar grid and shadcn-token colors. Use for multi-dimensional comparisons across a fixed set of axes.',
  props: z.object({
    data: z.array(z.record(z.string(), z.any())),
    axisKey: z.string(),
    series: z.array(evilSeriesSchema),
    height: z.number().optional(),
    chartFrame: z.enum(['default', 'flush', 'emphasis']).optional(),
  }),
  component: ({ props }) => (
    <EvilRadar
      data={props.data as Array<Record<string, string | number>>}
      axisKey={props.axisKey}
      series={props.series}
      height={props.height}
      chartFrame={props.chartFrame}
    />
  ),
})

export const evilChartComponents = [
  EvilBarComponent,
  EvilLineComponent,
  EvilAreaComponent,
  EvilPieComponent,
  EvilRadarComponent,
]

export const evilChartComponentNames = [
  'EvilBar',
  'EvilLine',
  'EvilArea',
  'EvilPie',
  'EvilRadar',
]
