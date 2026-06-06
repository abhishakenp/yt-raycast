import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"

const DEFAULT_DATA = [
  { label: "Jan", value: 186 },
  { label: "Feb", value: 305 },
  { label: "Mar", value: 237 },
  { label: "Apr", value: 173 },
  { label: "May", value: 209 },
  { label: "Jun", value: 264 },
]

const chartPoints = (data: typeof DEFAULT_DATA) => {
  const values = data.map((item) => item.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = Math.max(1, max - min)
  const step = data.length > 1 ? 280 / (data.length - 1) : 0

  return data.map((item, index) => ({
    ...item,
    x: 20 + index * step,
    y: 130 - ((item.value - min) / span) * 90,
  }))
}

export const Chart = defineComponent({
  name: "Chart",
  description:
    "Static SVG chart from data:[{label,value}]. kind 'area' (default), 'bar', or 'line'. Ships sample data so it renders standalone.",
  props: z.object({
    data: z
      .array(z.object({ label: z.string(), value: z.number() }))
      .optional(),
    kind: z.enum(["area", "bar", "line"]).optional(),
    label: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const data = props.data && props.data.length > 0 ? props.data : DEFAULT_DATA
    const kind = props.kind ?? "area"
    const points = chartPoints(data)
    const pointList = points.map((point) => `${point.x},${point.y}`).join(" ")
    const lastPoint = points[points.length - 1]
    const areaPath = `M ${points[0]?.x ?? 20},130 L ${pointList} L ${lastPoint?.x ?? 300},130 Z`
    const label = props.label ?? "Value"

    if (kind === "bar") {
      return (
        <div className={props.className} role="img" aria-label={label}>
          <svg viewBox="0 0 320 160" className="h-full min-h-48 w-full overflow-visible">
            <line x1="16" y1="132" x2="304" y2="132" stroke="rgb(var(--border))" />
            {points.map((point, index) => (
              <rect
                key={`${point.label}-${index}`}
                x={point.x - 13}
                y={point.y}
                width="26"
                height={130 - point.y}
                rx="6"
                fill="rgb(var(--primary))"
                opacity={0.86}
              />
            ))}
          </svg>
        </div>
      )
    }

    if (kind === "line") {
      return (
        <div className={props.className} role="img" aria-label={label}>
          <svg viewBox="0 0 320 160" className="h-full min-h-48 w-full overflow-visible">
            <line x1="16" y1="132" x2="304" y2="132" stroke="rgb(var(--border))" />
            <polyline
              points={pointList}
              fill="none"
              stroke="rgb(var(--primary))"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {points.map((point, index) => (
              <circle key={`${point.label}-${index}`} cx={point.x} cy={point.y} r="4" fill="rgb(var(--primary))" />
            ))}
          </svg>
        </div>
      )
    }

    return (
      <div className={props.className} role="img" aria-label={label}>
        <svg viewBox="0 0 320 160" className="h-full min-h-48 w-full overflow-visible">
          <defs>
            <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(var(--primary))" stopOpacity="0.38" />
              <stop offset="100%" stopColor="rgb(var(--primary))" stopOpacity="0.04" />
            </linearGradient>
          </defs>
          <line x1="16" y1="132" x2="304" y2="132" stroke="rgb(var(--border))" />
          <path d={areaPath} fill="url(#chart-fill)" />
          <polyline
            points={pointList}
            fill="none"
            stroke="rgb(var(--primary))"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    )
  },
})
