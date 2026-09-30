import { create } from 'zustand'
import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next, useTranslation } from 'react-i18next'
import ko from './locales/ko/translation.json'
import en from './locales/en/translation.json'
import ja from './locales/ja/translation.json'
import vi from './locales/vi/translation.json'

export const SUPPORTED_LOCALES = ['ko', 'en', 'ja', 'vi'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]

const FALLBACK_LOCALE: Locale = 'ko'
const LOCALE_KEY = 'push-locale'

// Resources live in `locales/{lng}/{ns}.json` — the same layout locize uses.
// Optional locize hookup: set VITE_LOCIZE_PROJECT_ID (and VITE_LOCIZE_API_KEY to
// publish missing keys) at build time and translations are loaded from locize,
// with bundled resources still covering offline/fallback via
// `partialBundledLanguages`. Unset = fully offline, no locize calls are made.
const locizeProjectId = import.meta.env.VITE_LOCIZE_PROJECT_ID as string | undefined
const locizeApiKey = import.meta.env.VITE_LOCIZE_API_KEY as string | undefined

const resources = {
  ko: { translation: ko },
  en: { translation: en },
  ja: { translation: ja },
  vi: { translation: vi },
}

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation'
    resources: { translation: typeof ko }
  }
}

type NestedKeys<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${NestedKeys<T[K]>}`
}[keyof T & string]

export type MsgKey = NestedKeys<typeof ko>

const normalizeLocale = (lng: string | null | undefined): Locale => {
  const base = (lng ?? '').split('-')[0]
  return (SUPPORTED_LOCALES as readonly string[]).includes(base)
    ? (base as Locale)
    : FALLBACK_LOCALE
}

type I18nState = {
  locale: Locale
  setLocale: (locale: Locale) => void
}

export const useLocaleStore = create<I18nState>()((set) => ({
  locale: normalizeLocale(localStorage.getItem(LOCALE_KEY)),
  setLocale: (locale) => {
    set({ locale })
    void i18n.changeLanguage(locale)
  },
}))

i18n.on('languageChanged', (lng) => {
  useLocaleStore.setState({ locale: normalizeLocale(lng) })
})

const initI18n = async () => {
  let instance = i18n.use(LanguageDetector).use(initReactI18next)
  if (locizeProjectId) {
    const { default: LocizeBackend } = await import('i18next-locize-backend')
    instance = instance.use(LocizeBackend)
  }
  await instance.init({
    resources,
    fallbackLng: FALLBACK_LOCALE,
    supportedLngs: [...SUPPORTED_LOCALES],
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    defaultNS: 'translation',
    returnNull: false,
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LOCALE_KEY,
      caches: ['localStorage'],
    },
    react: { useSuspense: false },
    ...(locizeProjectId
      ? {
          partialBundledLanguages: true,
          saveMissing: Boolean(locizeApiKey),
          backend: {
            projectId: locizeProjectId,
            apiKey: locizeApiKey,
            referenceLng: 'en',
          },
        }
      : {}),
  })
  useLocaleStore.setState({ locale: normalizeLocale(i18n.language) })
}

export const i18nReady = initI18n()

export const t = (key: MsgKey): string => i18n.t(key)

export const useT = () => {
  const { t } = useTranslation()
  return t
}

export default i18n
