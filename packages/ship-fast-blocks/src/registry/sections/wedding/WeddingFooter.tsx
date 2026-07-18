import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  SiteFooter,
  FooterContent,
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
} from '#/section-kit/SiteFooter.tsx'

function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="9" cy="13" r="5" />
      <circle cx="15" cy="13" r="5" />
      <path d="M9 8c0-2 1.3-3.5 3-3.5S15 6 15 8" />
    </svg>
  )
}

export const WeddingFooter = defineCapsule({
  name: 'WeddingFooter',
  description:
    'Elegant wedding site footer built on the shared SiteFooter composite: a serif couple wordmark with an interlocking-rings mark, a warm tagline, the wedding day details, explore links, and a questions/contact column. Use as the closing band of a wedding invitation or celebration page.',
  props: z.object({
    brand: z.string().optional(),
    tagline: z.string().optional(),
    social: z
      .array(
        z.object({
          label: z.string(),
          href: z.string().optional(),
        }),
      )
      .optional(),
    columns: z
      .array(
        z.object({
          title: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const social = props.social?.length
      ? props.social
      : [{ label: 'Instagram' }, { label: '#AvaAndLiam' }]
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'The Day',
            links: [
              'September 14, 2025',
              'Willowbrook Gardens',
              'Napa Valley, CA',
            ],
          },
          {
            title: 'Explore',
            links: ['Story', 'Gallery', 'Details', 'RSVP'],
          },
          {
            title: 'Questions?',
            links: ['hello@avaandliam.com', 'FAQ', 'Travel & Stay'],
          },
        ]
    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand
              brand={props.brand ?? 'Ava & Liam'}
              brandMark={<Mark className="size-7 text-primary" />}
              brandClassName={'font-serif text-lg font-medium'}
            >
              <FooterTagline>
                {props.tagline ?? "Can't wait to celebrate with you."}
              </FooterTagline>
              <FooterSocial>
                {social.map((s) => (
                  <FooterSocialLink key={s.label}>{s.label}</FooterSocialLink>
                ))}
              </FooterSocial>
            </FooterBrand>
            {columns.map((col) => (
              <FooterColumn key={col.title}>
                <FooterColumnTitle>{col.title}</FooterColumnTitle>
                <FooterColumnList>
                  {col.links.map((link) => (
                    <FooterLink key={link}>{link}</FooterLink>
                  ))}
                </FooterColumnList>
              </FooterColumn>
            ))}
          </FooterGrid>
          <FooterBottom>
            <FooterCopyright>{props.note ?? 'With love.'}</FooterCopyright>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
