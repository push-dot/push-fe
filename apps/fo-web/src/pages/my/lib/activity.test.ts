import type { Application, CalendarEvent } from '@push/api-client'
import { describe, expect, it } from 'vitest'

import { FIT_NOTE } from '../constants'
import { applyCounts, appliedLine, dayChip, dayTitle, eventsOn, eventTone, filterApplications, followLine, monthCells, sameDay, stageTone, timeChip } from '.'

const app = (id: string, stage: Application['stage']) => ({ id, stage })

describe('apply filter', () => {
  const items = [app('a', 'INTERVIEW'), app('b', 'SCREENING'), app('c', 'APPLIED'), app('d', 'ACCEPTED'), app('e', 'REJECTED')]

  it('counts 전체 / 진행 중 / 끝남 like the board (5 / 3 / 2)', () => {
    expect(applyCounts(items)).toEqual({ all: 5, active: 3, done: 2 })
  })

  it('filters by phase', () => {
    expect(filterApplications(items, 'all')).toHaveLength(5)
    expect(filterApplications(items, 'active').map((item) => item.id)).toEqual(['a', 'b', 'c'])
    expect(filterApplications(items, 'done').map((item) => item.id)).toEqual(['d', 'e'])
  })

  it('tones each stage badge', () => {
    expect(['INTERVIEW', 'SCREENING', 'APPLIED', 'ACCEPTED', 'REJECTED'].map((stage) => stageTone(stage as Application['stage']))).toEqual([
      'orange',
      'ac',
      'grey',
      'green',
      'red',
    ])
  })

  it('reads company and applied date', () => {
    expect(appliedLine({ company: '모아페이', appliedAt: new Date(2026, 9, 20, 10).toISOString(), createdAt: '' })).toBe('모아페이 · 10월 20일 지원')
  })

  it('names the agent in the fit note', () => {
    expect(FIT_NOTE).toContain('앱의 에이전트에서')
  })
})

describe('calendar grid', () => {
  it('starts October 2026 on Thursday and ends on Saturday', () => {
    expect(monthCells(new Date(2026, 9, 1))).toEqual({ lead: 4, days: 31, trail: 0 })
  })

  it('pads the last week of a month that ends mid-week', () => {
    expect(monthCells(new Date(2026, 10, 1))).toEqual({ lead: 0, days: 30, trail: 5 })
  })

  it('matches today by local day', () => {
    expect(sameDay(new Date(2026, 9, 23, 23, 59), new Date(2026, 9, 23, 0, 1))).toBe(true)
    expect(sameDay(new Date(2026, 9, 23), new Date(2026, 9, 24))).toBe(false)
  })

  const event = (id: string, type: CalendarEvent['type'], startsAt: Date) => ({ id, type, startsAt: startsAt.toISOString() })

  it('puts the interview before an earlier reminder on the same day', () => {
    const day = new Date(2026, 9, 23)
    const list = [event('remind', 'FOLLOW_UP', new Date(2026, 9, 23, 10)), event('meet', 'INTERVIEW', new Date(2026, 9, 23, 14)), event('other', 'DEADLINE', new Date(2026, 9, 22))]
    expect(eventsOn(list, day).map((item) => item.id)).toEqual(['meet', 'remind'])
  })

  it('tones events by kind', () => {
    expect(['INTERVIEW', 'DEADLINE', 'FOLLOW_UP', 'COFFEE_CHAT', 'CUSTOM'].map((type) => eventTone(type as CalendarEvent['type']))).toEqual([
      'orange',
      'red',
      'grey',
      'green',
      'ac',
    ])
  })

  it('formats the day card and the add dialog fields', () => {
    expect(dayTitle(new Date(2026, 9, 23))).toBe('10월 23일 금요일')
    expect(dayChip(new Date(2026, 9, 23))).toBe('10월 23일 (금)')
    expect(timeChip('14:00')).toBe('오후 2:00')
    expect(timeChip('00:05')).toBe('오전 12:05')
  })
})

describe('followLine', () => {
  it('reads 직군 · N년', () => {
    expect(followLine({ jobCategory: 'dev', tenureYears: 5 })).toBe('개발 · 5년')
    expect(followLine({ jobCategory: null, tenureYears: null })).toBe('')
  })
})
