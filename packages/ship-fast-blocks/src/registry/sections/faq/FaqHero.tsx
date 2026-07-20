import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { HeroSection, HeroContent } from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { Watermark, MonoTag } from '#/section-kit/Decor.tsx'
import {
  SearchForm,
  SearchField,
  SearchFieldIcon,
  SearchFieldInput,
  SearchFieldHint,
  SearchSubmit,
} from '#/section-kit/SearchForm.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * FaqHero — editorial "Editorial Q&A" search hero for a help-center / FAQ /
 * knowledge-base page. A giant faint ghost "?" watermark bleeds off the right edge
 * behind a mono metadata rail ("[ FAQ ] —— 001 / HELP CENTER") with a hairline rule,
 * an oversized tight-tracked left-aligned heading balanced against a mono meta column
 * on the right, a supporting lead, then a full-width square (rounded-none) hairline
 * search field with a leading magnifier icon and a square Search submit, and a mono
 * "POPULAR" strip of square keyword chips below. Submitting the search and tapping
 * chips route through section-kit route links. Use as the top search section for SaaS
 * knowledge bases, help centers, documentation landings, or support pages. Renders
 * fully with no props.
 */
export const FaqHero = defineCapsule({
  name: 'FaqHero',
  description:
    "Editorial 'Editorial Q&A' search hero for a help-center / FAQ / knowledge-base page: a giant faint ghost '?' watermark bleeding off the right edge behind a mono metadata rail ('[ FAQ ] — 001 / HELP CENTER') with a hairline rule, an oversized tight-tracked left-aligned heading balanced against a mono meta column, a supporting lead, a full-width square (rounded-none) hairline search field with a leading magnifier icon and a square Search submit, and a mono 'POPULAR' strip of square keyword chips. Search submit and chip taps route through section-kit route links. Use as the top search section for SaaS knowledge bases, help centers, documentation landings, or support pages.",
  props: z.object({
    /** Hero heading. */
    heading: z.string().optional(),
    /** Supporting lead paragraph. */
    subheading: z.string().optional(),
    /** Search input placeholder. */
    searchPlaceholder: z.string().optional(),
    /** Label preceding the popular keyword chips. */
    popularLabel: z.string().optional(),
    /** Popular keyword chips below the search field. */
    popular: z.array(z.string()).optional(),
    /** Route target for search submit. */
    searchTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'How can we help you?'
    const subheading =
      props.subheading ??
      'Search our knowledge base or browse topics to find answers about FlowSync features, billing, and integrations.'
    const searchPlaceholder =
      props.searchPlaceholder ?? 'Search for articles, topics, or keywords...'
    const popularLabel = props.popularLabel ?? 'Popular:'
    const popular = props.popular?.length
      ? props.popular
      : ['Getting Started', 'Billing', 'API Keys', 'SSO Setup']
    const searchTarget = props.searchTarget ?? 'Documentation'

    return (
      <HeroSection
        variant="default"
        className={cn(
          'relative overflow-hidden border-b border-border bg-background',
          props.className,
        )}
      >
        {/* Giant ghost "?" watermark — the category's signature mark. */}
        <Watermark className="-right-6 top-1/2 -translate-y-1/2 font-serif text-[16rem] leading-none sm:text-[22rem] lg:-right-10 lg:text-[30rem]">
          ?
        </Watermark>

        <Container
          asChild
          size="lg"
          className="relative py-16 sm:py-20 lg:py-24"
        >
          <HeroContent>
            {/* Mono metadata rail: label — hairline rule — index. */}
            <div className="flex items-center gap-4">
              <MonoTag className="shrink-0 tracking-[0.24em]">[ FAQ ]</MonoTag>
              <span aria-hidden="true" className="h-px flex-1 bg-border" />
              <MonoTag tone="faint" className="shrink-0">
                001 / Help Center
              </MonoTag>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-12 md:items-end md:gap-10">
              <h1 className="text-balance text-4xl font-extrabold leading-[0.95] tracking-tighter text-foreground sm:text-6xl lg:text-7xl md:col-span-8">
                {heading}
              </h1>
              <p className="text-pretty text-base leading-relaxed text-muted-foreground md:col-span-4 md:border-l md:border-border md:pl-6">
                {subheading}
              </p>
            </div>

            <SearchForm className="mt-10">
              <SearchField>
                <SearchFieldIcon>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </SearchFieldIcon>
                <SearchFieldInput
                  type="search"
                  placeholder={searchPlaceholder}
                  aria-label="Search help articles"
                  className="rounded-none border-foreground/20 py-5 pr-32 text-base shadow-none focus:border-foreground focus:ring-0"
                />
                <SearchFieldHint className="pr-2">
                  <SearchSubmit
                    asChild
                    className="rounded-none px-4 py-2.5 text-xs font-medium uppercase tracking-[0.12em] transition-all duration-150 active:translate-y-px"
                  >
                    <NavbarRouteLink href={searchTarget}>
                      Search
                    </NavbarRouteLink>
                  </SearchSubmit>
                </SearchFieldHint>
              </SearchField>
            </SearchForm>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <MonoTag tone="faint" className="mr-1">
                {popularLabel}
              </MonoTag>
              {popular.map((chip) => (
                <NavbarRouteLink
                  key={chip}
                  className="inline-flex items-center rounded-none border border-border px-3 py-1 text-sm font-medium text-foreground transition-colors hover:border-foreground hover:bg-muted"
                  href={chip}
                >
                  {chip}
                </NavbarRouteLink>
              ))}
            </div>
          </HeroContent>
        </Container>
      </HeroSection>
    )
  },
})
