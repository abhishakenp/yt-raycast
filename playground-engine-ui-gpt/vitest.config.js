import { defineConfig } from 'vitest/config'

export default defineConfig({
  root: new URL('.', import.meta.url).pathname,
  test: {
    include: ['tests/**/*.test.js'],
    exclude: ['node_modules/**', '.runs/**'],
  },
})
