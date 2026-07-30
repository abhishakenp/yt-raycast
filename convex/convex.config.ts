import { defineApp } from 'convex/server'
import { v } from 'convex/values'
import debouncer from '@ikhrustalev/convex-debouncer/convex.config.js'

const app = defineApp({
  env: {
    BILLING_WEBHOOK_MUTATION_SECRET: v.optional(v.string()),
    CONTENT_MODERATION_MUTATION_SECRET: v.optional(v.string()),
    DUB_API_KEY: v.optional(v.string()),
    DUB_PARTNERS_ENABLED: v.optional(v.string()),
    DUB_PARTNER_GROUP_ID: v.optional(v.string()),
    // Base URL of the Dub API. Unset → Dub SaaS (api.dub.co); set to the
    // self-hosted instance (e.g. https://api.ship-fast.ai) to deliver there.
    DUB_API_URL: v.optional(v.string()),
  },
})

app.use(debouncer)

export default app
