import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * FilmDirectorHero — full-height split hero for a film director / cinematographer
 * portfolio. A two-column layout with a left text column (uppercase tracked
 * eyebrow label, a thin light display headline where one emphasized phrase is
 * rendered in medium weight, a lede paragraph, a play-icon primary CTA + an
 * outlined secondary CTA, and a 3-up KPI strip above a top border) beside a tall
 * 4:5 portrait photo with a soft bottom-up gradient overlay. CTAs route through
 * useNavigate; the portrait uses the alt-driven Image component. Use as the top
 * hero for filmmakers, directors, cinematographers, DPs, or video production
 * portfolios on a clean, editorial, light canvas.
 */
export const FilmDirectorHero = defineComponent({
  name: "FilmDirectorHero",
  description:
    "Full-height split hero for a film director / cinematographer portfolio: a two-column layout with a left text column (uppercase tracked eyebrow label, a thin light display headline with one emphasized phrase rendered in medium weight, a lede paragraph, a play-icon primary CTA plus an outlined secondary CTA, and a 3-up KPI strip above a top border) beside a tall 4:5 portrait photo with a soft bottom-up gradient overlay. CTAs route through useNavigate; the portrait uses the Image component. Use as the top hero for filmmakers, directors, cinematographers, DPs, or video production portfolios on a clean, editorial, light canvas.",
  props: z.object({
    eyebrow: z.string().optional(),
    /** Heading text; the `highlight` phrase within it is rendered emphasized. */
    heading: z.string().optional(),
    highlight: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    imageAlt: z.string().optional(),
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heroEyebrow = props.eyebrow ?? "Film Director & Cinematographer"
    const heroHeading = props.heading ?? "Visual stories that resonate"
    const heroHighlight = props.highlight ?? "resonate"
    const heroSub =
      props.subheading ??
      "Crafting cinematic narratives for brands, agencies, and artists. From concept to final cut, I bring vision and precision to every frame."
    const heroPrimary = props.primaryCta ?? "Watch Reel"
    const heroSecondary = props.secondaryCta ?? "View Projects"
    const heroImageAlt =
      props.imageAlt ??
      "cinematic behind-the-scenes shot of a film director operating a professional cinema camera on a commercial set with lighting equipment visible"
    const heroStats = props.stats?.length
      ? props.stats
      : [
          { value: "12+", label: "Years Experience" },
          { value: "87", label: "Projects Delivered" },
          { value: "14", label: "Industry Awards" },
        ]

    const PlayIcon = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
          clipRule="evenodd"
        />
      </svg>
    )

    const renderHeading = () => {
      const idx = heroHighlight ? heroHeading.indexOf(heroHighlight) : -1
      if (idx === -1) return heroHeading
      return (
        <>
          {heroHeading.slice(0, idx)}
          <span className="font-medium">{heroHighlight}</span>
          {heroHeading.slice(idx + heroHighlight.length)}
        </>
      )
    }

    return (
      <section
        className={cn("flex min-h-screen items-center", props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-24 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="order-2 lg:order-1">
              <p className="mb-4 text-sm uppercase tracking-widest text-muted-foreground">
                {heroEyebrow}
              </p>
              <h1 className="mb-6 text-4xl font-light leading-tight sm:text-5xl lg:text-6xl">
                {renderHeading()}
              </h1>
              <p className="mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
                {heroSub}
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <PlayIcon className="mr-2 size-5" />
                  {heroPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(heroSecondary)}
                  className="inline-flex items-center rounded-md border border-border px-6 py-3 transition-colors hover:border-foreground"
                >
                  {heroSecondary}
                </button>
              </div>
              <div className="mt-12 grid grid-cols-3 gap-8 border-t border-border pt-8">
                {heroStats.map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl font-light">{s.value}</p>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-muted">
                <Image
                  alt={heroImageAlt}
                  w={800}
                  h={1000}
                  className="size-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  },
})
