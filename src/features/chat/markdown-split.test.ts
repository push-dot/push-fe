import { describe, expect, it } from 'vitest'
import { splitStableMarkdown } from './markdown-split'

describe('splitStableMarkdown', () => {
  it('returns the whole text as tail when no block boundary exists', () => {
    expect(splitStableMarkdown('hello world')).toEqual({
      stable: '',
      tail: 'hello world',
    })
  })

  it('splits at the last blank line', () => {
    const text = 'para one\n\npara two\n\npartial'
    expect(splitStableMarkdown(text)).toEqual({
      stable: 'para one\n\npara two\n\n',
      tail: 'partial',
    })
  })

  it('keeps blank lines inside a code fence in the tail', () => {
    const text = 'intro\n\n```ts\nconst a = 1\n\nconst b = 2'
    expect(splitStableMarkdown(text)).toEqual({
      stable: 'intro\n\n',
      tail: '```ts\nconst a = 1\n\nconst b = 2',
    })
  })

  it('marks text through a closed fence as stable', () => {
    const text = 'intro\n\n```ts\nconst a = 1\n\nconst b = 2\n```\ntail'
    expect(splitStableMarkdown(text)).toEqual({
      stable: 'intro\n\n```ts\nconst a = 1\n\nconst b = 2\n```\n',
      tail: 'tail',
    })
  })

  it('supports tilde fences', () => {
    const text = '~~~\ncode\n\n~~~\ndone'
    expect(splitStableMarkdown(text)).toEqual({
      stable: '~~~\ncode\n\n~~~\n',
      tail: 'done',
    })
  })

  it('treats a table separator region as plain text', () => {
    const text = '| a | b |\n| - | - |\n| 1 | 2 |\n\nrest'
    expect(splitStableMarkdown(text)).toEqual({
      stable: '| a | b |\n| - | - |\n| 1 | 2 |\n\n',
      tail: 'rest',
    })
  })
})
