import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { newsletterLakebed } from '../newsletter/newsletter-lakebed.ts'
import { NewsletterSubscribeForm } from '../newsletter/newsletter-interactions.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { NewsletterCtaFineprint } from '#/section-kit/NewsletterCta.tsx'
import { SubscribeBand } from '#/section-kit/SubscribeBand.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * FurnitureStoreNewsletter — an editorial newsletter subscribe CTA on a soft
 * muted band over a giant faint ghost watermark. A narrow centered column with a
 * mono "[ NEWSLETTER ]" micro-label, a heading + description, an inline email
 * form (screen-reader-only label, square rounded-none submit button with press
 * feedback, stacks on mobile), a mono fine-print note, and a centered row of
 * square hairline social icon buttons. The form submit and each social route
 * through section-kit route links; baked-in Instagram / Pinterest / Facebook
 * glyphs are matched by name, with any unknown social rendered as its text
 * label. Use as a closing email-capture / follow-us CTA for furniture,
 * home-decor, or any retail brand. Renders fully with no props via baked-in
 * "Haven & Home" defaults.
 */
export const FurnitureStoreNewsletter = defineCapsule({
  name: 'FurnitureStoreNewsletter',
  description:
    'Editorial newsletter subscribe CTA on a soft muted band over a giant faint ghost watermark: a narrow centered column with a mono "[ NEWSLETTER ]" micro-label, a heading + description, an inline email form (screen-reader-only label, square rounded-none submit button with press feedback, stacks on mobile), a mono fine-print note, and a centered row of square hairline social icon buttons; form submit writes to the shared Lakebed subscriber list and socials route through section-kit route links, with baked-in Instagram / Pinterest / Facebook glyphs matched by name and unknown socials shown as text. Use as a closing email-capture / follow-us CTA for furniture, home-decor, or any retail brand.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    placeholder: z.string().optional(),
    submit: z.string().optional(),
    note: z.string().optional(),
    socials: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  lakebed: newsletterLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Join the Haven & Home family'
    const description =
      props.description ??
      'Subscribe for exclusive offers, early access to new collections, and design inspiration delivered to your inbox.'
    const placeholder = props.placeholder ?? 'Enter your email'
    const submit = props.submit ?? 'Subscribe'
    const note =
      props.note ??
      'Join 45,000+ subscribers. Unsubscribe anytime. No spam, ever.'
    const socials = props.socials?.length
      ? props.socials
      : ['Instagram', 'Pinterest', 'Facebook']

    const socialIcons: Record<string, ReactNode> = {
      Instagram: (
        <svg
          className="size-6"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
      Pinterest: (
        <svg
          className="size-6"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
        </svg>
      ),
      Facebook: (
        <svg
          className="size-6"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    }

    return (
      <SubscribeBand
        variant="muted"
        className={cn(
          'relative overflow-hidden py-16 lg:py-24',
          props.className,
        )}
        aria-labelledby="furniture-newsletter-heading"
      >
        {/* Giant faint ghost watermark for editorial gravitas. */}
        <Watermark className="-bottom-10 left-1/2 -translate-x-1/2 text-[9rem] leading-none sm:text-[13rem]">
          &amp;
        </Watermark>
        <Container size="sm" className="relative text-center">
          <MonoTag className="mb-6 inline-block tracking-[0.2em]">
            [ Newsletter ]
          </MonoTag>
          <SectionHeading
            title={heading}
            subtitle={description}
            align="center"
            titleId="furniture-newsletter-heading"
            titleClassName="text-3xl font-medium tracking-tight lg:text-4xl"
            subtitleClassName="text-lg"
            className="mb-8 gap-6"
          />

          <NewsletterSubscribeForm
            lakebed={lakebed}
            source={submit}
            placeholder={placeholder}
            buttonLabel={submit}
            successMessage="You're subscribed. New room edits and early access will arrive by email."
            className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
            inputClassName="flex-1 rounded-none border border-input bg-background px-4 py-3 text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
            buttonClassName="rounded-none bg-foreground px-6 py-3 font-medium text-background transition-[background-color,transform] duration-150 hover:bg-foreground/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70 motion-reduce:active:translate-y-0"
          />

          <NewsletterCtaFineprint className="mt-4 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {note}
          </NewsletterCtaFineprint>

          <div className="mt-8 flex justify-center gap-3">
            {socials.map((social) => (
              <NavbarRouteLink
                key={social}
                className="grid size-10 place-items-center rounded-none border border-border text-muted-foreground transition-[color,background-color,transform] duration-150 hover:bg-background hover:text-foreground active:scale-95 motion-reduce:active:scale-100"
                aria-label={social}
                href={social}
              >
                {socialIcons[social] ?? (
                  <span className="text-sm font-medium">{social}</span>
                )}
              </NavbarRouteLink>
            ))}
          </div>
        </Container>
      </SubscribeBand>
    )
  },
})
