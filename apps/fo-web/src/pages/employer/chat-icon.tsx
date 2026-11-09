import type { SVGProps } from 'react'

const PATHS = {
  at: 'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-3.5 7.1',
  send: 'M12 19.5v-15M5.5 11 12 4.5 18.5 11',
  shield: 'M12 3.5 19.5 6.5v5c0 4.5-3.2 8-7.5 9-4.3-1-7.5-4.5-7.5-9v-5Z',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  clock: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 7v5l3 2',
  gauge: 'M4 17a8 8 0 1 1 16 0M12 17l4-5',
  copy: 'M9 9h10v11H9ZM5 15V4h10',
} as const

type ChatIconProps = { name: keyof typeof PATHS; size?: number; width?: number } & Omit<SVGProps<SVGSVGElement>, 'name' | 'width'>

const ChatIcon = ({ name, size = 20, width = 2.2, ...rest }: ChatIconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: 'none' }} {...rest}>
    <path d={PATHS[name]} />
  </svg>
)

export const StopIcon = () => (
  <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden="true" style={{ flex: 'none' }}>
    <rect x="6" y="6" width="12" height="12" rx="2.5" fill="currentColor" />
  </svg>
)

export default ChatIcon
