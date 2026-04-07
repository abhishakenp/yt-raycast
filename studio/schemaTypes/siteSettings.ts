import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  fields: [
    defineField({
      name: 'ogImage',
      title: 'Open Graph / social share image',
      description:
        'Choose which image to use for link previews (Facebook, X, Slack, etc.). Upload a new file or pick an existing asset, then use Replace to swap it.',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alt text',
          description: 'Short description for accessibility and some social cards.',
        }),
      ],
    }),
    defineField({
      name: 'homeHeroImage',
      title: 'Homepage hero image',
      description:
        'Image shown in the hero area on the marketing homepage. Upload or select from the media library; use Replace on the preview to change this slot only.',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alt text',
        }),
      ],
    }),
    defineField({
      name: 'homeTitle',
      title: 'Homepage title override',
      type: 'string',
    }),
    defineField({
      name: 'homeDescription',
      title: 'Homepage meta description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'pricingPageTitle',
      title: 'Pricing page title',
      type: 'string',
    }),
    defineField({
      name: 'pricingPageDescription',
      title: 'Pricing page meta description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'pricingHeroHeadline',
      title: 'Pricing hero headline',
      type: 'string',
    }),
    defineField({
      name: 'shipChatHeadline',
      title: 'Chat-synced marketing headline (home hero)',
      type: 'string',
      description: 'Updated when Ship Fast chat edits the generated site (home hero).',
    }),
    defineField({
      name: 'shipChatSubheadline',
      title: 'Chat-synced subheadline',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'shipChatSyncedAt',
      title: 'Last chat sync',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'ogImageUrl',
      title: 'Open Graph image URL (API / legacy)',
      type: 'url',
      hidden: true,
      description: 'Set automatically by the dashboard uploader or coexists with the image field above.',
    }),
    defineField({
      name: 'homeHeroImageUrl',
      title: 'Homepage hero image URL (API / legacy)',
      type: 'url',
      hidden: true,
    }),
  ],
})
