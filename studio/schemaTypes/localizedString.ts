import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'localizedString',
  title: 'Localized string',
  type: 'object',
  fields: [
    defineField({
      name: 'en',
      title: 'English',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'hi', title: 'Hindi', type: 'string' }),
    defineField({ name: 'ta', title: 'Tamil', type: 'string' }),
    defineField({ name: 'te', title: 'Telugu', type: 'string' }),
    defineField({ name: 'kn', title: 'Kannada', type: 'string' }),
    defineField({ name: 'ml', title: 'Malayalam', type: 'string' }),
    defineField({ name: 'bn', title: 'Bengali', type: 'string' }),
    defineField({ name: 'mr', title: 'Marathi', type: 'string' }),
    defineField({ name: 'gu', title: 'Gujarati', type: 'string' }),
  ],
})
