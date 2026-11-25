const METHOD_PARENTS = new Set(['MethodDefinition', 'TSAbstractMethodDefinition'])

module.exports = {
  meta: { type: 'suggestion', schema: [], messages: { arrow: 'Use a const arrow function: `const name = () => {}`.' } },
  create(context) {
    const report = (node) => context.report({ node, messageId: 'arrow' })
    return {
      FunctionDeclaration(node) {
        if (!node.generator && node.body) report(node)
      },
      FunctionExpression(node) {
        if (node.generator || METHOD_PARENTS.has(node.parent.type)) return
        if (node.parent.type === 'Property' && (node.parent.method || node.parent.kind !== 'init')) return
        report(node)
      },
    }
  },
}
