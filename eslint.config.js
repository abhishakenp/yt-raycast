//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  ...tanstackConfig,
  {
    rules: {
      'import/no-cycle': 'off',
      'import/consistent-type-specifier-style': 'off',
      'import/first': 'off',
      'import/newline-after-import': 'off',
      'import/order': 'off',
      'sort-imports': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/method-signature-style': 'off',
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/require-await': 'off',
      'node/prefer-node-protocol': 'off',
      'no-useless-escape': 'off',
      'pnpm/json-enforce-catalog': 'off',
      'react-hooks/exhaustive-deps': 'off',
    },
  },
  {
    ignores: [
      '.output/**',
      'convex/_generated/**',
      'dist/**',
      'eslint.config.js',
      'sessions/**',
      'prettier.config.js',
      'vendor/**',
    ],
  },
]
