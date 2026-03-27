// @ts-check
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginN from 'eslint-plugin-n'
import pluginSecurity from 'eslint-plugin-security'
import pluginUnicorn from 'eslint-plugin-unicorn'

export default tseslint.config(
  // ── Base ──────────────────────────────────────────────────────────────────
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // ── Language options ──────────────────────────────────────────────────────
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // ── Node.js ───────────────────────────────────────────────────────────────
  {
    ...pluginN.configs['flat/recommended-module'],
    settings: {
      node: {
        tryExtensions: ['.ts', '.js', '.json', '.node'],
      },
    },
  },

  // ── Security ─────────────────────────────────────────────────────────────
  pluginSecurity.configs.recommended,

  // ── Unicorn (modern JS best-practices) ────────────────────────────────────
  pluginUnicorn.configs.recommended,

  // ── Project-wide overrides ────────────────────────────────────────────────
  {
    rules: {
      // TypeScript
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/promise-function-async': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        { allowNullableObject: true },
      ],
      '@typescript-eslint/switch-exhaustiveness-check': 'error',

      // General quality
      'no-console': 'warn',
      'no-debugger': 'error',
      'eqeqeq': ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-template': 'error',
      'object-shorthand': 'error',
      'no-nested-ternary': 'error',
      'no-param-reassign': 'error',
      'no-return-assign': 'error',
      'no-throw-literal': 'error',

      // Node
      'n/no-process-exit': 'error',
      'n/prefer-node-protocol': 'error',

      // Unicorn – selectively disable rules that conflict with TS patterns
      'unicorn/prevent-abbreviations': 'off', // too noisy for common names like req/res/err
      'unicorn/no-null': 'off',               // TypeScript ecosystem uses null widely
      'unicorn/prefer-module': 'off',         // project is CommonJS
    },
  },

  // ── Ignore compiled output ────────────────────────────────────────────────
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
)
