import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "#/components/ui/chart.tsx"

const DEFAULT_DATA = [
  { label: "Jan", value: 186 },
  { label: "Feb", value: 305 },
  { label: "Mar", value: 237 },
  { label: "Apr", value: 173 },
  { label: "May", value: 209 },
  { label: "Jun", value: 264 },
]

// Data primitive (recharts): renders a static area/bar/line chart from
// data:[{label,value}]. Ships sensible sample defaults so it renders standalone.
export const Chart = defineComponent({
  name: "Chart",
  description:
    "Static chart from data:[{label,value}]. kind 'area' (default), 'bar', or 'line'. Ships sample data so it renders standalone.",
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
    const config = {
      value: { label: props.label ?? "Value", color: "var(--chart-1)" },
    } satisfies ChartConfig
    const kind = props.kind ?? "area"

    if (kind === "bar") {
      return (
        <ChartContainer config={config} className={props.className}>
          <BarChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="value" fill="var(--color-value)" radius={4} />
          </BarChart>
        </ChartContainer>
      )
    }

    if (kind === "line") {
      return (
        <ChartContainer config={config} className={props.className}>
          <LineChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line dataKey="value" stroke="var(--color-value)" strokeWidth={2} dot={false} />
          </LineChart>
        </ChartContainer>
      )
    }

    return (
      <ChartContainer config={config} className={props.className}>
        <AreaChart data={data}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            dataKey="value"
            type="natural"
            fill="var(--color-value)"
            fillOpacity={0.4}
            stroke="var(--color-value)"
          />
        </AreaChart>
      </ChartContainer>
    )
  },
})
