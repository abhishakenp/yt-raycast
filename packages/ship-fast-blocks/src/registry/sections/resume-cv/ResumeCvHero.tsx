import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

/**
 * ResumeCvHero — clean two-column opening hero for a personal resume / CV /
 * portfolio site. The left column stacks an availability eyebrow, the person's
 * name in a large sans headline, their role / title, a short pitch paragraph,
 * and dual CTAs (filled "Download CV" + outlined "Contact"); the right column
 * holds a rounded professional headshot photo. Token surfaces, crisp spacing,
 * and a minimal, professional feel. Both CTAs route through useNavigate. Use as
 * the opening hero for personal portfolios, online résumés, designer/developer
 * profiles, or any individual's professional landing page. Renders fully with
 * no props via baked-in "Jordan Avery" defaults.
 */
export const ResumeCvHero = defineComponent({
  name: 'ResumeCvHero',
  description:
    "Clean two-column opening hero for a personal resume / CV / portfolio site: the left column stacks an availability eyebrow, the person's name in a large sans headline, their role / title, a short pitch paragraph, and dual CTAs (filled 'Download CV' + outlined 'Contact'); the right column holds a rounded professional headshot photo. Token surfaces, crisp spacing, minimal professional feel. Both CTAs route through useNavigate. Use as the opening hero for personal portfolios, online résumés, designer or developer profiles, or any individual's professional landing page.",
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
    const go = useNavigate()
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

    return (
      <section className={cn('bg-background', props.className)}>
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-24 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-32">
          <div className="flex flex-col items-start">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-primary"
              />
              {eyebrow}
            </span>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {name}
            </h1>

            <p className="mt-3 text-lg font-medium text-primary sm:text-xl">
              {role}
            </p>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {pitch}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                onClick={() => go(primaryTarget)}
                className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {primaryCta}
              </button>
              <button
                type="button"
                onClick={() => go(secondaryTarget)}
                className="inline-flex items-center justify-center rounded-full border border-border bg-background px-8 py-3.5 font-medium text-foreground transition-colors hover:bg-muted"
              >
                {secondaryCta}
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-2xl border border-border bg-muted">
              <Image
                alt={imageAlt}
                w={720}
                h={840}
                loading="lazy"
                className="aspect-[6/7] size-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    )
  },
})
