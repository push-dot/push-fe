import { create } from 'zustand'

type PendingFilesState = {
  files: File[]
  add: (files: File[]) => void
  remove: (index: number) => void
  clear: () => void
}

export const usePendingFiles = create<PendingFilesState>()((set) => ({
  files: [],
  add: (files) => set((s) => ({ files: [...s.files, ...files] })),
  remove: (index) => set((s) => ({ files: s.files.filter((_, i) => i !== index) })),
  clear: () => set({ files: [] }),
}))
