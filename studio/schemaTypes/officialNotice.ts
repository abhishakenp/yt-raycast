import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'officialNotice',
  title: 'Notice / tender',
  type: 'document',
  fields: [
    defineField({
      name: 'noticeKind',
      title: 'Kind',
      type: 'string',
      options: {
        list: [
          { title: 'Tender', value: 'tender' },
          { title: 'Notification', value: 'notification' },
          { title: 'Circular', value: 'circular' },
          { title: 'Press', value: 'press' },
        ],
        layout: 'radio',
      },
      initialValue: 'notification',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'documentCategory',
      title: 'Category (optional)',
      type: 'reference',
      to: [{ type: 'documentCategory' }],
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'localizedString',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'localizedText',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
    }),
    defineField({
      name: 'validUntil',
      title: 'Valid until',
      type: 'datetime',
    }),
    defineField({
      name: 'attachment',
      title: 'Attachment (PDF / file)',
      type: 'file',
      options: { accept: '.pdf,.doc,.docx,.xls,.xlsx,.zip' },
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'blockContent',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: (doc) => (doc?.title as { en?: string } | undefined)?.en,
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seoMetaFields',
    }),
  ],
  preview: {
    select: {
      t: 'title.en',
      k: 'noticeKind',
      p: 'publishedAt',
    },
    prepare({ t, k, p }) {
      return {
        title: t || 'Notice',
        subtitle: [k, p].filter(Boolean).join(' · '),
      }
    },
  },
  orderings: [
    {
      title: 'Published date, newest',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
})
