module.exports = {
  // root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "@nuxtjs/eslint-config-typescript",
    "plugin:nuxt/recommended",
    "plugin:prettier/recommended",
  ],
  plugins: ["@typescript-eslint"],
  // add your custom rules here
  rules: {
    "vue/multi-word-component-names": "off",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-empty-function": "warn",
    "no-unreachable": "warn",
    "require-await": "warn",
    "scss(unknownAtRules)": "ignore",
    "prettier/prettier": ["off", { singleQuote: true }],
  },
  // compilerOptions: {
  //   types: ["@nuxt/types"],
  // },
};
