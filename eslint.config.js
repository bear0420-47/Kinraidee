import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      '**/dist/**',
      '**/coverage/**',
      'docs/03-implementation/openapi.json',
      'src/web/src/api/openapiTypes.ts',
    ],
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['**/*.d.ts', '**/types.ts'],
    rules: {
      '@typescript-eslint/no-namespace': 'off',
    },
  },
)
