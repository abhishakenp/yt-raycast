import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.test.{js,ts}', 'packages/ship-fast-engine/src/**/*.test.{js,ts}'],
    exclude: ['medusa-backend/**', 'node_modules/**'],
  },
})
