import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
/**
 * KidsEducationLogos — playful-primary trusted-by strip for a kids / family
 * learning platform. A hairline-topped-and-bottomed band wrapping a plain
 * Container: a mono micro-label eyebrow with an index numeral over a staggered
 * row of sharp-cornered 2px-bordered wordmark chips (star mark + name) that lift
 * on a hard offset token shadow and press down on click. Each chip routes
 * through section-kit route links. Use directly beneath a hero to build parent
 * trust for kids-education startups, children's e-learning platforms, tutoring
 * services, and family learning apps. Renders fully with no props via baked-in
 * defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const KidsEducationLogos = defineCapsule({
  name: 'KidsEducationLogos',
  description:
    "Playful-primary trusted-by strip for a kids / family learning platform: a hairline-topped-and-bottomed band wrapping a plain Container with a mono micro-label eyebrow (index numeral) over a staggered row of sharp-cornered 2px-bordered wordmark chips (star mark + name) that lift on a hard offset token shadow and press down on click. Each chip routes through section-kit route links. Use directly beneath a hero to build parent trust for kids-education startups, children's e-learning platforms, tutoring services, and family learning apps.",
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
    const StarMark = () => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        className="text-primary"
      >
        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    )
    return (
      <LogoStrip
        className={cn(
          'border-y-2 border-foreground bg-background py-12',
          props.className,
        )}
      >
        <Container>
          <LogoStripLabel className="flex items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <span aria-hidden="true" className="text-primary">
              [01]
            </span>
            {eyebrow}
          </LogoStripLabel>
          <LogoStripItems layout="flex" className="mt-8 gap-x-4 gap-y-4">
            {names.filter(Boolean).map((logo, i) => (
              <LogoStripItem
                key={logo}
                variant="opacity-hover"
                asChild
                className={cn(
                  'inline-flex items-center gap-2 rounded-none border-2 border-border bg-card px-3.5 py-2 font-mono text-sm font-bold uppercase tracking-[0.08em] text-foreground opacity-100 shadow-[3px_3px_0_0] shadow-transparent transition-all duration-150 hover:border-foreground hover:text-foreground hover:shadow-foreground active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none',
                  i % 2 === 1 && 'sm:translate-y-2',
                )}
              >
                <NavbarRouteLink href={logo}>
                  <StarMark />
                  {logo}
                </NavbarRouteLink>
              </LogoStripItem>
            ))}
          </LogoStripItems>
        </Container>
      </LogoStrip>
    )
  },
})
