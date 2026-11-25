module.exports = {
  meta: {
    type: 'problem',
    schema: [{ type: 'object', properties: { modules: { type: 'array', items: { type: 'string' } } }, additionalProperties: false }],
    messages: {
      fetch: 'Presentation must not call fetch. Move the HTTP call to the feature api/fetchers.ts.',
      module: "Presentation must not import '{{name}}'. Go through the feature api/ hooks.",
    },
  },
  create(context) {
    const { modules = [] } = context.options[0] ?? {}
    return {
      CallExpression(node) {
        if (node.callee.type === 'Identifier' && node.callee.name === 'fetch') context.report({ node, messageId: 'fetch' })
      },
      ImportDeclaration(node) {
        if (node.importKind === 'type') return
        if (modules.includes(node.source.value)) context.report({ node, messageId: 'module', data: { name: node.source.value } })
      },
    }
  },
}
