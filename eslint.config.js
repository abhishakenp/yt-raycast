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
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSAsExpression[typeAnnotation.type="TSAnyKeyword"]',
          message:
            'Do not use `as any`; fix the underlying type or narrow the value.',
        },
      ],
      'no-useless-escape': 'off',
      'pnpm/json-enforce-catalog': 'off',
      'react-hooks/exhaustive-deps': 'off',
    },
  },
  {
    ignores: [
      '.output/**',
      '**/_generated/**',
      '**/generated/**',
      '**/vendor/**',
      'dist/**',
      'eslint.config.js',
      'sessions/**',
      'prettier.config.js',
      'src/routeTree.gen.ts',
      'vendor/**',
      '**/pipeline/openui-validate.d.ts',
    ],
  },
]
