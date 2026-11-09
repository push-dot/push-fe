import type { ReactNode } from 'react'

export type ShortcutKey = 'jobs' | 'bookmarks' | 'activity'

const ART: Record<ShortcutKey, ReactNode> = {
  jobs: (
    <>
      <defs>
      <linearGradient id="jobs-b1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#A397FF" /><stop offset=".55" stopColor="#6C5CF5" /><stop offset="1" stopColor="#4433D6" /></linearGradient>
      <linearGradient id="jobs-b2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5B4CF0" /><stop offset="1" stopColor="#3626B8" /></linearGradient>
      <linearGradient id="jobs-b3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFE08A" /><stop offset="1" stopColor="#F5A623" /></linearGradient>
      <radialGradient id="jobs-sh"><stop offset="0" stopColor="#000" stopOpacity=".22" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient></defs>
      <ellipse cx="24" cy="43.5" rx="16" ry="3" fill="url(#jobs-sh)" />
      <path d="M17 13.5a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4V16h-3.4v-2.2a1 1 0 0 0-1-1h-5.2a1 1 0 0 0-1 1V16H17Z" fill="url(#jobs-b2)" />
      <rect x="5" y="15" width="38" height="25" rx="7" fill="url(#jobs-b1)" />
      <path d="M5 24.5c6 3.2 12.5 4.6 19 4.6s13-1.4 19-4.6V22c-6 3.2-12.5 4.6-19 4.6S11 25.2 5 22Z" fill="#3A2AC4" opacity=".35" />
      <rect x="20.5" y="24" width="7" height="6" rx="2" fill="url(#jobs-b3)" />
      <path d="M10 17.5h18c-5 1.2-12 3.4-16.5 7.5-.9-.7-1.5-2-1.5-3.4Z" fill="#FFFFFF" opacity=".35" />
    </>
  ),
  bookmarks: (
    <>
      <defs>
      <linearGradient id="bookmarks-k1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFC56B" /><stop offset=".5" stopColor="#FF8A2A" /><stop offset="1" stopColor="#E9580C" /></linearGradient>
      <linearGradient id="bookmarks-k2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#FFFFFF" stopOpacity=".55" /><stop offset="1" stopColor="#FFFFFF" stopOpacity="0" /></linearGradient>
      <radialGradient id="bookmarks-sh2"><stop offset="0" stopColor="#000" stopOpacity=".22" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient></defs>
      <ellipse cx="24" cy="44" rx="13" ry="2.8" fill="url(#bookmarks-sh2)" />
      <path d="M13 9a5 5 0 0 1 5-5h12a5 5 0 0 1 5 5v31.5a1.5 1.5 0 0 1-2.4 1.2L24 35.4l-8.6 6.3A1.5 1.5 0 0 1 13 40.5Z" fill="url(#bookmarks-k1)" />
      <path d="M16 8.5a3 3 0 0 1 3-3h4v29.6l-7 5.1Z" fill="url(#bookmarks-k2)" />
      <path d="M33 7.5c1 .9 1.5 2 1.5 3.3v28.6l-1.5-1.1Z" fill="#C24A05" opacity=".3" />
    </>
  ),
  activity: (
    <>
      <defs>
      <linearGradient id="activity-c1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7BF0BC" /><stop offset="1" stopColor="#12A866" /></linearGradient>
      <linearGradient id="activity-c2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8FB6FF" /><stop offset="1" stopColor="#3B6FF0" /></linearGradient>
      <linearGradient id="activity-c3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#B1A7FF" /><stop offset="1" stopColor="#5B4CF0" /></linearGradient>
      <radialGradient id="activity-sh3"><stop offset="0" stopColor="#000" stopOpacity=".2" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient></defs>
      <ellipse cx="24" cy="43.5" rx="17" ry="3" fill="url(#activity-sh3)" />
      <rect x="6" y="24" width="10" height="17" rx="3.5" fill="url(#activity-c2)" />
      <rect x="19" y="14" width="10" height="27" rx="3.5" fill="url(#activity-c3)" />
      <rect x="32" y="6" width="10" height="35" rx="3.5" fill="url(#activity-c1)" />
      <rect x="8" y="26" width="3" height="12" rx="1.5" fill="#FFFFFF" opacity=".4" />
      <rect x="21" y="16" width="3" height="22" rx="1.5" fill="#FFFFFF" opacity=".4" />
      <rect x="34" y="8" width="3" height="30" rx="1.5" fill="#FFFFFF" opacity=".45" />
    </>
  ),
}

const ShortcutArt = ({ name }: { name: ShortcutKey }) => (
  <svg viewBox="0 0 48 48" width="76" height="76" aria-hidden="true">
    {ART[name]}
  </svg>
)

export default ShortcutArt
