import type { ReactNode } from "react";

import { cn } from "#/lib/utils.ts";

import { SectionHeading } from "./SectionHeading.tsx";

/**
 * FeatureGrid renders a responsive grid of feature cards with an optional
 * heading/subheading. Columns default to 3 and adapt across breakpoints.
 * Each feature card shows an optional icon tile, a title, and a description.
 */
export function FeatureGrid(props: {
  heading?: string;
  subheading?: string;
  features: { title: string; description: string; icon?: ReactNode }[];
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const columns = props.columns ?? 3;
  const colClass =
    columns === 2
      ? "md:grid-cols-2"
      : columns === 4
        ? "md:grid-cols-2 lg:grid-cols-4"
        : "md:grid-cols-3";

  return (
    <section className={cn("flex flex-col gap-10", props.className)}>
      {props.heading ? (
        <SectionHeading title={props.heading} subtitle={props.subheading} />
      ) : null}
      <div className={cn("grid gap-6", "grid-cols-1", colClass)}>
        {props.features.map((f, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6"
          >
            {f.icon ? (
              <div className="inline-flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {f.icon}
              </div>
            ) : null}
            <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
