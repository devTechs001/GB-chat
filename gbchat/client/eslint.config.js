import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'public/sw.js']),
  // Build/config files run in Node, not the browser.
  {
    files: ['*.config.js', 'scripts/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.node },
    },
  },
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      // eslint-plugin-react-hooks ≥5 exposes flat configs directly
      reactHooks.configs['recommended-latest'] || reactHooks.configs.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // Underscore-prefixed args are intentionally unused (event stubs, hooks)
      // Warn, do not block: the codebase still carries ~180 unused imports
      // from earlier iterations. They show up in `npm run lint` output and are
      // cleaned up as files are touched, without failing a build.
      'no-unused-vars': [
        'warn',
        {
          varsIgnorePattern: '^[A-Z_]',
          argsIgnorePattern: '^_',
          caughtErrors: 'none',
        },
      ],
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-console': 'off',
    },
  },
])
