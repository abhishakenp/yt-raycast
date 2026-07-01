import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    clearMocks: true,
    // OpenUI SSR/generation tests are CPU-heavy and use provider mocks; bounded
    // workers keep full-suite coverage deterministic on dev Macs.
    hookTimeout: 120_000,
    maxWorkers: 2,
    setupFiles: ['./vitest.setup.ts'],
    testTimeout: 120_000,
    // Installs an in-memory Web Storage polyfill for jsdom test files (jsdom here
    // does not expose window.localStorage/sessionStorage). No-op in node env.
    setupFiles: ['./vitest.setup.ts'],
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
            'packages/ship-fast-aeo/src/**/*.test.ts',
            'packages/ship-fast-blocks/src/**/*.test.ts',
            'packages/ship-fast-engine/src/**/*.test.ts',
            'packages/ship-fast-engine/src/*.test.js',
            'packages/ship-fast-engine/src/clone/**/*.test.ts',
            'packages/ship-fast-engine/src/genui/**/*.test.ts',
            'packages/ship-fast-engine/src/**/*.test.js',
            'packages/ship-fast-engine/src/llm/**/*.test.js',
            'packages/ship-fast-engine/src/pipeline/**/*.test.ts',
            'packages/ship-fast-engine/src/renderers/**/*.test.ts',
            'packages/ship-fast-engine/src/renderers/**/*.test.js',
            'packages/ship-fast-engine/src/spec/**/*.test.js',
            'packages/ship-fast-engine/src/v3/**/*.test.ts',
            'packages/ship-fast-lakebed/src/**/*.test.ts',
            'scripts/**/*.test.ts',
          ],
        },
      },
      {
        extends: true,
        test: {
          name: 'jsdom',
          environment: 'jsdom',
          include: [
            'src/**/*.test.tsx',
            'packages/ship-fast-blocks/src/**/*.test.tsx',
            'packages/ship-fast-lakebed/src/**/*.test.tsx',
            'public/scripts/**/*.test.js',
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
