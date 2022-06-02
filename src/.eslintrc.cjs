module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  env: {
    browser: true,
    es6: true,
    jest: true,
    node: true
  },
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    "@typescript-eslint/no-this-alias": [
      "error",
      {
        "allowDestructuring": false, // Disallow `const { props, state } = this`; true by default
        "allowedNames": ["self"] // Allow `const self = this`; `[]` by default
      }
    ],
    "no-empty-function": "off",
    "@typescript-eslint/no-empty-function": ["error", { "allow": ["arrowFunctions"] }]
  }
};