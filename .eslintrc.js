module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:tailwindcss/recommended',
    'plugin:vue/vue3-recommended',
    '@antfu',
  ],
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'vue',
  ],
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'off',
    'vue/multi-word-component-names': 'off',
    'curly': ['error', 'multi-line'],
    'vue/component-tags-order': ['error', {
      order: ['script', 'template', 'style'],
    }],
    'tailwindcss/no-custom-classname': 'off',
    'antfu/if-newline': 'off',
    'unicorn/prefer-node-protocol': 'off',
  },
}
