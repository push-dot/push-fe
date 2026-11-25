const tseslint = require('typescript-eslint')

const plugin = {
  meta: { name: '@push/coding-hooks' },
  rules: {
    'filename-case': require('./rules/filename-case.cjs'),
    'no-comments': require('./rules/no-comments.cjs'),
    'prefer-arrow': require('./rules/prefer-arrow.cjs'),
    'component-default-export': require('./rules/component-default-export.cjs'),
    'no-inline-style': require('./rules/no-inline-style.cjs'),
    'feature-boundaries': require('./rules/feature-boundaries.cjs'),
    'feature-layout': require('./rules/feature-layout.cjs'),
    'no-infra-in-ui': require('./rules/no-infra-in-ui.cjs'),
  },
}

const TS = ['src/**/*.{ts,tsx}']
const TESTS = ['src/**/*.test.{ts,tsx}', 'src/**/__tests__/**']

const codingHooks = ({ uiFiles = [], infraModules = [], open = [], openFiles = [] } = {}) => [
  { files: TS, plugins: { 'coding-hooks': plugin } },
  {
    files: TS,
    rules: {
      'coding-hooks/filename-case': 'error',
      'coding-hooks/no-comments': 'error',
      'coding-hooks/prefer-arrow': 'error',
      'coding-hooks/feature-layout': 'error',
      'coding-hooks/feature-boundaries': 'error',
    },
  },
  { files: ['src/**/*.tsx'], ignores: TESTS, rules: { 'coding-hooks/component-default-export': 'error' } },
  openFiles.length ? { files: openFiles, rules: { 'coding-hooks/feature-boundaries': ['error', { open }] } } : {},
  uiFiles.length ? { files: uiFiles, ignores: TESTS, rules: { 'coding-hooks/no-infra-in-ui': ['error', { modules: infraModules }] } } : {},
]

const NO_CYCLE = { files: TS, rules: { 'import/no-cycle': ['error', { ignoreExternal: true }] } }

const web = (options) => [
  { ...tseslint.configs.base, files: TS },
  {
    files: TS,
    plugins: { import: require('eslint-plugin-import') },
    settings: {
      'import/parsers': { [require.resolve('@typescript-eslint/parser')]: ['.ts', '.tsx'] },
      'import/resolver': { [require.resolve('eslint-import-resolver-typescript')]: { alwaysTryTypes: true } },
    },
  },
  NO_CYCLE,
  ...codingHooks(options),
]

const native = (options) => [
  NO_CYCLE,
  ...codingHooks(options),
  { files: ['src/**/*.tsx'], rules: { 'coding-hooks/no-inline-style': 'error' } },
]

module.exports = { plugin, codingHooks, web, native }
