import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'localizedText',
  title: 'Localized text',
  type: 'object',
  fields: [
    defineField({
      name: 'en',
      title: 'English',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'hi', title: 'Hindi', type: 'text', rows: 4 }),
    defineField({ name: 'ta', title: 'Tamil', type: 'text', rows: 4 }),
    defineField({ name: 'te', title: 'Telugu', type: 'text', rows: 4 }),
    defineField({ name: 'kn', title: 'Kannada', type: 'text', rows: 4 }),
    defineField({ name: 'ml', title: 'Malayalam', type: 'text', rows: 4 }),
    defineField({ name: 'bn', title: 'Bengali', type: 'text', rows: 4 }),
    defineField({ name: 'mr', title: 'Marathi', type: 'text', rows: 4 }),
    defineField({ name: 'gu', title: 'Gujarati', type: 'text', rows: 4 }),
  ],
})
