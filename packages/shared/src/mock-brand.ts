// Board colours for the mock fixtures. Mock builds only (web ?mock, app EXPO_PUBLIC_API_MOCK), so it is a separate entry.
import { registerBrandColors } from './brand-of'

export const MOCK_BRAND_COLORS: Record<string, string> = {
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
  김서준: '#3B5BDB',
  김태윤: '#3B5BDB',
  서준호: '#495057',
  최지우: '#5F3DC4',
  윤채원: '#862E9C',
  이민아: '#C2255C',
  한수아: '#C2255C',
  오지현: '#E8590C',
  박도윤: '#0C8599',
  한지호: '#0C8599',
  이하은: '#0C8599',
  오예린: '#1864AB',
  정민재: '#2F9E44',
}

export const registerMockBrandColors = () => registerBrandColors(MOCK_BRAND_COLORS)
