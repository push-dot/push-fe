import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { answerBody, type A2uiFrame, type A2uiVersion } from '../a2ui'

const dir = join(__dirname, '../a2ui-fixtures')
const SETS = { 'v0.9.1': dir, '1.0': join(dir, 'v1.0') } as const
const names = (set: string) => readdirSync(set).filter((name) => name.endsWith('.json'))
const fixture = (name: string, set: string = dir) => JSON.parse(readFileSync(join(set, name), 'utf8')) as A2uiFrame & { seq: number }
const picked = (frame: A2uiFrame) =>
  (frame.messages.flatMap((m) => ('updateDataModel' in m ? [m.updateDataModel.value] : []))[0] as { picked: string[] }).picked

describe('answerBody', () => {
  it('sends one picked id alone', () => {
    expect(answerBody('pick', ['ready'])).toEqual({ optionId: 'ready' })
  })

  it('sends the first picked id and all of them when several are picked', () => {
    expect(answerBody('pick', ['resume', 'cover_letter'])).toEqual({ optionId: 'resume', optionIds: ['resume', 'cover_letter'] })
  })

  it('sends "submit" first for a submit answer', () => {
    expect(answerBody('submit', ['resume', 'm_file', 'preserve'])).toEqual({ optionId: 'submit', optionIds: ['submit', 'resume', 'm_file', 'preserve'] })
  })

  it('refuses a pick with nothing picked', () => {
    expect(() => answerBody('pick', [])).toThrow()
  })

  it('matches what the server bakes into an answered fixture', () => {
    expect(answerBody('submit', ['resume', 'm_file', 'preserve']).optionIds).toEqual(picked(fixture('choice-sections-answered.json')))
    expect(answerBody('pick', ['resume', 'cover_letter']).optionIds).toEqual(picked(fixture('choice-multiple-answered.json')))
  })
})

describe('a2ui fixtures', () => {
  it.each(Object.entries(SETS) as [A2uiVersion, string][])('in %s are a2ui frames of one surface, a full snapshot each', (version, set) => {
    expect(names(set)).toHaveLength(23)
    for (const name of names(set)) {
      const frame = fixture(name, set)
      expect(frame.type, name).toBe('a2ui')
      expect(name.startsWith(frame.kind), name).toBe(true)
      expect(frame.messages.map((m) => Object.keys(m).find((key) => key !== 'version')), name).toEqual(['createSurface', 'updateComponents', 'updateDataModel'])
      for (const m of frame.messages) {
        expect(m.version, name).toBe(version)
        expect(Object.values(m).find((part) => typeof part === 'object'), name).toMatchObject({ surfaceId: frame.surfaceId })
      }
    }
  })

  it('hold the same cases in both versions, the same frame outside messages', () => {
    expect(names(SETS['1.0'])).toEqual(names(SETS['v0.9.1']))
    for (const name of names(dir)) {
      const { messages: _old, ...v091 } = fixture(name, SETS['v0.9.1'])
      const { messages: _new, ...v1 } = fixture(name, SETS['1.0'])
      expect(v1, name).toEqual(v091)
    }
  })
})
