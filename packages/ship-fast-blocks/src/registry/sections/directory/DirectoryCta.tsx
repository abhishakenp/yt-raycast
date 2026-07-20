import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  CtaBand,
  CtaBandInner,
  CtaBandTitle,
  CtaBandSubtitle,
  CtaAction,
} from '#/section-kit/CtaBand.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { directoryLakebed } from './directory-lakebed.ts'
import {
  DirectoryLeadButton,
  DirectoryMutationSpinner,
} from './directory-interactions.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * DirectoryCta — newsprint "full-page ad" conversion band for a local-business
 * directory. A paper band holding a heavy-bordered ad box with a hard offset
 * shadow: a mono "Advertisement" rule row on top, a large centered serif
 * headline, a supporting paragraph, and a centered pair of square CTAs (a
 * filled foreground-on-background primary button + a hairline outlined
 * secondary button), both with press feedback. The primary CTA records a real
 * Lakebed lead; the secondary routes through section-kit route links. Use as
 * the closing list-your-business / sign-up conversion band on local
 * directories, marketplaces, or find-a-service platforms.
 */
export const DirectoryCta = defineCapsule({
  name: 'DirectoryCta',
  description:
    'Newsprint full-page-ad conversion band for a local-business DIRECTORY: a paper band holding a heavy-bordered ad box with a hard offset shadow — a mono Advertisement rule row on top, a large centered serif headline, a supporting paragraph, and a centered pair of square CTAs (a filled foreground-on-background primary button plus a hairline outlined secondary button), both with press feedback. The primary CTA records a real Lakebed lead; the secondary routes through section-kit route links. Use as the closing list-your-business or sign-up conversion band on local directories, business-listing marketplaces, find-a-service platforms, or review-and-discovery sites.',
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
    const heading = props.heading ?? 'Ready to Grow Your Business?'
    const description =
      props.description ??
      'Join 12,000+ local businesses already connecting with customers on LocalFindr. Start your free listing today.'
    const primaryCta = props.primaryCta ?? 'List Your Business Free'
    const secondaryCta = props.secondaryCta ?? 'Contact Sales'

    return (
      <CtaBand
        tone="muted"
        className={`bg-background px-4 py-16 text-foreground sm:px-6 lg:py-24 ${props.className ?? ''}`}
      >
        <CtaBandInner className="max-w-3xl gap-5 border-2 border-foreground bg-background px-6 py-12 shadow-[8px_8px_0_0] shadow-foreground/80 sm:px-10 lg:py-14">
          <div
            aria-hidden="true"
            className="flex w-full items-center gap-3 border-b border-border pb-4"
          >
            <MonoTag tone="faint" className="shrink-0">
              Advertisement
            </MonoTag>
            <span className="h-px flex-1 bg-border" />
            <MonoTag tone="faint" className="shrink-0 tabular-nums">
              Full page
            </MonoTag>
          </div>
          <CtaBandTitle className="font-serif text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {heading}
          </CtaBandTitle>
          <CtaBandSubtitle className="text-muted-foreground opacity-100">
            {description}
          </CtaBandSubtitle>
          <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row sm:gap-4">
            <DirectoryLeadButton
              lakebed={lakebed}
              action={primaryCta}
              source="cta"
              pendingChildren={<DirectoryMutationSpinner />}
              className="inline-flex min-h-12 items-center justify-center rounded-none bg-foreground px-8 font-medium text-background transition-[background-color,transform] hover:bg-foreground/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
            >
              {primaryCta}
            </DirectoryLeadButton>
            <CtaAction
              variant="outline"
              className="min-h-12 rounded-none border-foreground bg-transparent px-8 font-medium text-foreground transition-[background-color,color,transform] hover:bg-foreground hover:text-background active:translate-y-px"
              asChild
            >
              <NavbarRouteLink href={secondaryCta}>
                {secondaryCta}
              </NavbarRouteLink>
            </CtaAction>
          </div>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
