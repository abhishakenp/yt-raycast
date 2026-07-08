import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { ResponsiveGrid } from '#/section-kit/index.ts'

/**
 * KidsEducationLogos — trusted-by school/partner logo strip for a kids /
 * family learning platform. A bordered band with a centered uppercase eyebrow
 * line above a responsive grid of star-mark + wordmark logo buttons rendered at
 * reduced opacity. Each logo routes through useNavigate. Use directly beneath a
 * hero to build parent trust for kids-education startups, children's e-learning
 * platforms, tutoring services, and family learning apps. Renders fully with no
 * props via baked-in defaults.
 */
export const KidsEducationLogos = defineCapsule({
  name: 'KidsEducationLogos',
  description:
    "Trusted-by school/partner logo strip for a kids / family learning platform: a bordered band with a centered uppercase eyebrow line above a responsive grid of star-mark + wordmark logo buttons rendered at reduced opacity. Each logo routes through useNavigate. Use directly beneath a hero to build parent trust for kids-education startups, children's e-learning platforms, tutoring services, and family learning apps.",
  props: z.object({
    /** Uppercase eyebrow line above the logos. */
    eyebrow: z.string().optional(),
    /** Logo wordmark names. */
    names: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow =
      props.eyebrow ?? 'Trusted by leading schools and parents worldwide'
    const names = props.names?.length
      ? props.names
      : [
          'BrightStart',
          'KidsFirst',
          'LearnHub',
          'SafeLearn',
          'EduCore',
          'StarKids',
        ]

    return (
      <section
        className={cn(
          'border-y border-border bg-background py-12',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {eyebrow}
          </p>
          <ResponsiveGrid
            cols="2-3-6"
            gap="lg"
            className="items-center opacity-60"
          >
            {names.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => go(name)}
                className="flex items-center justify-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <svg
                  className="size-8"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="text-lg font-bold">{name}</span>
              </button>
            ))}
          </ResponsiveGrid>
        </div>
      </section>
    )
  },
})
