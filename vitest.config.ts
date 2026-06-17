import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'json-summary'],
      reportsDirectory: 'coverage',
      thresholds: {
        statements: 22.13,
        branches: 14.8,
        functions: 10.68,
        lines: 21.74,
      },
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'node',
          environment: 'node',
          include: [
            'src/**/*.test.ts',
            'src/**/*.test.tsx',
            'packages/ship-fast-blocks/src/**/*.test.ts',
            'packages/ship-fast-engine/src/*.test.js',
            'packages/ship-fast-engine/src/clone/**/*.test.ts',
            'packages/ship-fast-engine/src/genui/**/*.test.ts',
            'packages/ship-fast-engine/src/llm/**/*.test.js',
            'packages/ship-fast-engine/src/pipeline/**/*.test.ts',
            'packages/ship-fast-engine/src/renderers/**/*.test.ts',
            'packages/ship-fast-engine/src/renderers/**/*.test.js',
            'packages/ship-fast-engine/src/spec/**/*.test.js',
            'scripts/**/*.test.ts',
          ],
        },
      },
      {
        extends: true,
        test: {
          name: 'convex',
          environment: 'edge-runtime',
          include: ['convex/**/*.test.ts'],
        },
      },
    ],
  },
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
})
