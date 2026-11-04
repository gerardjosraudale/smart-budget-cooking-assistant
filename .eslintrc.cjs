module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  extends: ['eslint:recommended', 'plugin:react-hooks/recommended'],
  ignorePatterns: ['dist', 'node_modules'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
  plugins: ['react-refresh'],
  overrides: [
    { files: ['*.config.js', '.eslintrc.cjs'], env: { node: true } },
    { files: ['api/**/*.mjs'], env: { node: true, browser: false } },
  ],
  rules: {
    // JSX usage isn't tracked without eslint-plugin-react, so ignore capitalized names (components)
    'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
  },
}
