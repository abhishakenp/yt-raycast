import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
/**
 * KidsEducationLogos — trusted-by school/partner logo strip for a kids /
 * family learning platform. A bordered band with a centered uppercase eyebrow
 * line above a responsive grid of star-mark + wordmark logo buttons rendered at
 * reduced opacity. Each logo routes through section-kit route links. Use directly beneath a
 * hero to build parent trust for kids-education startups, children's e-learning
 * platforms, tutoring services, and family learning apps. Renders fully with no
 * props via baked-in defaults.
 */
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

export const KidsEducationLogos = defineCapsule({
  name: 'KidsEducationLogos',
  description:
    "Trusted-by school/partner logo strip for a kids / family learning platform: a bordered band with a centered uppercase eyebrow line above a responsive grid of star-mark + wordmark logo buttons rendered at reduced opacity. Each logo routes through section-kit route links. Use directly beneath a hero to build parent trust for kids-education startups, children's e-learning platforms, tutoring services, and family learning apps.",
  props: z.object({
    /** Uppercase eyebrow line above the logos. */
    eyebrow: z.string().optional(),
    /** Logo wordmark names. */
    names: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
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
        className={cn(
          'border-y border-border bg-background py-12',
          props.className,
        )}
      >
        <LogoStripLabel>{eyebrow}</LogoStripLabel>
        <LogoStripItems layout="flex" className="mt-8">
          {names.filter(Boolean).map((logo) => (
            <LogoStripItem key={logo} variant="opacity-hover" asChild>
              <NavbarRouteLink href={logo}>{logo}</NavbarRouteLink>
            </LogoStripItem>
          ))}
        </LogoStripItems>
      </LogoStrip>
    )
  },
})
