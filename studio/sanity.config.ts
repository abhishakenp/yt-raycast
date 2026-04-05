import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './schemaTypes'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || process.env.SANITY_PROJECT_ID || ''
const dataset = process.env.SANITY_STUDIO_DATASET || process.env.SANITY_DATASET || 'production'

export default defineConfig({
  name: 'ship-fast',
  title: 'Ship Fast',
  projectId,
  dataset,
  plugins: [structureTool(), visionTool()],
  schema: { types: schemaTypes },
})
