const path = require('node:path')
const { srcOf, featureOf } = require('./paths.cjs')

const ROOT_FILES = new Set(['constants', 'types', 'hooks', 'stores', 'index'])
const DIRS = new Set(['api', 'components', 'utils', '__tests__', '__snapshots__'])
const API_FILES = new Set(['fetchers', 'schemas', 'hooks', 'index'])

const stemOf = (file) => file.replace(/\.(test|spec)\.tsx?$/, '').replace(/(\.(ios|android|web|native))?\.tsx?$/, '')

module.exports = {
  meta: {
    type: 'suggestion',
    schema: [],
    messages: {
      root: "'{{file}}' does not belong at the feature root. Root holds constants, types, hooks, stores, index; UI goes in components/, logic in utils/.",
      dir: "'{{dir}}/' is not a feature folder. Use api/, components/, utils/.",
      api: "'api/{{file}}' is not allowed. api/ holds fetchers, schemas, hooks, index.",
      nested: "utils/ is flat. Move '{{file}}' to utils/<concern>.ts.",
      indexStar: 'The feature index re-exports with `export * from` only.',
    },
  },
  create(context) {
    const src = srcOf(context.filename)
    const hit = src && featureOf(src, context.filename)
    if (!hit) return {}
    const { rest } = hit
    return {
      Program(node) {
        const isTest = /\.(test|spec)\.tsx?$/.test(context.filename) || rest.includes('__tests__')
        if (rest.length === 1) {
          const stem = stemOf(rest[0])
          if (!ROOT_FILES.has(stem) && !(isTest && ROOT_FILES.has(stem))) {
            context.report({ node, messageId: 'root', data: { file: rest[0] } })
          }
          if (rest[0] === 'index.ts') {
            for (const s of node.body) {
              if (s.type !== 'ExportAllDeclaration') context.report({ node: s, messageId: 'indexStar' })
            }
          }
          return
        }
        const [dir, ...inner] = rest
        if (!DIRS.has(dir)) return context.report({ node, messageId: 'dir', data: { dir } })
        if (isTest) return
        if (dir === 'api' && (inner.length > 1 || !API_FILES.has(stemOf(inner[0])))) {
          context.report({ node, messageId: 'api', data: { file: inner.join('/') } })
        }
        if (dir === 'utils' && inner.length > 1) context.report({ node, messageId: 'nested', data: { file: inner.join('/') } })
      },
    }
  },
}
