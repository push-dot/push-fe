// Hands a fetched blob to the browser's download, under the given file name.
export const saveFile = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  // Safari reads the blob after click() returns, so the URL lives a little longer.
  setTimeout(() => URL.revokeObjectURL(url), 30_000)
}
