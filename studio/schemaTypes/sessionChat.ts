import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'sessionChat',
  title: 'Ship Fast session chat',
  type: 'document',
  fields: [
    defineField({
      name: 'sessionId',
      title: 'Session ID',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Conversation summary',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'messages',
      title: 'Messages',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'id', title: 'Id', type: 'string' },
            { name: 'role', title: 'Role', type: 'string' },
            { name: 'content', title: 'Content', type: 'text' },
            { name: 'createdAt', title: 'Created', type: 'datetime' },
          ],
        },
      ],
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated at',
      type: 'datetime',
    }),
    defineField({
      name: 'version',
      title: 'Store version',
      type: 'number',
    }),
  ],
  preview: {
    select: { sid: 'sessionId', updated: 'updatedAt' },
    prepare({ sid, updated }) {
      return {
        title: sid ? `Chat ${sid}` : 'Session chat',
        subtitle: updated ? String(updated) : '',
      }
    },
  },
})
