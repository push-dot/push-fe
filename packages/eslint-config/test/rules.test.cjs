const { test } = require('node:test')
const { RuleTester } = require('eslint')
const tseslint = require('typescript-eslint')
const { plugin } = require('../index.cjs')

const tester = new RuleTester({ languageOptions: { parser: tseslint.parser, parserOptions: { ecmaFeatures: { jsx: true } } } })
const run = (name, cases) => test(name, () => tester.run(name, plugin.rules[name], cases))
const F = '/app/src/features'

run('no-comments', {
  valid: ['// eslint-disable-next-line no-console\nconsole.log(1)', '// @ts-expect-error\nconst a: number = "x"'],
  invalid: [
    { code: 'const a = 1 // note\n', output: 'const a = 1\n', errors: 1 },
    { code: '// top\nconst a = 1\n', output: 'const a = 1\n', errors: 1 },
    { code: 'try { a() } catch {\n  // ignore\n}\n', output: 'try { a() } catch {\n}\n', errors: 1 },
    { code: 'const x = (\n  <View>\n    {/* hint */}\n    <Text />\n  </View>\n)\n', output: 'const x = (\n  <View>\n    <Text />\n  </View>\n)\n', errors: 1 },
  ],
})

run('prefer-arrow', {
  valid: ['const f = () => 1', 'class A { m() {} }', 'const o = { m() {}, get g() { return 1 } }', 'function* gen() {}'],
  invalid: [{ code: 'function f() {}', errors: 1 }, { code: 'const f = function () {}', errors: 1 }],
})

run('component-default-export', {
  valid: [
    { code: 'const A = () => <View />\nexport default A', filename: '/app/src/a.tsx' },
    { code: 'export const useX = () => 1\nconst A = () => <View />\nexport default A', filename: '/app/src/a.tsx' },
    { code: 'export const value = 1', filename: '/app/src/a.tsx' },
    { code: 'export type Props = { a: 1 }\nexport interface Ref { b: 2 }\nconst A = () => <View />\nexport default A', filename: '/app/src/a.tsx' },
  ],
  invalid: [
    { code: 'export const Banner = () => <View />', filename: '/app/src/a.tsx', errors: [{ messageId: 'missing' }, { messageId: 'named' }] },
    { code: 'export default () => <View />', filename: '/app/src/a.tsx', errors: [{ messageId: 'inline' }] },
  ],
})

run('no-inline-style', {
  valid: ['<View style={styles.a} />', '<View style={[styles.a, b]} />'],
  invalid: [{ code: '<View style={{ flex: 1 }} />', errors: 1 }, { code: '<List contentContainerStyle={{ gap: 2 }} />', errors: 1 }],
})

run('feature-boundaries', {
  valid: [
    { code: "import { a } from '@/features/chat'", filename: '/app/src/screens/x.tsx' },
    { code: "import { a } from '../utils/b'", filename: `${F}/chat/api/x.ts` },
    { code: "import { a } from '@/features/chat/types'", filename: '/app/src/mock/x.ts', options: [{ open: ['types'] }] },
  ],
  invalid: [
    { code: "import { a } from '@/features/chat/utils/b'", filename: '/app/src/screens/x.tsx', errors: [{ messageId: 'deep' }] },
    { code: "import { a } from '../../bots/types'", filename: `${F}/chat/api/x.ts`, errors: [{ messageId: 'deep' }] },
    { code: "import { a } from '@/features/chat/types'", filename: `${F}/chat/api/x.ts`, errors: [{ messageId: 'self' }] },
  ],
})

run('feature-layout', {
  valid: [
    { code: "export * from './api'", filename: `${F}/chat/index.ts` },
    { code: 'export const a = 1', filename: `${F}/chat/constants.ts` },
    { code: 'export const a = 1', filename: `${F}/chat/api/fetchers.ts` },
    { code: 'export const a = 1', filename: `${F}/chat/utils/date.ts` },
    { code: 'export const a = 1', filename: `${F}/chat/stores.test.ts` },
  ],
  invalid: [
    { code: 'export const a = 1', filename: `${F}/chat/error-text.ts`, errors: [{ messageId: 'root' }] },
    { code: "export { a } from './api'", filename: `${F}/chat/index.ts`, errors: [{ messageId: 'indexStar' }] },
    { code: 'export const a = 1', filename: `${F}/chat/stores/run.ts`, errors: [{ messageId: 'dir' }] },
    { code: 'export const a = 1', filename: `${F}/chat/api/cache.ts`, errors: [{ messageId: 'api' }] },
    { code: 'export const a = 1', filename: `${F}/chat/utils/x/y.ts`, errors: [{ messageId: 'nested' }] },
  ],
})

run('no-infra-in-ui', {
  valid: [{ code: "import type { A } from '@push/api-client'", options: [{ modules: ['@push/api-client'] }] }],
  invalid: [
    { code: "import { a } from '@push/api-client'", options: [{ modules: ['@push/api-client'] }], errors: [{ messageId: 'module' }] },
    { code: 'fetch("/x")', errors: [{ messageId: 'fetch' }] },
  ],
})

run('filename-case', {
  valid: [{ code: '', filename: '/app/src/a-b.test.ts' }, { code: '', filename: '/app/src/a.ios.tsx' }],
  invalid: [{ code: '', filename: '/app/src/FooBar.tsx', errors: 1 }],
})
