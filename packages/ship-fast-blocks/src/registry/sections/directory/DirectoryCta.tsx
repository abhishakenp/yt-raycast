import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  CtaBand,
  CtaBandInner,
  CtaBandTitle,
  CtaBandSubtitle,
  CtaAction,
} from '#/section-kit/CtaBand.tsx'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { directoryLakebed } from './directory-lakebed.ts'
import {
  DirectoryLeadButton,
  DirectoryMutationSpinner,
} from './directory-interactions.tsx'

/**
 * DirectoryCta — dark inverted conversion CTA band for a local-business
 * directory. A foreground-on-background inverted section with a large centered
 * headline, a supporting paragraph in muted inverted text, and a centered pair
 * of CTAs (a filled background-surface primary button + an outlined secondary
 * button). Both CTAs route through useNavigate. Use as the closing
 * list-your-business / sign-up conversion band on local directories,
 * marketplaces, or find-a-service platforms.
 */
export const DirectoryCta = defineCapsule({
  name: 'DirectoryCta',
  description:
    'Dark inverted conversion CTA band for a local-business DIRECTORY: a foreground-on-background inverted section with a large centered headline, a supporting paragraph in muted inverted text, and a centered pair of CTAs (a filled background-surface primary button plus an outlined secondary button). Both CTAs route through useNavigate. Use as the closing list-your-business or sign-up conversion band on local directories, business-listing marketplaces, find-a-service platforms, or review-and-discovery sites.',
  props: z.object({
    /** CTA heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: directoryLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Ready to Grow Your Business?'
    const description =
      props.description ??
      'Join 12,000+ local businesses already connecting with customers on LocalFindr. Start your free listing today.'
    const primaryCta = props.primaryCta ?? 'List Your Business Free'
    const secondaryCta = props.secondaryCta ?? 'Contact Sales'

    return (
      <CtaBand
        tone="primary"
        className={`bg-foreground text-background ${props.className ?? ''}`}
      >
        <CtaBandInner>
          <CtaBandTitle>{heading}</CtaBandTitle>
          <CtaBandSubtitle>{description}</CtaBandSubtitle>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <DirectoryLeadButton
              lakebed={lakebed}
              action={primaryCta}
              source="cta"
              pendingChildren={<DirectoryMutationSpinner />}
              className="inline-flex min-h-14 items-center justify-center rounded-lg bg-background px-8 py-4 font-medium text-foreground transition-colors hover:bg-background/90 disabled:pointer-events-none disabled:opacity-70"
            >
              {primaryCta}
            </DirectoryLeadButton>
            <CtaAction
              variant="outline"
              className="rounded-lg border-background/40 px-8 py-4 font-medium text-background hover:border-background/70"
              onClick={() => go(secondaryCta)}
            >
              {secondaryCta}
            </CtaAction>
          </div>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
