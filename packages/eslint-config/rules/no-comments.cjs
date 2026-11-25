const KEEP = /^\s*(eslint|@ts-|global\s|\/\s*<reference|prettier-ignore|istanbul|c8\s|@vitest-environment|@jsx)/

const lineStart = (text, index) => text.lastIndexOf('\n', index - 1) + 1

const lineEnd = (text, index) => {
  const at = text.indexOf('\n', index)
  return at === -1 ? text.length : at + 1
}

const removalRange = (sourceCode, comment) => {
  const text = sourceCode.text
  const [start, end] = comment.range
  const before = sourceCode.getTokenBefore(comment, { includeComments: true })
  const after = sourceCode.getTokenAfter(comment, { includeComments: true })
  const container = sourceCode.getNodeByRangeIndex(start)
  if (/^JSX(ExpressionContainer|EmptyExpression)$/.test(container?.type ?? '') && before?.value === '{' && after?.value === '}') {
    const s = before.range[0]
    const e = after.range[1]
    const ls = lineStart(text, s)
    const le = lineEnd(text, e)
    if (/^\s*$/.test(text.slice(ls, s)) && /^\s*$/.test(text.slice(e, le))) return [ls, le]
    return [s, e]
  }
  const ls = lineStart(text, start)
  const le = lineEnd(text, end)
  if (/^\s*$/.test(text.slice(ls, start)) && /^\s*$/.test(text.slice(end, le))) return [ls, le]
  let s = start
  while (s > ls && /[ \t]/.test(text[s - 1])) s -= 1
  return [s, end]
}

module.exports = {
  meta: { type: 'suggestion', fixable: 'code', schema: [], messages: { comment: 'No comments. Code alone must express intent.' } },
  create(context) {
    const sourceCode = context.sourceCode
    return {
      Program() {
        for (const comment of sourceCode.getAllComments()) {
          if (comment.type === 'Shebang' || KEEP.test(comment.value)) continue
          context.report({ loc: comment.loc, messageId: 'comment', fix: (fixer) => fixer.removeRange(removalRange(sourceCode, comment)) })
        }
      },
    }
  },
}
