import { CAREER_RANGES } from './constants'

const BULLET = '· '

// The board draws one "· " per line; the API stores plain lines.
export const stripBullets = (text: string) =>
  text
    .split('\n')
    .map((line) => line.replace(/^\s*[·•]\s?/, '').trim())
    .filter(Boolean)

export const withBullets = (text: string) => stripBullets(text).map((line) => BULLET + line).join('\n')

// Enter inside a bulleted field starts the next bullet.
export const nextBullet = (value: string, at: number) => ({
  value: `${value.slice(0, at)}\n${BULLET}${value.slice(at)}`,
  caret: at + 1 + BULLET.length,
})

// An older posting may sit between two ranges (careerMin 5 is 4–6년): the select shows the closest range below.
export const careerRangeOf = (careerMin: number) =>
  [...CAREER_RANGES].reverse().find((range) => careerMin >= range.min) ?? CAREER_RANGES[0]
