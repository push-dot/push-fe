import { ApiError } from './errors'

/**
 * Runs a document write at its current revision (read first when `known` is missing).
 * A write that lands in between answers 409 REVISION_CONFLICT with the server's revision; the user's intent still stands, so it retries once there.
 */
export const atDocumentRevision = async <T>(
  documents: { get: (id: string) => Promise<{ revision: number }> },
  id: string,
  write: (revision: number) => Promise<T>,
  known?: number,
): Promise<T> => {
  const revision = known ?? (await documents.get(id)).revision
  try {
    return await write(revision)
  } catch (error) {
    const current = error instanceof ApiError && error.code === 'REVISION_CONFLICT' ? Number(error.details?.currentRevision) : NaN
    if (!Number.isInteger(current) || current === revision) throw error
    return write(current)
  }
}
