const hasJsx = (sourceCode) => sourceCode.ast.tokens.some((t) => t.type === 'JSXIdentifier' || t.type === 'JSXText')

module.exports = {
  meta: {
    type: 'suggestion',
    schema: [],
    messages: {
      missing: 'Declare the component as a const arrow function and add `export default Component`.',
      inline: 'Declare the component first, then `export default Component` on its own line.',
      named: "Component '{{name}}' is a named export. Give it its own file with a default export.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode
    return {
      Program(program) {
        if (!hasJsx(sourceCode)) return
        let found = false
        for (const node of program.body) {
          if (node.type === 'ExportDefaultDeclaration') {
            found = true
            if (node.declaration.type !== 'Identifier') context.report({ node, messageId: 'inline' })
          }
          if (node.type === 'ExportNamedDeclaration') {
            const decls = node.declaration?.declarations ?? (node.declaration?.id ? [node.declaration] : [])
            for (const d of decls) {
              const name = d.id?.name
              if (name && /^[A-Z]/.test(name) && d.init?.type !== 'Literal' && !/^[A-Z0-9_]+$/.test(name)) {
                context.report({ node: d, messageId: 'named', data: { name } })
              }
            }
            for (const s of node.specifiers ?? []) {
              if (s.exported.name === 'default') found = true
            }
          }
        }
        if (!found) context.report({ node: program, messageId: 'missing' })
      },
    }
  },
}
