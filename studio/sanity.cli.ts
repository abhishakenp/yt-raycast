import './cli-env.js'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineCliConfig } from 'sanity/cli'

const __dirname = dirname(fileURLToPath(import.meta.url))
const fseventsStub = join(__dirname, 'fsevents-stub.js')

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || process.env.SANITY_PROJECT_ID || ''
const dataset = process.env.SANITY_STUDIO_DATASET || process.env.SANITY_DATASET || 'production'

const studioProcessEnvDefine = () => {
  const env = process.env
  return {
    'process.env.SANITY_STUDIO_PROJECT_ID': JSON.stringify(env.SANITY_STUDIO_PROJECT_ID ?? ''),
    'process.env.SANITY_PROJECT_ID': JSON.stringify(env.SANITY_PROJECT_ID ?? ''),
    'process.env.SANITY_STUDIO_DATASET': JSON.stringify(env.SANITY_STUDIO_DATASET ?? ''),
    'process.env.SANITY_DATASET': JSON.stringify(env.SANITY_DATASET ?? ''),
    'process.env.SANITY_API_VERSION': JSON.stringify(env.SANITY_API_VERSION ?? ''),
    'process.env.SANITY_STUDIO_API_TOKEN': JSON.stringify(env.SANITY_STUDIO_API_TOKEN ?? ''),
    'process.env.SANITY_STUDIO_WRITE_TOKEN': JSON.stringify(env.SANITY_STUDIO_WRITE_TOKEN ?? ''),
    'process.env.SANITY_WRITE_TOKEN': JSON.stringify(env.SANITY_WRITE_TOKEN ?? ''),
  }
}

const mergeVite = (config) => {
  const prev = config.resolve?.alias
  const alias = Array.isArray(prev)
    ? [...prev, { find: 'fsevents', replacement: fseventsStub }]
    : prev && typeof prev === 'object'
      ? { ...prev, fsevents: fseventsStub }
      : { fsevents: fseventsStub }
  return {
    ...config,
    resolve: {
      ...config.resolve,
      alias,
    },
    define: {
      ...(config.define && typeof config.define === 'object' ? config.define : {}),
      ...studioProcessEnvDefine(),
    },
  }
}

export default defineCliConfig({
  api: { projectId, dataset },
  project: { basePath: '/studio' },
  vite: mergeVite,
})
