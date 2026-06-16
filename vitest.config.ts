import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    environmentMatchGlobs: [['convex/**/*.test.ts', 'edge-runtime']],
    include: [
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
      'convex/**/*.test.ts',
      'packages/ship-fast-engine/src/genui/**/*.test.ts',
      'packages/ship-fast-engine/src/pipeline/**/*.test.ts',
    ],
  },
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
})
