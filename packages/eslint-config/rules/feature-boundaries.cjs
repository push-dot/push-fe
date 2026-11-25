const path = require('node:path')
const { srcOf, featureOf, resolveSpec, onImport } = require('./paths.cjs')

module.exports = {
  meta: {
    type: 'problem',
    schema: [{ type: 'object', properties: { open: { type: 'array', items: { type: 'string' } } }, additionalProperties: false }],
    messages: {
      deep: "Import '@/features/{{feature}}', not '{{path}}' inside it.",
      self: "Inside feature '{{feature}}', import with a relative path, not '{{spec}}'.",
    },
  },
  create(context) {
    const { open = [] } = context.options[0] ?? {}
    const src = srcOf(context.filename)
    if (!src) return {}
    const own = featureOf(src, context.filename)
    return onImport((node) => {
      if (typeof node?.value !== 'string') return
      const spec = node.value
      const target = resolveSpec(src, spec, context.filename)
      const hit = target && featureOf(src, target)
      if (!hit) return
      if (own && own.name === hit.name) {
        if (spec.startsWith('@/')) context.report({ node, messageId: 'self', data: { feature: own.name, spec } })
        return
      }
      const sub = hit.rest.join('/').replace(/\.tsx?$/, '')
      if (sub === '' || sub === 'index') return
      if (open.some((p) => (p.endsWith('/') ? sub.startsWith(p) : sub === p))) return
      context.report({ node, messageId: 'deep', data: { feature: hit.name, path: sub } })
    })
  },
}
