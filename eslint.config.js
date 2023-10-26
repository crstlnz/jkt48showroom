import antfu from '@antfu/eslint-config'

export default antfu(
  {
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
)
