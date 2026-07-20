import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import {
  SiteFooter,
  FooterGrid,
  FooterBrand,
  FooterTagline,
  FooterSocial,
  FooterSocialLink,
  FooterColumn,
  FooterColumnTitle,
  FooterColumnList,
  FooterLink,
  FooterBottom,
  FooterCopyright,
  FooterLegal,
} from '#/section-kit/SiteFooter.tsx'
/**
 * InteriorDesignFooter — editorial-spatial closing footer for an upscale
 * interior-design / architecture studio. A hairline-topped band with a giant
 * ghost brand watermark bleeding off the bottom edge: an asymmetric 12-column
 * grid pairs a wide brand block (wordmark + about paragraph + square mono social
 * chips with hard hover borders) with two mono-labeled link columns (services,
 * company); below, a hairline-divided bottom bar carries the auto-updating
 * copyright, mono legal links and a decorative mono studio tag. Refined, gallery-
 * like, binary radius; the brand, socials and every link route through
 * section-kit route links. Use as the closing site footer for interior designers,
 * design studios, architecture firms or renovation businesses. Renders fully with
 * no props via baked-in "Atelier Studio" defaults.
 */
export const InteriorDesignFooter = defineCapsule({
  name: 'InteriorDesignFooter',
  description:
    'Editorial-spatial closing footer for an upscale interior-design / architecture studio: a hairline-topped band with a giant ghost brand watermark bleeding off the bottom edge, an asymmetric 12-column grid pairing a wide brand block (wordmark + about paragraph + square mono social chips) with two mono-labeled link columns (services, company), and a hairline-divided bottom bar with auto-updating copyright, mono legal links and a decorative mono studio tag. Refined, gallery-like, binary radius; the brand, socials and every link route through section-kit route links. Use as the closing site footer for interior designers, design studios, architecture firms or renovation businesses.',
  props: z.object({
    /** Brand / studio name; split into bold mark + faded suffix on a space. */
    brand: z.string().optional(),
    about: z.string().optional(),
    socials: z.array(z.string()).optional(),
    servicesTitle: z.string().optional(),
    servicesLinks: z.array(z.string()).optional(),
    companyTitle: z.string().optional(),
    companyLinks: z.array(z.string()).optional(),
    copyright: z.string().optional(),
    legalLinks: z.array(z.string()).optional(),
    /** Navigation target for the brand button. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Atelier Studio'
    const about =
      props.about ??
      'Award-winning interior design studio based in San Francisco. Creating timeless, elegant spaces since 2014.'
    const socials = props.socials?.length
      ? props.socials
      : ['Instagram', 'Pinterest', 'LinkedIn']
    const servicesTitle = props.servicesTitle ?? 'Services'
    const servicesLinks = props.servicesLinks?.length
      ? props.servicesLinks
      : [
          'Residential Design',
          'Commercial Spaces',
          'Furniture Curation',
          'Consultation',
        ]
    const companyTitle = props.companyTitle ?? 'Studio'
    const companyLinks = props.companyLinks?.length
      ? props.companyLinks
      : ['Projects', 'Process', 'About', 'Contact']
    const copyright = props.copyright ?? 'All rights reserved.'
    const legalLinks = props.legalLinks?.length
      ? props.legalLinks
      : ['Privacy Policy', 'Terms of Service']
    return (
      <SiteFooter
        className={
          'relative overflow-hidden border-t border-border bg-background' +
          (props.className ? ' ' + props.className : '')
        }
      >
        {/* Giant ghost brand watermark bleeding off the bottom edge. */}
        <Watermark className="-bottom-6 -right-2 text-[4.5rem] font-light sm:text-[8rem] lg:text-[11rem]">
          {brand}
        </Watermark>
        <Container className="relative py-14 lg:py-16">
          <FooterGrid className="grid gap-10 md:grid-cols-12 lg:gap-8">
            <FooterBrand
              brand={brand}
              brandClassName="text-lg font-light tracking-tight"
              className="md:col-span-6"
            >
              <FooterTagline className="max-w-sm leading-relaxed">
                {about}
              </FooterTagline>
              <FooterSocial className="mt-6 gap-2">
                {socials
                  .map((s) => ({ label: s }))
                  .map((s) => (
                    <FooterSocialLink
                      key={s.label}
                      className="rounded-none border border-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                    >
                      {s.label}
                    </FooterSocialLink>
                  ))}
              </FooterSocial>
            </FooterBrand>
            <FooterColumn className="md:col-span-3">
              <FooterColumnTitle className="flex items-center gap-2 font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground">
                <span aria-hidden="true" className="size-1.5 bg-primary" />
                {servicesTitle}
              </FooterColumnTitle>
              <FooterColumnList className="mt-5 space-y-3">
                {servicesLinks.map((link) => (
                  <FooterLink
                    key={link}
                    className="block w-fit text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link}
                  </FooterLink>
                ))}
              </FooterColumnList>
            </FooterColumn>
            <FooterColumn className="md:col-span-3">
              <FooterColumnTitle className="flex items-center gap-2 font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground">
                <span aria-hidden="true" className="size-1.5 bg-primary" />
                {companyTitle}
              </FooterColumnTitle>
              <FooterColumnList className="mt-5 space-y-3">
                {companyLinks.map((link) => (
                  <FooterLink
                    key={link}
                    className="block w-fit text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link}
                  </FooterLink>
                ))}
              </FooterColumnList>
            </FooterColumn>
          </FooterGrid>
          <FooterBottom className="mt-12 flex flex-col justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center">
            <FooterCopyright className="text-sm text-muted-foreground">
              {copyright}
            </FooterCopyright>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <FooterLegal className="flex flex-wrap gap-x-5 gap-y-2">
                {legalLinks.map((l) => (
                  <FooterLink
                    key={l}
                    className="block w-fit font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l}
                  </FooterLink>
                ))}
              </FooterLegal>
              <MonoTag
                tone="faint"
                aria-hidden="true"
                className="tracking-[0.2em]"
              >
                — SF
              </MonoTag>
            </div>
          </FooterBottom>
        </Container>
      </SiteFooter>
    )
  },
})
