import type { LegalBlock } from './types'

export const p = (text: string): LegalBlock => ({ kind: 'paragraph', text })
export const ol = (...items: string[]): LegalBlock => ({ kind: 'list', ordered: true, items })
export const ul = (...items: string[]): LegalBlock => ({ kind: 'list', ordered: false, items })
export const table = (columns: readonly string[], ...rows: (readonly string[])[]): LegalBlock => ({ kind: 'table', columns, rows })
