import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import {
  HeroSection,
  HeroHeading,
  HeroHighlight,
  HeroSubheading,
  HeroCtas,
} from '#/section-kit/HeroSection.tsx'
import { Card } from '#/section-kit/Card.tsx'

export const PortfolioDevHero = defineCapsule({
  name: 'PortfolioDevHero',
  description:
    'A split developer-intro hero. The left column leads with a mono `$ whoami` eyebrow, a large name plus a Full-Stack Developer headline, a short intro paragraph, and dual CTAs (a filled View Work and an outlined Resume) that route via useNavigate, followed by a mono tech-tag row. The right column is a faux terminal/code card with window-chrome dots, a filename, and mono pseudo-code lines. Everything is theme-token only with mono accents — ideal for developer, engineer, and freelancer portfolios.',
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
    const go = useNavigate()
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
    return (
      <HeroSection
        className={cn(
          'bg-background py-20 text-foreground sm:py-28',
          props.className,
        )}
      >
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <span className="font-mono text-sm text-primary">{eyebrow}</span>
            <HeroHeading className="mt-4">
              {name}
              <br />
              <HeroHighlight className="text-muted-foreground">
                {role}
              </HeroHighlight>
            </HeroHeading>
            <HeroSubheading className="max-w-xl leading-8">
              {intro}
            </HeroSubheading>
            <HeroCtas className="flex-col gap-3 sm:flex-row">
              <button
                onClick={() => go(primaryTarget)}
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                {primaryCta}
              </button>
              <button
                onClick={() => go(secondaryTarget)}
                className="inline-flex items-center justify-center rounded-md border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
              >
                {secondaryCta}
              </button>
            </HeroCtas>
            <div className="mt-8 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-border bg-muted px-3 py-1 font-mono text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <Card
            variant="default"
            rounded="xl"
            padding="none"
            shadow="sm"
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-3">
              <span className="size-3 rounded-full bg-muted-foreground/40" />
              <span className="size-3 rounded-full bg-muted-foreground/30" />
              <span className="size-3 rounded-full bg-muted-foreground/20" />
              <span className="ml-2 font-mono text-xs text-muted-foreground">
                ~/alex/intro.ts
              </span>
            </div>
            <div className="space-y-2 p-5 font-mono text-sm">
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
            </div>
          </Card>
        </div>
      </HeroSection>
    )
  },
})
