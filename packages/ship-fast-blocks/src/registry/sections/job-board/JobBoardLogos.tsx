import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
/**
 * JobBoardLogos — a newsprint "trusted by" masthead strip for a job-board /
 * careers site. A hairline-bordered paper band with a mono uppercase eyebrow on
 * the left and a hairline-divided row of wordmark company names rendered as mono
 * muted text that brighten on hover; each routes through section-kit route links.
 * Use directly below a hero to establish credibility on job boards, hiring
 * marketplaces, recruiting platforms or any marketing page that wants a logo
 * cloud. Renders fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  LogoStrip,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

export const JobBoardLogos = defineCapsule({
  name: 'JobBoardLogos',
  description:
    "Newsprint 'trusted by' masthead strip for a job-board / careers site: a hairline-bordered paper band with a mono uppercase eyebrow on the left and a hairline-divided row of wordmark company names rendered as mono muted text that brighten on hover; each routes through section-kit route links. Use directly below a hero to establish credibility on job boards, hiring marketplaces, recruiting platforms or any marketing page that wants a logo cloud.",
  props: z.object({
    /** Eyebrow heading above the logo grid. */
    heading: z.string().optional(),
    /** Company wordmark labels. */
    companies: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Trusted by leading companies worldwide'
    const companies = props.companies?.length
      ? props.companies
      : ['Stripe', 'Notion', 'Figma', 'Shopify', 'Webflow', 'Linear']
    return (
      <LogoStrip
        className={cn(
          'border-b border-border bg-muted/40 py-10',
          props.className,
        )}
      >
        <Container className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-10">
          <MonoTag tone="faint" className="shrink-0">
            {heading}
          </MonoTag>
          <LogoStripItems
            layout="flex"
            className="flex-1 justify-start gap-x-0 gap-y-3 divide-x divide-border"
          >
            {companies.filter(Boolean).map((logo) => (
              <LogoStripItem
                key={logo}
                variant="opacity-hover"
                asChild
                className="px-5 font-mono text-sm font-semibold uppercase tracking-[0.08em] first:pl-0"
              >
                <NavbarRouteLink href={logo}>{logo}</NavbarRouteLink>
              </LogoStripItem>
            ))}
          </LogoStripItems>
        </Container>
      </LogoStrip>
    )
  },
})
