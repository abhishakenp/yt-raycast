import { cn } from "#/lib/utils.ts";

/**
 * StarRating renders a row of star glyphs reflecting a numeric rating.
 * Fills `Math.round(rating)` stars with the accent token and leaves the
 * remainder muted. Theme-token only; sizes via the `size` prop.
 */
export function StarRating(props: {
  rating?: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const rating = props.rating ?? 5;
  const max = props.max ?? 5;
  const size = props.size ?? "md";
  const filledCount = Math.round(rating);
  const starSize = size === "sm" ? "size-4" : "size-5";

  return (
    <div
      className={cn("inline-flex items-center gap-0.5", props.className)}
      aria-label={`${rating} out of ${max} stars`}
    >
      {Array.from({ length: max }).map((_, i) => (
        <svg
          key={i}
          aria-hidden
          viewBox="0 0 24 24"
          className={cn(
            starSize,
            i < filledCount
              ? "text-accent fill-current"
              : "text-muted-foreground fill-none stroke-current",
          )}
        >
          <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </div>
  );
}
