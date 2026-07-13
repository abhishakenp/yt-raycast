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
          selector:
            ':matches(ArrowFunctionExpression, FunctionExpression):not(CallExpression[callee.name="useCallback"] > :matches(ArrowFunctionExpression, FunctionExpression)):not(CallExpression[callee.object.name="React"][callee.property.name="useCallback"] > :matches(ArrowFunctionExpression, FunctionExpression)) > Identifier[typeAnnotation]',
          message:
            'parameter annotations are forbidden in arrow functions and function expressions; use a named function declaration or useCallback instead.',
        },
        {
          selector:
            ':matches(ArrowFunctionExpression, FunctionExpression)[returnType]:not(CallExpression[callee.name="useCallback"] > :matches(ArrowFunctionExpression, FunctionExpression)):not(CallExpression[callee.object.name="React"][callee.property.name="useCallback"] > :matches(ArrowFunctionExpression, FunctionExpression))',
          message:
            'return annotations are forbidden in arrow functions and function expressions; use a named function declaration or useCallback instead.',
        },
        {
          selector: 'TSAsExpression',
          message:
            'Type assertions are forbidden; fix the underlying type or use `satisfies` instead.',
        },
        {
          selector: 'TSTypeAssertion',
          message:
            'Angle-bracket type assertions are forbidden; fix the underlying type or use `satisfies` instead.',
        },
        {
          selector: 'TSNonNullExpression',
          message:
            'Non-null assertions are forbidden; handle the undefined case explicitly.',
        },
        {
          selector: 'TSAnyKeyword',
          message:
            'Explicit `any` is forbidden; fix the underlying type or narrow the value.',
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
