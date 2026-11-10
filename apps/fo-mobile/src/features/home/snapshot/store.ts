import * as SecureStore from 'expo-secure-store'
import { HOME_SNAPSHOT_MAX_AGE_MS, HOME_SNAPSHOT_VERSION, homeSnapshotStorageKey } from './constants'
import type { HomeSnapshot } from './types'

const isFresh = (savedAt: number, now = Date.now()) => now - savedAt <= HOME_SNAPSHOT_MAX_AGE_MS

export const parseHomeSnapshot = (raw: string | null, now = Date.now()): HomeSnapshot | null => {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as HomeSnapshot
    if (parsed.version !== HOME_SNAPSHOT_VERSION) return null
    if (!isFresh(parsed.savedAt, now)) return null
    if (!parsed.sections?.latest || !parsed.sections?.deadline || !parsed.sections?.popular) return null
    if (!parsed.notifications) return null
    return parsed
  } catch {
    return null
  }
}

export const readHomeSnapshot = async (userId: string, now = Date.now()) =>
  parseHomeSnapshot(await SecureStore.getItemAsync(homeSnapshotStorageKey(userId)), now)

export const writeHomeSnapshot = async (userId: string, snapshot: HomeSnapshot) => {
  await SecureStore.setItemAsync(homeSnapshotStorageKey(userId), JSON.stringify(snapshot))
}

export const clearHomeSnapshot = async (userId: string) => {
  await SecureStore.deleteItemAsync(homeSnapshotStorageKey(userId))
}
