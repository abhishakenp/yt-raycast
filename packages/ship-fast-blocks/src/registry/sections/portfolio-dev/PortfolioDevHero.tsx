import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  HeroSection,
  HeroHeading,
  HeroSubheading,
  HeroActions,
  HeroCta,
  HeroCodeWindow,
  HeroCodeWindowHeader,
  HeroCodeWindowBody,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { DotGrid, Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
function initialsOf(name: string): string {
  const letters = name
    .split(/\s+/)
    .map((part) => part.replace(/[^A-Za-z0-9]/g, '').charAt(0))
    .filter(Boolean)
    .join('')
  return (letters || name.replace(/[^A-Za-z0-9]/g, '').slice(0, 2) || 'DEV')
    .slice(0, 3)
    .toUpperCase()
}

export const PortfolioDevHero = defineCapsule({
  name: 'PortfolioDevHero',
  description:
    'Editorial-terminal developer hero on an asymmetric 7/5 split. The left column leads with a mono `$ whoami` eyebrow carrying a blinking block cursor, then a giant extrabold clamp-scaled name signature, the role rendered as a mono metadata rule, a short intro paragraph, and dual square-cornered CTAs (a hard-offset-shadow View Work with mechanical press feedback and a hairline mono Resume) that route via section-kit route links, followed by a monospace stack-chip row. The right column is a sharp-cornered terminal/code pane with square chrome dots, a filename tab, and mono pseudo-code lines. A giant ghost watermark of the developer initials and a faint dot grid sit behind. Theme-token only with mono/terminal accents — ideal for developer, engineer, and freelancer portfolios.',
  props: z.object({
    eyebrow: z.string().optional(),
    name: z.string().optional(),
    role: z.string().optional(),
    intro: z.string().optional(),
    primaryCta: z.string().optional(),
    primaryTarget: z.string().optional(),
    secondaryCta: z.string().optional(),
    secondaryTarget: z.string().optional(),
    tags: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? '$ whoami'
    const name = props.name ?? 'Alex Chen'
    const role = props.role ?? 'Full-Stack Developer'
    const intro =
      props.intro ??
      'I design and build fast, accessible web applications end to end — from clean React frontends to reliable APIs and the infrastructure under them.'
    const primaryCta = props.primaryCta ?? 'View Work'
    const primaryTarget = props.primaryTarget ?? 'Work'
    const secondaryCta = props.secondaryCta ?? 'Resume'
    const secondaryTarget = props.secondaryTarget ?? 'Resume'
    const tags = props.tags?.length
      ? props.tags
      : ['TypeScript', 'React', 'Node.js', 'Postgres', 'AWS']
    const initials = initialsOf(name)

    return (
      <HeroSection
        variant="split"
        className={cn(
          'relative overflow-hidden bg-background py-20 text-foreground sm:py-28',
          props.className,
        )}
      >
        <DotGrid
          density="default"
          tone="faint"
          fade="bottom"
          className="inset-x-0 top-0 h-64"
        />
        <Watermark className="-bottom-16 -right-4 text-[9rem] leading-none sm:text-[15rem] lg:-bottom-24 lg:text-[22rem]">
          {initials}
        </Watermark>
        <Container className="relative grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="min-w-0 lg:col-span-7">
            <span className="inline-flex items-center gap-2 font-mono text-sm text-primary">
              {eyebrow}
              <span
                aria-hidden="true"
                className="inline-block h-4 w-2 animate-pulse bg-primary align-middle motion-reduce:animate-none"
              />
            </span>
            <HeroHeading className="mt-5 text-[clamp(2.75rem,9vw,6rem)] font-extrabold leading-[0.9] tracking-tighter">
              {name}
            </HeroHeading>
            <div className="mt-5 flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-8 bg-primary" />
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {role}
              </span>
            </div>
            <HeroSubheading className="mt-6 max-w-xl leading-8">
              {intro}
            </HeroSubheading>
            <HeroActions className="flex-col gap-3 sm:flex-row">
              <HeroCta
                asChild
                variant="primary"
                className="rounded-none px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[0.12em] shadow-[4px_4px_0_0] shadow-foreground transition-[transform,box-shadow,background-color] duration-150 hover:bg-primary/90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none"
              >
                <NavbarRouteLink href={primaryTarget}>
                  {primaryCta}
                </NavbarRouteLink>
              </HeroCta>
              <HeroCta
                asChild
                variant="outline"
                className="rounded-none border-foreground/25 px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[0.12em] transition-[background-color,transform] duration-150 hover:bg-muted active:translate-y-px motion-reduce:transform-none"
              >
                <NavbarRouteLink href={secondaryTarget}>
                  {secondaryCta}
                </NavbarRouteLink>
              </HeroCta>
            </HeroActions>
            <div className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-2">
              <span
                aria-hidden="true"
                className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
              >
                stack —
              </span>
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="border border-border bg-muted px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <HeroCodeWindow
            asChild
            className="rounded-none border-foreground/20 shadow-[8px_8px_0_0] shadow-foreground/10 lg:col-span-5"
          >
            <div>
              <HeroCodeWindowHeader className="border-border bg-muted">
                <span className="size-2.5 bg-muted-foreground/40" />
                <span className="size-2.5 bg-muted-foreground/30" />
                <span className="size-2.5 bg-muted-foreground/20" />
                <span className="ml-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  ~/alex/intro.ts
                </span>
              </HeroCodeWindowHeader>
              <HeroCodeWindowBody className="leading-relaxed">
                <p className="text-muted-foreground">
                  <span className="text-primary">const</span> dev = {'{'}
                </p>
                <p className="pl-4 text-muted-foreground">
                  name: <span className="text-accent">"Alex Chen"</span>,
                </p>
                <p className="pl-4 text-muted-foreground">
                  stack:{' '}
                  <span className="text-accent">["ts", "react", "node"]</span>,
                </p>
                <p className="pl-4 text-muted-foreground">
                  available: <span className="text-primary">true</span>,
                </p>
                <p className="text-muted-foreground">{'}'}</p>
                <p className="pt-2 text-muted-foreground">
                  <span className="text-primary">$</span> npm run build{' '}
                  <span className="text-accent">✓</span>
                </p>
              </HeroCodeWindowBody>
            </div>
          </HeroCodeWindow>
        </Container>
      </HeroSection>
    )
  },
})
