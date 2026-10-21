import { FRAME_SEPARATOR } from './constants'

export const parseFrame = function* <T>(frame: string): Generator<T | { type: 'error'; error: { code: string; message: string } }> {
  for (const line of frame.split(/\r?\n/)) {
    if (!line.startsWith('data:')) continue
    try {
      yield JSON.parse(line.slice(5).trimStart()) as T
    } catch {
      yield { type: 'error', error: { code: 'STREAM_PARSE', message: 'malformed stream frame' } }
    }
  }
}

export const readEvents = async function* <T>(body: ReadableStream<Uint8Array>, signal?: AbortSignal) {
  const reader = body.getReader()
  const onAbort = () => void reader.cancel()
  signal?.addEventListener('abort', onAbort)
  try {
    const decoder = new TextDecoder()
    let buf = ''
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      buf += decoder.decode(value, { stream: true })
      let match = buf.match(FRAME_SEPARATOR)
      while (match?.index !== undefined) {
        yield* parseFrame<T>(buf.slice(0, match.index))
        buf = buf.slice(match.index + match[0].length)
        match = buf.match(FRAME_SEPARATOR)
      }
    }
    if (buf.trim()) yield* parseFrame<T>(buf)
  } finally {
    signal?.removeEventListener('abort', onAbort)
    void reader.cancel()
  }
}
