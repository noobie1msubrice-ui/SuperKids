import js from '@eslint/js'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import globals from 'globals'

// Flat config for ESLint 9. Replaces the legacy .eslintrc.cjs, which ESLint 9
// no longer reads by default.
export default [
  { ignores: ['lib/', 'node_modules/'] },
  js.configs.recommended,
  ...tsPlugin.configs['flat/recommended'],
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
]
