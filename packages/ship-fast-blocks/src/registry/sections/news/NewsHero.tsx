import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { HeroSection, HeroContent } from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { Watermark, MonoTag } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * NewsHero — full newspaper front-page masthead nameplate for a news outlet.
 * A committed broadsheet top band: a thin hairline top rule with the edition /
 * volume line flanking a "Late Edition" stamp, a giant centered serif
 * NAMEPLATE wordmark straddled by heavy masthead rules above and below, and a
 * dateline strip (publication date · standing motto) between them. Beneath the
 * nameplate a "The Lead" mono kicker rule opens the top story: a huge serif
 * black headline over a giant ghost masthead-letter watermark, with the
 * standfirst set as a drop-capped column against a hairline column rule. The
 * wordmark and headline route through section-kit route links. Use as the
 * front-page masthead hero for newspapers, news outlets, gazettes, dailies,
 * print-inspired publications or editorial content sites. Renders fully with
 * no props.
 */
export const NewsHero = defineCapsule({
  name: 'NewsHero',
  description:
    "Full newspaper front-page masthead nameplate for a news outlet: a thin hairline top rule with the edition / volume line flanking a 'Late Edition' stamp, a giant centered serif NAMEPLATE wordmark straddled by heavy masthead rules above and below, and a dateline strip (publication date · standing motto) between them. Beneath, a 'The Lead' mono kicker rule opens the top story — a huge serif black headline over a giant ghost masthead-letter watermark, with the standfirst set as a drop-capped column against a hairline column rule. The wordmark and headline route through section-kit route links. Use as the front-page masthead hero for newspapers, news outlets, gazettes, dailies, print-inspired publications or editorial content sites.",
  props: z.object({
    /** Masthead wordmark rendered in a prominent centered serif. */
    brand: z.string().optional(),
    /** Edition / volume line shown on the left of the date strip. */
    edition: z.string().optional(),
    /** Publication date shown in the center of the date strip. */
    date: z.string().optional(),
    /** Top headline / lead-story line beneath the wordmark. */
    headline: z.string().optional(),
    /** Short standfirst / dek under the headline. */
    dek: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'The Chronicle'
    const edition = props.edition ?? 'VOL. CXLVII · No. 12,847'
    const date = props.date ?? 'Sunday, June 22, 2026'
    const headline =
      props.headline ?? 'A New Era of Independent Reporting Begins Today'
    const dek =
      props.dek ??
      'After months in the making, our newsroom opens its doors to readers everywhere — independent, ad-free, and accountable only to the public it serves.'

    return (
      <HeroSection
        aria-labelledby="news-hero-heading"
        variant="default"
        className={cn(
          'relative overflow-hidden bg-background pt-24 lg:pt-28',
          props.className,
        )}
      >
        <Container asChild size="xl" className="relative pb-12 lg:pb-16">
          <HeroContent>
            {/* Flank line: edition left · Late Edition right, on a hairline. */}
            <div className="flex items-center justify-between border-t border-border pt-2">
              <MonoTag className="text-[10px]">{edition}</MonoTag>
              <MonoTag tone="faint" className="text-[10px]">
                Late Edition
              </MonoTag>
            </div>

            {/* Nameplate straddled by heavy masthead rules. */}
            <div className="mt-2 border-y-2 border-foreground py-6 text-center sm:py-8">
              <NavbarRouteLink
                className="block font-serif text-5xl font-black leading-none tracking-tight text-foreground transition-colors hover:text-foreground/80 sm:text-7xl lg:text-8xl"
                href={brand}
              >
                {brand}
              </NavbarRouteLink>
            </div>

            {/* Dateline strip: date · standing motto. */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-b border-border pb-2 text-center">
              <time className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground">
                {date}
              </time>
              <span aria-hidden="true" className="text-muted-foreground/40">
                ·
              </span>
              <MonoTag tone="faint" className="text-[10px]">
                Independent since 1923
              </MonoTag>
            </div>

            {/* Lead story over a giant ghost masthead-letter watermark. */}
            <div className="relative mt-10 sm:mt-12">
              <Watermark className="-top-10 right-[6%] font-serif text-[13rem] font-black leading-none text-foreground/[0.05] sm:text-[18rem] lg:-top-16 lg:text-[24rem]">
                {brand.charAt(0)}
              </Watermark>

              <div className="relative mx-auto flex max-w-3xl items-center gap-4">
                <span
                  aria-hidden="true"
                  className="h-px flex-1 bg-foreground/30"
                />
                <MonoTag tone="primary" className="shrink-0">
                  The Lead
                </MonoTag>
                <span
                  aria-hidden="true"
                  className="h-px flex-1 bg-foreground/30"
                />
              </div>

              <NavbarRouteLink
                className="group mt-6 block w-full"
                href={headline}
              >
                <h1
                  id="news-hero-heading"
                  className="mx-auto max-w-4xl text-center font-serif text-[clamp(2.2rem,4.5vw+0.5rem,4.25rem)] font-black leading-[1.03] tracking-tight text-foreground transition-colors group-hover:text-foreground/80"
                >
                  {headline}
                </h1>
              </NavbarRouteLink>

              <p className="mx-auto mt-7 max-w-2xl border-l-2 border-foreground/25 pl-5 font-serif text-lg italic leading-relaxed text-muted-foreground first-letter:float-left first-letter:mr-2.5 first-letter:font-serif first-letter:text-6xl first-letter:font-black first-letter:not-italic first-letter:leading-[0.8] first-letter:text-foreground sm:text-xl">
                {dek}
              </p>
            </div>
          </HeroContent>
        </Container>
      </HeroSection>
    )
  },
})
