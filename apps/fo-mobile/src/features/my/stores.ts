import { create } from 'zustand'
import type { MySource } from './types'

export const useDocImport = create<{ requested: boolean }>(() => ({ requested: false }))

export const useDocDelete = create<{ doc: Pick<MySource, 'id' | 'fileName'> | null }>(() => ({ doc: null }))
