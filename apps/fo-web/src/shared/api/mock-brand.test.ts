import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { brandColor } from '@push/shared'
import { describe, expect, it } from 'vitest'
import { createSessionStore } from '../auth/session'
import { applyMockSearch } from '../../app/mock-bootstrap'
import { MOCK_BRAND_COLORS } from '@push/shared/mock-brand'

const store = () => createSessionStore({ getItem: () => null, setItem: () => {}, removeItem: () => {} })

const sourceFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? sourceFiles(join(dir, entry.name)) : /\.tsx?$/.test(entry.name) ? [join(dir, entry.name)] : [],
  )

describe('mock brand colours', () => {
  it('keeps the palette pick until the mock url registers the board colours', async () => {
    await applyMockSearch('', store())
    expect(brandColor('누리클라우드')).not.toBe('#2B8A3E')
    await applyMockSearch('?mock&as=personal', store())
    expect(brandColor('누리클라우드')).toBe('#2B8A3E')
    expect(brandColor('김서준')).toBe('#3B5BDB')
    expect(brandColor('이지우')).not.toBe(brandColor('최지우'))
  })

  it('names the fixtures only in the mock layer', () => {
    const src = fileURLToPath(new URL('../..', import.meta.url))
    const leaks = sourceFiles(src)
      .filter((file) => !/shared\/api\/mock[^/]*\.ts$|\.test\.tsx?$/.test(file))
      .filter((file) => Object.keys(MOCK_BRAND_COLORS).some((name) => readFileSync(file, 'utf8').includes(name)))
    expect(leaks).toEqual([])
  })
})
