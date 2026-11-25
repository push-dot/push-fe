module.exports = {
  meta: { type: 'suggestion', schema: [], messages: { inline: 'No inline `style={{}}`. Move it into the stylesheet.' } },
  create(context) {
    return {
      JSXAttribute(node) {
        if (!/^(style|contentContainerStyle)$/.test(node.name.name)) return
        const expr = node.value?.type === 'JSXExpressionContainer' ? node.value.expression : null
        if (expr?.type === 'ObjectExpression') context.report({ node, messageId: 'inline' })
      },
    }
  },
}
