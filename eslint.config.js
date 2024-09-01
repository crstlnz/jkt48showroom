/* This JavaScript code snippet is configuring ESLint rules using the `@antfu/eslint-config` package. */
import antfu from '@antfu/eslint-config'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  antfu(
    {
      vue: true,
      ignores: [
        'node_modules',
        'dist',
        '.output',
        '.nuxt',
      ],
      rules: {
        'no-console': 'warn',
        'no-unused-vars': 'warn',
        'vue/multi-word-component-names': 'off',
        'curly': ['error', 'multi-line'],
        'tailwindcss/no-custom-classname': 'off',
        'antfu/if-newline': 'off',
        'unicorn/prefer-node-protocol': 'off',
        'node/prefer-global/process': 'off',
        'unused-imports/no-unused-vars': 'warn',
      },
    },
  ),
)
