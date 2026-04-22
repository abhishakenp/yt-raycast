import { createClient } from '@sanity/client'
import { visionTool } from '@sanity/vision'
import { createMockAuthStore, defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { media } from 'sanity-plugin-media'
import { seoMetaFields } from 'sanity-plugin-seo'
import { schemaTypes } from './schemaTypes'
import { structure } from './structure'

const sessionConfig =
  typeof window !== 'undefined' ? (window as any).__SANITY_SESSION_CONFIG__ : undefined

const projectId = (
  sessionConfig?.projectId ||
  process.env.SANITY_STUDIO_PROJECT_ID ||
  process.env.SANITY_PROJECT_ID ||
  ''
).trim()
const dataset = (
  sessionConfig?.dataset ||
  process.env.SANITY_STUDIO_DATASET ||
  process.env.SANITY_DATASET ||
  'production'
).trim()

const apiVersion = (process.env.SANITY_API_VERSION || '2024-01-01').trim()

const studioToken = (
  process.env.SANITY_STUDIO_API_TOKEN ||
  process.env.SANITY_STUDIO_WRITE_TOKEN ||
  process.env.SANITY_WRITE_TOKEN ||
  ''
).trim()

const authStore =
  !sessionConfig && projectId && dataset && studioToken
    ? createMockAuthStore({
        client: createClient({
          projectId,
          dataset,
          apiVersion,
          token: studioToken,
          useCdn: false,
          ignoreBrowserTokenWarning: true,
          requestTagPrefix: 'sanity.studio',
        }),
        currentUser: {
          id: 'api-token',
          name: 'API token',
          email: '',
          role: 'editor',
          roles: [{ name: 'editor', title: 'Editor' }],
        },
      })
    : undefined

export default defineConfig({
  name: 'ship-fast',
  title: 'Ship Fast',
  projectId,
  dataset,
  basePath: '/studio',
  ...(authStore ? { auth: authStore } : {}),
  plugins: [structureTool({ structure }), seoMetaFields(), media(), visionTool()],
  schema: { types: schemaTypes },
})
