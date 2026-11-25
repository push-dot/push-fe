const path = require('node:path')

const srcOf = (filename) => {
  const marker = `${path.sep}src${path.sep}`
  const at = filename.lastIndexOf(marker)
  return at === -1 ? null : filename.slice(0, at + marker.length - 1)
}

const inside = (dir, file) => {
  const rel = path.relative(dir, file)
  return rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel)
}

const featureOf = (src, file) => {
  const features = path.join(src, 'features')
  if (!inside(features, file)) return null
  const [name, ...rest] = path.relative(features, file).split(path.sep)
  return { name, rest }
}

const resolveSpec = (src, spec, filename) => {
  if (spec.startsWith('@/')) return path.join(src, spec.slice(2))
  if (spec.startsWith('.')) return path.resolve(path.dirname(filename), spec)
  return null
}

const onImport = (check) => ({
  ImportDeclaration: (n) => check(n.source),
  ExportAllDeclaration: (n) => check(n.source),
  ExportNamedDeclaration: (n) => n.source && check(n.source),
  ImportExpression: (n) => check(n.source),
})

module.exports = { srcOf, inside, featureOf, resolveSpec, onImport }
