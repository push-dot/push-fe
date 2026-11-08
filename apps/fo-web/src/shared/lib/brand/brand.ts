import { brandOf } from '@push/shared'

const COMPANY_COLORS: Record<string, string> = {
  모아페이: '#1F3A8A',
  파도AI: '#862E9C',
  도토리증권: '#343A40',
  누리클라우드: '#2B8A3E',
  그린티켓: '#E67700',
  새벽마켓: '#C2255C',
  라온헬스: '#364FC7',
  별빛게임즈: '#1864AB',
  하루랩스: '#0C8599',
  온새미로: '#5F3DC4',
  바름로지스: '#495057',
  솔빛에너지: '#D9480F',
}

const PERSON_COLORS: Record<string, string> = {
  서준: '#3B5BDB',
  태윤: '#3B5BDB',
  준호: '#495057',
  지우: '#5F3DC4',
  채원: '#862E9C',
  민아: '#C2255C',
  수아: '#C2255C',
  지현: '#E8590C',
  도윤: '#0C8599',
  지호: '#0C8599',
  하은: '#0C8599',
  예린: '#1864AB',
  민재: '#2F9E44',
}

const PERSON_PALETTE = ['#3B5BDB', '#0C8599', '#C2255C', '#5F3DC4', '#E8590C', '#2F9E44', '#495057', '#1864AB', '#862E9C']

const charSum = (name: string) => [...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0)

export const companyColor = (name: string) => {
  const key = Object.keys(COMPANY_COLORS).find((company) => name.includes(company))
  return key ? COMPANY_COLORS[key]! : brandOf(name)
}

export const personColor = (name: string) => {
  const key = Object.keys(PERSON_COLORS).find((given) => name.includes(given))
  return key ? PERSON_COLORS[key]! : PERSON_PALETTE[charSum(name) % PERSON_PALETTE.length]!
}

export const brandGradient = (color: string) => `linear-gradient(140deg, ${color} 0%, color-mix(in srgb, ${color} 55%, #000) 100%)`
