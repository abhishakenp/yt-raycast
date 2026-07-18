import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * KidsEducationLogos — trusted-by school/partner logo strip for a kids /
 * family learning platform. A bordered band with a centered uppercase eyebrow
 * line above a responsive grid of star-mark + wordmark logo buttons rendered at
 * reduced opacity. Each logo routes through useNavigate. Use directly beneath a
 * hero to build parent trust for kids-education startups, children's e-learning
 * platforms, tutoring services, and family learning apps. Renders fully with no
 * props via baked-in defaults.
 */
import { LogoStrip } from '#/section-kit/LogoStrip.tsx'
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
      <LogoStrip
        lead={eyebrow}
        logos={names}
        logoStyle="opacity-hover"
        onClickLogo={go}
        className={cn(
          'border-y border-border bg-background py-12',
          props.className,
        )}
      />
    )
  },
})
