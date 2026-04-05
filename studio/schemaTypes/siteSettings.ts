import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  fields: [
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
  ],
})
