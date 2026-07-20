import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { HeroSection, HeroContent } from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { useSyncPublicationArticles } from '../blog/publication-interactions.tsx'
import { publicationLakebed } from '../blog/publication-lakebed.ts'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * NewsroomHero — full newsprint front-page hero for a digital newsroom /
 * magazine. A print-set front page: a hairline edition rule with mono "front
 * page" metadata, then an asymmetric 8/4 grid. The lead well carries a mono
 * category kicker, a huge serif display headline, a drop-capped standfirst, a
 * hairline-ruled byline ("By NAME" + role) with a mono dateline and read-time,
 * a wide grayscale lead photograph with an italic "Fig." caption, and a
 * hard-offset "Read the full story" CTA. A column-ruled right rail runs the
 * "Also in the news" secondary headlines as index-numbered ledger rows (mono
 * tag + serif title) split by hairlines, over a giant ghost watermark. The CTA
 * routes through section-kit route links. Use as the masthead / front-page hero
 * for online newspapers, digital magazines, longform publications,
 * investigative outlets or editorial content sites. Renders fully with no props.
 */
export const NewsroomHero = defineCapsule({
  name: 'NewsroomHero',
  description:
    "Full newsprint front-page hero for a digital newsroom / magazine: a hairline edition rule with mono front-page metadata over an asymmetric 8/4 grid. The lead well carries a mono category kicker, a huge serif display headline, a drop-capped standfirst, a hairline-ruled byline ('By NAME' + role) with a mono dateline and read time, a wide grayscale lead photograph with an italic 'Fig.' caption and a hard-offset 'Read the full story' CTA; a column-ruled right rail runs the 'Also in the news' secondary headlines as index-numbered ledger rows (mono tag + serif title) split by hairlines over a giant ghost watermark. The CTA routes through section-kit route links. Use as the masthead / front-page hero for online newspapers, digital magazines, longform publications, investigative outlets or editorial content sites.",
  props: z.object({
    /** Small uppercase category label above the headline (e.g. "INVESTIGATION"). */
    kicker: z.string().optional(),
    /** Huge serif lead headline. */
    headline: z.string().optional(),
    /** Standfirst / dek paragraph summarizing the lead story. */
    dek: z.string().optional(),
    /** Byline author: name, role and avatar alt text. */
    author: z
      .object({
        name: z.string().optional(),
        role: z.string().optional(),
        avatarAlt: z.string().optional(),
      })
      .optional(),
    /** Publication date for the lead story. */
    date: z.string().optional(),
    /** Estimated read time for the lead story. */
    readTime: z.string().optional(),
    /** Alt text driving the wide lead photograph. */
    imageAlt: z.string().optional(),
    /** Small italic caption under the lead photograph. */
    caption: z.string().optional(),
    /** Call-to-action label routing to the full story. */
    cta: z.string().optional(),
    /** Secondary "also in the news" rail: small tag + headline title. */
    sideStories: z
      .array(
        z.object({
          tag: z.string().optional(),
          title: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: publicationLakebed,
  component: ({ props, lakebed }) => {
    const kicker = props.kicker ?? 'Investigation'
    const headline =
      props.headline ??
      "Inside the quiet collapse of the city's last public water board"
    const dek =
      props.dek ??
      'For a decade, residents were told the taps were safe. A six-month investigation into leaked memos, redacted reports and a vanishing budget reveals how oversight failed an entire district — and who knew.'
    const author = {
      name: props.author?.name ?? 'Mara Delacroix',
      role: props.author?.role ?? 'Senior Investigations Editor',
      avatarAlt:
        props.author?.avatarAlt ??
        'portrait headshot of a female investigative journalist',
    }
    const date = props.date ?? 'June 22, 2026'
    const readTime = props.readTime ?? '14 min read'
    const imageAlt =
      props.imageAlt ??
      'documentary photograph of an aging municipal water treatment facility at dusk'
    const caption =
      props.caption ??
      'The Eastside treatment plant, decommissioned without public notice in 2021. Photograph by the newsroom.'
    const cta = props.cta ?? 'Read the full story'
    const sideStories = props.sideStories ?? [
      {
        tag: 'Politics',
        title: 'Council moves to freeze rates ahead of contested vote',
      },
      {
        tag: 'Climate',
        title: 'Heat records fall again as the grid strains under demand',
      },
      {
        tag: 'Culture',
        title: "The novelists quietly rewriting the city's memory",
      },
      {
        tag: 'Business',
        title: 'A family bakery, a rent hike, and the fight to stay open',
      },
    ]
    useSyncPublicationArticles(lakebed, [
      {
        author: author.name,
        category: kicker,
        date,
        excerpt: dek,
        target: cta,
        title: headline,
      },
      ...sideStories.map((story) => ({
        category: story.tag,
        target: story.title,
        title: story.title ?? '',
      })),
    ])

    return (
      <HeroSection
        aria-labelledby="newsroom-hero-heading"
        variant="default"
        className={cn('bg-background', props.className)}
      >
        <Container asChild size="xl" className="py-12 lg:py-16">
          <HeroContent>
            {/* Edition rule */}
            <div className="flex items-center justify-between border-y-2 border-foreground py-2">
              <MonoTag tone="muted">The Front Page</MonoTag>
              <MonoTag tone="faint" className="hidden sm:inline">
                Vol. CLXXIV · No. 21,904
              </MonoTag>
            </div>

            <div className="grid gap-10 pt-10 lg:grid-cols-12 lg:gap-0">
              {/* Lead story well */}
              <article className="lg:col-span-8 lg:pr-12">
                <div className="mb-5 flex items-center gap-3">
                  <span className="h-px w-8 bg-primary" aria-hidden="true" />
                  <MonoTag tone="primary">{kicker}</MonoTag>
                </div>
                <h1
                  id="newsroom-hero-heading"
                  className="mb-6 font-serif text-4xl font-bold leading-[1.02] tracking-tight text-balance text-foreground sm:text-5xl lg:text-6xl"
                >
                  {headline}
                </h1>
                <p className="mb-8 max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-serif first-letter:text-6xl first-letter:font-bold first-letter:leading-[0.7] first-letter:text-foreground sm:text-xl">
                  {dek}
                </p>

                {/* Byline */}
                <div className="mb-8 flex items-center gap-3 border-y border-border py-4">
                  <Image
                    alt={author.avatarAlt}
                    w={80}
                    h={80}
                    className="size-10 rounded-full object-cover grayscale"
                  />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">
                      By {author.name}
                    </p>
                    <p className="text-muted-foreground">{author.role}</p>
                  </div>
                  <div className="ml-auto text-right font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                    <p>{date}</p>
                    <p>{readTime}</p>
                  </div>
                </div>

                {/* Lead image */}
                <figure className="mb-6">
                  <Image
                    alt={imageAlt}
                    w={1600}
                    h={900}
                    loading="eager"
                    className="aspect-[16/9] w-full border border-border object-cover grayscale"
                  />
                  <figcaption className="mt-3 border-l-2 border-border pl-3 font-serif text-sm italic text-muted-foreground">
                    <span className="font-mono text-[11px] not-italic uppercase tracking-[0.14em] text-foreground">
                      Fig.&nbsp;1&nbsp;—&nbsp;
                    </span>
                    {caption}
                  </figcaption>
                </figure>

                <NavbarRouteLink
                  className="inline-flex items-center rounded-none bg-foreground px-6 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-background shadow-[5px_5px_0_0] shadow-foreground/20 transition-transform hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                  href={cta}
                >
                  {cta}
                </NavbarRouteLink>
              </article>

              {/* Also in the news rail */}
              <aside className="relative overflow-hidden lg:col-span-4 lg:border-l lg:border-border lg:pl-10">
                <Watermark className="-top-6 right-0 hidden text-[9rem] lg:block">
                  §
                </Watermark>
                <h2 className="relative mb-2 border-b-2 border-foreground pb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground">
                  Also in the news
                </h2>
                <ul className="relative divide-y divide-border">
                  {sideStories.map((story, i) => (
                    <li key={i} className="py-4">
                      <NavbarRouteLink
                        className="group flex w-full gap-3 text-left"
                        href={story.title ?? ''}
                      >
                        <span
                          aria-hidden="true"
                          className="mt-0.5 shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground"
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="min-w-0">
                          <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
                            {story.tag}
                          </span>
                          <span className="block font-serif text-lg font-medium leading-snug text-foreground transition-colors group-hover:text-muted-foreground">
                            {story.title}
                          </span>
                        </span>
                      </NavbarRouteLink>
                    </li>
                  ))}
                </ul>
              </aside>
            </div>
          </HeroContent>
        </Container>
      </HeroSection>
    )
  },
})
