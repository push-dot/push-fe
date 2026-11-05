import { readFileSync, readdirSync } from 'node:fs'
import { OUTPUTS, SOURCES } from './constants.ts'
import { buildTokens, renderCss, renderIcons, renderTokens } from './render.ts'

export const sourceUrl = (path: string) => new URL(`../${path}`, import.meta.url)

export const readSource = (path: string) => readFileSync(sourceUrl(path), 'utf8')

const readSvgs = (dir: string) =>
  Object.fromEntries(
    readdirSync(sourceUrl(dir))
      .filter((file) => file.endsWith('.svg'))
      .sort()
      .map((file) => [file.slice(0, -'.svg'.length), readSource(`${dir}/${file}`)]),
  )

export const outputs = () => {
  const model = buildTokens(
    JSON.parse(readSource(SOURCES.designSystem)),
    JSON.parse(readSource(SOURCES.app)),
  )
  return {
    [OUTPUTS.tokens]: renderTokens(model),
    [OUTPUTS.css]: renderCss(model),
    [OUTPUTS.icons]: renderIcons(readSvgs(SOURCES.icons), readSvgs(SOURCES.icons3d), readSvgs(SOURCES.brand)),
  }
}
