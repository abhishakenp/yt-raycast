import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  HeroSection,
  HeroHeading,
  HeroSubheading,
  HeroActions,
  HeroCta,
  HeroMediaPanel,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * ResumeCvHero — document-editorial opening hero for a personal resume / CV /
 * portfolio site. An asymmetric 7:5 split: the left column stacks a mono
 * metadata rail (availability label · primary tick · hairline rule · "CV / 2026"
 * index), the person's name set as a giant extrabold clamp signature over a huge
 * faint ghost-initials watermark, the role rendered as a mono uppercase byline,
 * a short pitch paragraph, and dual square CTAs — a hard-offset-shadowed
 * "Download CV" (with a mechanical press) plus an outlined "Contact"; the right
 * column holds an alt-driven headshot plate on a primary-tinted offset frame with
 * a mono "portrait" exhibit chip. Binary radius, hairline rules, tokens only.
 * Both CTAs route through section-kit route links. Use as the opening hero for
 * personal portfolios, online résumés, designer/developer profiles, or any
 * individual's professional landing page. Renders fully with no props via
 * baked-in "Jordan Avery" defaults.
 */
export const ResumeCvHero = defineCapsule({
  name: 'ResumeCvHero',
  description:
    "Document-editorial opening hero for a personal resume / CV / portfolio site: an asymmetric 7:5 split with a mono metadata rail (availability label, primary tick, hairline rule, 'CV / 2026' index), the person's name set as a giant extrabold clamp signature over a huge faint ghost-initials watermark, the role as a mono uppercase byline, a short pitch paragraph, and dual square CTAs (a hard-offset-shadowed 'Download CV' with press feedback plus an outlined 'Contact'); the right column holds an alt-driven headshot plate on a primary-tinted offset frame with a mono 'portrait' exhibit chip. Binary radius, hairline rules, tokens only. Both CTAs route through section-kit route links. Use as the opening hero for personal portfolios, online résumés, designer or developer profiles, or any individual's professional landing page.",
  props: z.object({
    /** Small eyebrow above the name (e.g. availability). */
    eyebrow: z.string().optional(),
    /** Person's name shown as the large headline. */
    name: z.string().optional(),
    /** Role / title beneath the name. */
    role: z.string().optional(),
    /** Short pitch paragraph. */
    pitch: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Route label the primary CTA navigates to. */
    primaryTarget: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Route label the secondary CTA navigates to. */
    secondaryTarget: z.string().optional(),
    /** Alt text driving the headshot photo. */
    imageAlt: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Available for new projects'
    const name = props.name ?? 'Jordan Avery'
    const role = props.role ?? 'Senior Product Designer'
    const pitch =
      props.pitch ??
      'I design calm, useful digital products for teams that care about craft. Eight years turning ambiguous problems into clear, accessible interfaces people love to use.'
    const primaryCta = props.primaryCta ?? 'Download CV'
    const primaryTarget = props.primaryTarget ?? 'CV'
    const secondaryCta = props.secondaryCta ?? 'Contact'
    const secondaryTarget = props.secondaryTarget ?? 'Contact'
    const imageAlt = props.imageAlt ?? 'professional headshot portrait'

    const monogram =
      name
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'CV'

    return (
      <HeroSection
        className={cn(
          'relative overflow-hidden bg-background',
          props.className,
        )}
      >
        {/* Giant faint ghost-initials watermark. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <span className="absolute -right-6 top-8 select-none font-extrabold leading-none tracking-tighter text-foreground/[0.04] text-[11rem] sm:text-[18rem] lg:text-[24rem]">
            {monogram}
          </span>
        </div>

        <Container className="relative grid items-center gap-12 py-24 lg:grid-cols-12 lg:gap-16 lg:py-32">
          <div className="flex flex-col items-start lg:col-span-7">
            {/* Mono metadata rail. */}
            <div className="flex w-full items-center gap-4">
              <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                <span
                  aria-hidden="true"
                  className="size-1.5 shrink-0 bg-primary"
                />
                {eyebrow}
              </span>
              <span aria-hidden="true" className="h-px flex-1 bg-border" />
              <span
                aria-hidden="true"
                className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70"
              >
                CV / 2026
              </span>
            </div>

            <HeroHeading className="mt-8 font-extrabold leading-[0.9] tracking-tighter text-[clamp(2.75rem,9vw,5rem)] sm:text-[clamp(2.75rem,9vw,5rem)] lg:text-[clamp(2.75rem,7vw,6rem)]">
              {name}
            </HeroHeading>

            <p className="mt-5 inline-flex items-center gap-3 font-mono text-xs font-medium uppercase tracking-[0.22em] text-foreground sm:text-sm">
              <span aria-hidden="true" className="h-3 w-0.5 bg-primary" />
              {role}
            </p>

            <HeroSubheading className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {pitch}
            </HeroSubheading>

            <HeroActions className="mt-10 w-full flex-col gap-4 sm:w-auto sm:flex-row">
              <HeroCta
                asChild
                variant="primary"
                className="justify-center rounded-none px-8 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.12em] shadow-[5px_5px_0_0] shadow-foreground transition-transform duration-150 hover:-translate-x-px hover:-translate-y-px hover:shadow-[6px_6px_0_0] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                <NavbarRouteLink href={primaryTarget}>
                  {primaryCta}
                </NavbarRouteLink>
              </HeroCta>
              <HeroCta
                asChild
                variant="outline"
                className="justify-center rounded-none border-2 border-foreground bg-background px-8 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.12em] transition-transform duration-150 hover:bg-muted active:translate-y-0.5"
              >
                <NavbarRouteLink href={secondaryTarget}>
                  {secondaryCta}
                </NavbarRouteLink>
              </HeroCta>
            </HeroActions>
          </div>

          <div className="relative lg:col-span-5">
            {/* Primary-tinted offset frame behind the plate. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 translate-x-3 translate-y-3 border-2 border-primary/30 bg-primary/5"
            />
            <HeroMediaPanel
              alt={imageAlt}
              w={720}
              h={840}
              className="relative aspect-[6/7] rounded-none border-2 border-foreground bg-muted"
            />
            <span className="absolute -bottom-3 left-4 inline-flex items-center gap-2 rounded-none border border-foreground bg-background px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground shadow-[3px_3px_0_0] shadow-primary/30">
              <span aria-hidden="true" className="size-1.5 bg-primary" />
              Portrait
            </span>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
