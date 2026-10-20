import { useFileDrop as useFileDropSubscription } from '@/shared/lib/file-drop'
import { usePendingFiles } from './stores'

export const useFileDrop = () =>
  useFileDropSubscription((files) => usePendingFiles.getState().add(files))
