import { cn } from "#/lib/utils.ts";

/**
 * StatGrid lays out key/value statistics in a responsive grid.
 * Column count (2/3/4) maps to responsive grid classes; each cell stacks a
 * bold value over a muted label. Theme-token only.
 */
export function StatGrid(props: {
  stats: { value: string; label: string }[];
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const columns = props.columns ?? 4;
  const colClass =
    columns === 2
      ? "grid-cols-2"
      : columns === 3
        ? "grid-cols-2 md:grid-cols-3"
        : "grid-cols-2 md:grid-cols-4";

  return (
    <div className={cn("grid gap-8", colClass, props.className)}>
      {props.stats.map((s, i) => (
        <div key={i} className="flex flex-col gap-1 text-center">
          <span className="text-3xl font-bold text-foreground md:text-4xl">
            {s.value}
          </span>
          <span className="text-sm text-muted-foreground">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
