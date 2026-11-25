const path = require('node:path')

const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/

module.exports = {
  meta: { type: 'suggestion', schema: [], messages: { kebab: "File name '{{name}}' must be kebab-case." } },
  create(context) {
    const name = path.basename(context.filename)
    const stem = name.split('.')[0]
    return {
      Program(node) {
        if (!KEBAB.test(stem)) context.report({ node, messageId: 'kebab', data: { name } })
      },
    }
  },
}
