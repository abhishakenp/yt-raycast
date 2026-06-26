function chartFrameClass(frame?: string) {
  switch (frame) {
    case 'flush':
      return 'rounded-lg border-0 bg-muted/30'
    case 'emphasis':
      return 'rounded-lg border-2 border-primary/30 bg-primary/5'
    default:
      return 'rounded border border-dashed border-gray-300'
  }
}

type ChartFrame = 'default' | 'flush' | 'emphasis' | undefined

// Placeholder chart components — contract props stay valid for weak-model generation.
export const EvilArea = ({
  height,
  chartFrame,
}: {
  data?: unknown
  xKey?: string
  series?: unknown
  height?: number
  chartFrame?: ChartFrame
}) => (
  <div
    style={{ height: height || 200 }}
    className={`flex items-center justify-center ${chartFrameClass(chartFrame)}`}
  >
    <span className="text-gray-500 text-sm">Area Chart Placeholder</span>
  </div>
)

export const EvilBar = ({
  height,
  stacked,
  chartFrame,
}: {
  data?: unknown
  xKey?: string
  series?: unknown
  height?: number
  stacked?: boolean
  chartFrame?: ChartFrame
}) => (
  <div
    style={{ height: height || 200 }}
    className={`flex items-center justify-center ${chartFrameClass(chartFrame)}`}
  >
    <span className="text-gray-500 text-sm">
      Bar Chart Placeholder{stacked ? ' (stacked)' : ''}
    </span>
  </div>
)

export const EvilLine = ({
  height,
  chartFrame,
}: {
  data?: unknown
  xKey?: string
  series?: unknown
  height?: number
  chartFrame?: ChartFrame
}) => (
  <div
    style={{ height: height || 200 }}
    className={`flex items-center justify-center ${chartFrameClass(chartFrame)}`}
  >
    <span className="text-gray-500 text-sm">Line Chart Placeholder</span>
  </div>
)

export const EvilPie = ({
  height,
  donut,
  chartFrame,
}: {
  data?: unknown
  height?: number
  donut?: boolean
  chartFrame?: ChartFrame
}) => (
  <div
    style={{ height: height || 200 }}
    className={`flex items-center justify-center ${chartFrameClass(chartFrame)}`}
  >
    <span className="text-gray-500 text-sm">
      Pie Chart Placeholder{donut ? ' (donut)' : ''}
    </span>
  </div>
)

export const EvilRadar = ({
  height,
  chartFrame,
}: {
  data?: unknown
  axisKey?: string
  series?: unknown
  height?: number
  chartFrame?: ChartFrame
}) => (
  <div
    style={{ height: height || 200 }}
    className={`flex items-center justify-center ${chartFrameClass(chartFrame)}`}
  >
    <span className="text-gray-500 text-sm">Radar Chart Placeholder</span>
  </div>
)
