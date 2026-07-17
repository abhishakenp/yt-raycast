import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { HeroSection, HeroContent } from '#/section-kit/HeroSection.tsx'
import { useSyncPublicationArticles } from '../blog/publication-interactions.tsx'
import { publicationLakebed } from '../blog/publication-lakebed.ts'

/**
 * NewsroomHero — front-page lead-story hero for a digital newsroom / magazine.
 * An editorial, print-inspired layout: a small uppercase category kicker, a
 * huge serif display headline, a standfirst/dek paragraph, a byline (author
 * avatar + name + role) carrying date and read-time, a wide lead photograph
 * with a small italic caption and a "Read the full story" call to action,
 * beside a slim right-hand rail of secondary "also in the news" headlines
 * (small tag + title) separated by hairline rules. Magazine feel with serif
 * display type, muted contrast and generous whitespace. The CTA routes through
 * useNavigate. Use as the masthead / front-page hero for online newspapers,
 * digital magazines, longform publications, investigative outlets or editorial
 * content sites. Renders fully with no props.
 */
export const NewsroomHero = defineCapsule({
  name: 'NewsroomHero',
  description:
    "Front-page lead-story hero for a digital newsroom / magazine: a small uppercase category kicker, a huge serif display headline, a standfirst/dek paragraph, a byline (author avatar + name + role) carrying date and read time, a wide lead photograph with a small italic caption and a 'Read the full story' CTA, beside a slim right-hand rail of secondary 'also in the news' headlines (small tag + title) separated by hairline rules. Editorial, print-inspired magazine aesthetic with serif display type, muted contrast and generous whitespace. The CTA routes through useNavigate. Use as the masthead / front-page hero for online newspapers, digital magazines, longform publications, investigative outlets or editorial content sites.",
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
    const go = useNavigate()
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
        <HeroContent className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-3 lg:gap-16">
            {/* Lead story */}
            <article className="lg:col-span-2">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                {kicker}
              </p>
              <h1
                id="newsroom-hero-heading"
                className="mb-6 font-serif text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
              >
                {headline}
              </h1>
              <p className="mb-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                {dek}
              </p>

              {/* Byline */}
              <div className="mb-8 flex items-center gap-3 border-y border-border py-4">
                <Image
                  alt={author.avatarAlt}
                  w={80}
                  h={80}
                  className="size-10 rounded-full object-cover"
                />
                <div className="text-sm">
                  <p className="font-semibold text-foreground">{author.name}</p>
                  <p className="text-muted-foreground">{author.role}</p>
                </div>
                <div className="ml-auto text-right text-xs text-muted-foreground">
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
                  className="aspect-[16/9] w-full object-cover"
                />
                <figcaption className="mt-3 font-serif text-sm italic text-muted-foreground">
                  {caption}
                </figcaption>
              </figure>

              <button
                type="button"
                onClick={() => go(cta)}
                className="inline-flex items-center bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {cta}
              </button>
            </article>

            {/* Also in the news rail */}
            <aside className="lg:border-l lg:border-border lg:pl-12">
              <h2 className="mb-6 border-b border-border pb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Also in the news
              </h2>
              <ul className="divide-y divide-border">
                {sideStories.map((story, i) => (
                  <li key={i} className="py-4 first:pt-0">
                    <button
                      type="button"
                      onClick={() => go(story.title ?? '')}
                      className="group block w-full text-left"
                    >
                      <span className="mb-1 block text-xs font-semibold uppercase tracking-widest text-accent">
                        {story.tag}
                      </span>
                      <span className="block font-serif text-lg font-medium leading-snug text-foreground transition-colors group-hover:text-muted-foreground">
                        {story.title}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </HeroContent>
      </HeroSection>
    )
  },
})
