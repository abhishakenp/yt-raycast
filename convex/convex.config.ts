import { defineApp } from 'convex/server'
import { v } from 'convex/values'
import debouncer from '@ikhrustalev/convex-debouncer/convex.config.js'

const app = defineApp({
  env: {
    BILLING_WEBHOOK_MUTATION_SECRET: v.optional(v.string()),
    DUB_API_KEY: v.optional(v.string()),
    DUB_PARTNERS_ENABLED: v.optional(v.string()),
    DUB_PARTNER_GROUP_ID: v.optional(v.string()),
  },
})

app.use(debouncer)

export default app
