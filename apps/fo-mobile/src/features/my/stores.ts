import { create } from 'zustand'
import type { PickedFile } from './types'

export const useDocImport = create<{ file: PickedFile | null }>(() => ({ file: null }))
