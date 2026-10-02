import { createI18n } from 'vue-i18n'
import zh from './zh'
import en from './en'

export type AppLocale = 'zh' | 'en'

const LOCALE_KEY = 'locale'

function getInitialLocale(): AppLocale {
  const saved = localStorage.getItem(LOCALE_KEY)
  return saved === 'en' || saved === 'zh' ? saved : 'zh'
}

export const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: 'en',
  messages: {
    zh,
    en,
  },
})

export function setLocale(lang: AppLocale) {
  i18n.global.locale.value = lang
  localStorage.setItem(LOCALE_KEY, lang)
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
}

document.documentElement.lang = getInitialLocale() === 'zh' ? 'zh-CN' : 'en'
