const BOARD_PALETTE = [
  '#1F3A8A', '#862E9C', '#343A40', '#2B8A3E', '#E67700', '#C2255C', '#364FC7', '#1864AB',
  '#0C8599', '#5F3DC4', '#495057', '#D9480F', '#3B5BDB', '#E8590C', '#2F9E44',
]

const overrides = new Map<string, string>()

const charSum = (name: string) => [...name].reduce((a, ch) => a + ch.charCodeAt(0), 0)

export const brandColor = (key: string) => overrides.get(key) ?? BOARD_PALETTE[charSum(key) % BOARD_PALETTE.length]!

export const registerBrandColors = (colors: Record<string, string>) => {
  for (const [key, color] of Object.entries(colors)) overrides.set(key, color)
}
