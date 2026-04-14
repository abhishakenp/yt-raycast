import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'documentCategory',
  title: 'Document category',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'localizedString',
      validation: (Rule) => Rule.required(),
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
  ],
  preview: {
    select: { t: 'title.en', slug: 'slug.current' },
    prepare({ t, slug }) {
      return { title: t || 'Category', subtitle: slug ? `/${slug}` : undefined }
    },
  },
})
