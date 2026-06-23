import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // OpenUI SSR/generation tests are CPU-heavy and use provider mocks; bounded
    // workers keep full-suite coverage deterministic on dev Macs.
    maxWorkers: 2,
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'json-summary'],
      reportsDirectory: 'coverage',
      exclude: [
        'packages/ship-fast-blocks/src/capsules/**',
        'packages/ship-fast-blocks/src/generated/**',
      ],
      thresholds: {
        statements: 23.49,
        branches: 15.7,
        functions: 11.33,
        lines: 23.06,
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
            'packages/ship-fast-blocks/src/**/*.test.tsx',
            'packages/ship-fast-engine/src/*.test.js',
            'packages/ship-fast-engine/src/clone/**/*.test.ts',
            'packages/ship-fast-engine/src/genui/**/*.test.ts',
            'packages/ship-fast-engine/src/llm/**/*.test.js',
            'packages/ship-fast-engine/src/pipeline/**/*.test.ts',
            'packages/ship-fast-engine/src/renderers/**/*.test.ts',
            'packages/ship-fast-engine/src/renderers/**/*.test.js',
            'packages/ship-fast-engine/src/spec/**/*.test.js',
            'packages/ship-fast-lakebed/src/**/*.test.ts',
            'packages/ship-fast-lakebed/src/**/*.test.tsx',
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
