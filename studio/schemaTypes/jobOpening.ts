import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'jobOpening',
  title: 'Job opening',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'localizedString',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'department',
      title: 'Department',
      type: 'localizedString',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'localizedString',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'localizedText',
    }),
    defineField({
      name: 'postedAt',
      title: 'Posted at',
      type: 'datetime',
    }),
    defineField({
      name: 'closingAt',
      title: 'Closing at',
      type: 'datetime',
    }),
    defineField({
      name: 'applyUrl',
      title: 'Apply URL',
      type: 'url',
    }),
    defineField({
      name: 'applyEmail',
      title: 'Apply email',
      type: 'string',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Open', value: 'open' },
          { title: 'Closed', value: 'closed' },
        ],
        layout: 'radio',
      },
      initialValue: 'open',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { t: 'title.en', s: 'status', p: 'postedAt' },
    prepare({ t, s, p }) {
      return {
        title: t || 'Role',
        subtitle: [s, p].filter(Boolean).join(' · '),
      }
    },
  },
  orderings: [
    {
      title: 'Posted date, newest',
      name: 'postedAtDesc',
      by: [{ field: 'postedAt', direction: 'desc' }],
    },
  ],
})
